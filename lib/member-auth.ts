import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "mtb_member";
const MAX_AGE = 60 * 60 * 12; // 12 hours

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s + "_member");
}

export type MemberSession = {
  id: string;
  memberCode: string;
  fullName: string;
  phone: string;
};

export async function createMemberSession(member: MemberSession) {
  const token = await new SignJWT({ ...member })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroyMemberSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getMemberSession(): Promise<MemberSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: String(payload.id),
      memberCode: String(payload.memberCode),
      fullName: String(payload.fullName),
      phone: String(payload.phone),
    };
  } catch {
    return null;
  }
}
