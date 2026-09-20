import { SignJWT, jwtVerify } from "jose";

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET is not defined");
}

const secretKey = new TextEncoder().encode(secret);

import { cookies } from "next/headers";

export type UserRoleType =
  | "VIEWER"
  | "SURVEYOR"
  | "GOVERNMENT_OFFICER"
  | "GOVERNMENT_ADMIN";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
};

export async function createSession(user: SessionUser) {
  return await new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    const validRoles: UserRoleType[] = [
      "VIEWER",
      "SURVEYOR",
      "GOVERNMENT_OFFICER",
      "GOVERNMENT_ADMIN",
    ];

    if (
      typeof payload.id !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string" ||
      !validRoles.includes(payload.role as UserRoleType)
    ) {
      return null;
    }

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role as UserRoleType,
    };
  } catch {
    return null;
  }
}

export function isGovernmentRole(role: string): boolean {
  return (
    role === "SURVEYOR" ||
    role === "GOVERNMENT_OFFICER" ||
    role === "GOVERNMENT_ADMIN"
  );
}

export function isInternalRole(role: string): boolean {
  return isGovernmentRole(role);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;
    return await verifySession(token);
  } catch {
    return null;
  }
}

export async function requireAuthenticatedUser() {
  const user = await getSessionUser();
  if (!user) {
    return {
      authorized: false as const,
      status: 401,
      error: "Authentication required.",
      user: null,
    };
  }
  return {
    authorized: true as const,
    status: 200,
    error: null,
    user,
  };
}

export async function requireRole(allowedRoles: UserRoleType[]) {
  const auth = await requireAuthenticatedUser();
  if (!auth.authorized) {
    return auth;
  }
  if (!allowedRoles.includes(auth.user.role)) {
    return {
      authorized: false as const,
      status: 403,
      error: "Insufficient permissions.",
      user: auth.user,
    };
  }
  return auth;
}

export async function requireGovernmentUser() {
  const auth = await requireAuthenticatedUser();
  if (!auth.authorized) {
    return auth;
  }
  if (!isGovernmentRole(auth.user.role)) {
    return {
      authorized: false as const,
      status: 403,
      error: "Government authorization required.",
      user: auth.user,
    };
  }
  return auth;
}