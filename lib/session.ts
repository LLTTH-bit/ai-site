import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "ai-chat-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    sameSite: "lax",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return session;
}
