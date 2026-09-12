import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { contributionReference, memberCode } from "@/lib/codes";

export const runtime = "nodejs";

type CheckoutBody = {
  contributionType?: string;
  amount?: number;
  name?: string;
  phone?: string;
  email?: string;
};

const CURRENCY = "SLE";
const MINOR_UNIT_FACTOR = 100; // Monime uses minor units

export async function POST(request: Request) {
  let body: CheckoutBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const contributionType = String(body.contributionType || "").trim();
  const amount = Number(body.amount);
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const email = String(body.email || "").trim() || null;

  if (!contributionType) {
    return NextResponse.json(
      { error: "Please select a contribution type." },
      { status: 400 }
    );
  }
  if (!Number.isFinite(amount) || amount < 1) {
    return NextResponse.json(
      { error: "Please enter a valid contribution amount." },
      { status: 400 }
    );
  }
  if (!name) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json(
      { error: "Please enter your mobile money number." },
      { status: 400 }
    );
  }

  const apiKey = process.env.MONIME_API_KEY;
  const spaceId = process.env.MONIME_SPACE_ID;
  if (!apiKey || !spaceId) {
    return NextResponse.json(
      { error: "Payment is not configured. Please try again later." },
      { status: 500 }
    );
  }

  const reference = contributionReference();
  const origin = new URL(request.url).origin;
  const successUrl = process.env.CHECKOUT_SUCCESS_URL || `${origin}/success`;
  const cancelUrl = process.env.CHECKOUT_CANCEL_URL || origin;

  // Match or create the member (lightweight, by phone).
  let memberId: string | null = null;
  try {
    const existing = await prisma.member.findUnique({ where: { phone } });
    if (existing) {
      memberId = existing.id;
      if (email && !existing.email) {
        await prisma.member.update({
          where: { id: existing.id },
          data: { email },
        });
      }
    } else {
      const count = await prisma.member.count();
      const member = await prisma.member.create({
        data: {
          memberCode: memberCode(count + 1),
          fullName: name,
          phone,
          email,
        },
      });
      memberId = member.id;
    }
  } catch (err) {
    // If DB isn't reachable we still let payment proceed, but log it.
    console.error("[checkout] member upsert failed:", err);
  }

  // Create the Monime checkout session.
  let session: any = null;
  try {
    const res = await fetch("https://api.monime.io/v1/checkout-sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Monime-Space-Id": spaceId,
        "Content-Type": "application/json",
        "Idempotency-Key": reference,
      },
      body: JSON.stringify({
        name: `${contributionType} — MASERAY TEMNE BLOGGER`,
        description: `Contribution from ${name} (${phone})`,
        reference,
        successUrl,
        cancelUrl,
        lineItems: [
          {
            type: "custom",
            name: contributionType,
            quantity: 1,
            price: {
              currency: CURRENCY,
              value: Math.round(amount * MINOR_UNIT_FACTOR),
            },
          },
        ],
        metadata: {
          contributionType,
          contributorName: name,
          contributorPhone: phone,
          reference,
        },
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.result) {
      const message =
        data?.messages?.[0]?.text ||
        data?.error ||
        "Unable to start payment. Please try again.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
    session = data.result;
  } catch {
    return NextResponse.json(
      { error: "Could not reach the payment provider. Please try again." },
      { status: 502 }
    );
  }

  const redirectUrl = session.redirectUrl || session.url;
  if (!redirectUrl) {
    return NextResponse.json(
      { error: "Payment session could not be created." },
      { status: 502 }
    );
  }

  // Persist the pending contribution.
  try {
    await prisma.contribution.create({
      data: {
        reference,
        contributionType,
        amount,
        currency: CURRENCY,
        status: "PENDING",
        contributorName: name,
        contributorPhone: phone,
        contributorEmail: email,
        monimeSessionId: session.id ?? null,
        monimeRedirectUrl: redirectUrl,
        memberId,
      },
    });
  } catch (err) {
    console.error("[checkout] contribution save failed:", err);
  }

  return NextResponse.json({
    success: true,
    redirectUrl,
    sessionId: session.id,
    reference,
  });
}
