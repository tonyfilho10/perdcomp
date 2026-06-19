import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "perdcomp_session";

export type SessionUser = {
  id: string;
  email: string;
  nome: string;
  perfil: string;
};

function getSecret() {
  return new TextEncoder().encode(process.env.SESSION_SECRET!);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}
