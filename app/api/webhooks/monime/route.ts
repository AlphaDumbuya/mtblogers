import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  sendEmail,
  receiptEmailHtml,
  adminAlertHtml,
} from "@/lib/email";

export const runtime = "nodejs";

function money(n: number, currency: string) {
  return `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export async function POST(request: Request) {
  const raw = await request.text();

  // Optional signature verification
  const secret = process.env.MONIME_WEBHOOK_SECRET;
  if (secret) {
    const signature =
      request.headers.get("monime-signature") ||
      request.headers.get("x-monime-signature");
    const valid = await verifySignature(raw, signature, secret);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const type: string = event.type || event.event || "";
  const data = event.data || event.result || event;

  const reference: string | undefined =
    data?.reference || data?.metadata?.reference || data?.object?.reference;

  if (!reference) {
    return NextResponse.json({ received: true, note: "no reference" });
  }

  const isPaid = /completed|success|paid/i.test(type) || data?.status === "completed";
  const isFailed = /failed|cancel|expired/i.test(type);

  try {
    const contribution = await prisma.contribution.findUnique({
      where: { reference },
    });
    if (!contribution) {
      return NextResponse.json({ received: true, note: "unknown reference" });
    }

    if (isPaid && contribution.status !== "PAID") {
      await prisma.contribution.update({
        where: { reference },
        data: { status: "PAID", paidAt: new Date() },
      });

      // ── Notifications ──────────────────────────────────────────────────────
      // Create a notification for ALL active members
      const allMembers = await prisma.member.findMany({
        where: { status: "ACTIVE" },
        select: { id: true },
      });

      const amt = money(Number(contribution.amount), contribution.currency);
      const notifTitle = `${contribution.contributorName} just contributed ${amt}`;
      const notifBody = `${contribution.contributorName} made a ${contribution.contributionType} of ${amt} to the community fund.`;

      await prisma.notification.createMany({
        data: allMembers.map((m) => ({
          memberId: m.id,
          kind: "CONTRIBUTION",
          title: notifTitle,
          body: notifBody,
        })),
        skipDuplicates: true,
      });

      // ── Email receipt to contributor ───────────────────────────────────────
      if (contribution.contributorEmail) {
        await sendEmail({
          to: [{ email: contribution.contributorEmail, name: contribution.contributorName }],
          subject: "Your contribution was received — thank you",
          html: receiptEmailHtml({
            name: contribution.contributorName,
            amount: Number(contribution.amount),
            currency: contribution.currency,
            contributionType: contribution.contributionType,
            reference: contribution.reference,
          }),
        });
      }

      // ── Alert admins ───────────────────────────────────────────────────────
      const adminEmails = (process.env.ADMIN_ALERT_EMAILS || "")
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      if (adminEmails.length) {
        await sendEmail({
          to: adminEmails.map((email) => ({ email })),
          subject: "New contribution received",
          html: adminAlertHtml({
            contributorName: contribution.contributorName,
            amount: Number(contribution.amount),
            currency: contribution.currency,
            contributionType: contribution.contributionType,
            reference: contribution.reference,
          }),
        });
      }
    } else if (isFailed && contribution.status === "PENDING") {
      await prisma.contribution.update({
        where: { reference },
        data: { status: "FAILED" },
      });
    }
  } catch (err) {
    console.error("[webhook] processing failed:", err);
    return NextResponse.json({ error: "Processing error." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function verifySignature(
  payload: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) return false;
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
    const expected = Buffer.from(sigBuffer).toString("hex");
    const expectedB64 = Buffer.from(sigBuffer).toString("base64");
    const provided = signature.replace(/^sha256=/, "").trim();
    return provided === expected || provided === expectedB64;
  } catch {
    return false;
  }
}
