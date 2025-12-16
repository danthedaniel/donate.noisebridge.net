import type { FastifyReply, FastifyRequest } from "fastify";

export interface SessionData {
  email: string;
  provider: "github" | "google" | "magic_link";
}

export interface CookieOptions {
  signed: boolean;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  maxAge: number;
}

/**
 * Get default cookie options based on environment
 */
function getDefaultCookieOptions(): Omit<CookieOptions, "maxAge"> {
  return {
    signed: true,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}

/**
 * Set the OAuth state cookie for CSRF protection
 */
export function setOAuthStateCookie(
  reply: FastifyReply,
  state: string,
): void {
  reply.setCookie("github_oauth_state", state, {
    ...getDefaultCookieOptions(),
    maxAge: 600, // 10 minutes
  });
}

/**
 * Verify and retrieve the OAuth state from the cookie
 * Returns the state value if valid, null otherwise
 */
export function verifyOAuthStateCookie(
  request: FastifyRequest,
  expectedState: string,
): boolean {
  const storedState = request.unsignCookie(
    request.cookies["github_oauth_state"] || "",
  );

  return storedState.valid && storedState.value === expectedState;
}

/**
 * Set the user session cookie
 */
export function setSessionCookie(
  reply: FastifyReply,
  sessionData: SessionData,
): void {
  reply.setCookie("user_session", JSON.stringify(sessionData), {
    ...getDefaultCookieOptions(),
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
  });
}

/**
 * Retrieve and verify the session data from the cookie
 * Returns the session data if valid, null otherwise
 */
export function getSessionData(
  request: FastifyRequest,
): SessionData | null {
  const sessionCookie = request.cookies["user_session"];
  if (!sessionCookie) {
    return null;
  }

  // Verify and parse the signed cookie
  const unsignedSession = request.unsignCookie(sessionCookie);
  if (!unsignedSession.valid) {
    return null;
  }

  // Parse the session data
  try {
    const sessionData = JSON.parse(
      unsignedSession.value || "{}",
    ) as SessionData;

    // Validate session has required fields
    if (!sessionData.email || !sessionData.provider) {
      return null;
    }

    return sessionData;
  } catch {
    return null;
  }
}

/**
 * Clear the user session cookie
 */
export function clearSessionCookie(reply: FastifyReply): void {
  reply.clearCookie("user_session", { path: "/" });
}

/**
 * Check if a session is valid and redirect if not
 * Returns the session data if valid, redirects and returns null otherwise
 */
export async function requireSession(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<SessionData | null> {
  const sessionData = getSessionData(request);

  if (!sessionData) {
    await reply.redirect("/");
    return null;
  }

  return sessionData;
}

/**
 * Build the OAuth redirect URI based on the current request
 */
export function buildRedirectUri(
  request: FastifyRequest,
  path: string,
): string {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const host = request.headers.host || "localhost:3000";
  return `${protocol}://${host}${path}`;
}
