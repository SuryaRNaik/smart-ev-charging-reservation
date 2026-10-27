import "server-only";
import { SignJWT, jwtVerify } from "jose";

const secret = process.env.SESSION_SECRET;

if (!secret) {
  throw new Error("SESSION_SECRET is not configured");
}

const secretKey = new TextEncoder().encode(secret);

export type SessionPayload = {
  userId: number;
  role: "customer" | "admin";
};

export async function createSession(payload: SessionPayload) {
  return new SignJWT({
    userId: payload.userId,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.userId !== "number" ||
      !Number.isInteger(payload.userId) ||
      (payload.role !== "customer" && payload.role !== "admin")
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      role: payload.role,
    } satisfies SessionPayload;
  } catch {
    return null;
  }
}