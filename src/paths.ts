import type { Message } from "./components/message-container";

export type MessageParams = Partial<Record<Message["type"], string>>;

/**
 * Format a page path with query params.
 */
function formatPath(path: string, params?: Record<string, string | undefined>) {
  if (!params || Object.keys(params).length === 0) {
    return path;
  }

  const urlSearchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value !== "string") {
      continue;
    }

    urlSearchParams.set(key, value);
  }

  const queryString = urlSearchParams.toString();
  if (!queryString) {
    return path;
  }

  return `${path}?${queryString}`;
}

// biome-ignore lint/suspicious/noExplicitAny: unknown didn't work here
type FunctionReturnsString = (...args: any[]) => string;

/**
 * Central location to define paths. This prevents inconsitencies within the
 * site with what the paths are or what query parameters they can receive. Each
 * path is noted with a comment containing the path string so that developers
 * can quickly see the path by hovering over one of these functions.
 */
const paths = {
  /**
   * `/`
   */
  index: (params?: MessageParams) => formatPath("/", params),
  /**
   * `/donate`
   */
  donate: () => "/donate",
  /**
   * `/thank-you`
   */
  thankYou: () => "/thank-you",
  /**
   * `/qr`
   */
  qr: () => "/qr",
  /**
   * `/auth`
   */
  signIn: (params?: MessageParams) => formatPath("/auth", params),
  /**
   * `/auth/email`
   */
  emailAuth: (email?: string) => formatPath("/auth/email", { email }),
  /**
   * `/auth/email/callback`
   */
  emailCallback: (state?: string) =>
    formatPath("/auth/email/callback", { state }),
  /**
   * `/auth/backdoor`
   */
  authBackdoor: () => "/auth/backdoor",
  /**
   * `/auth/signout`
   */
  signOut: () => "/auth/signout",
  /**
   * `/auth/github/start`
   */
  githubStart: () => "/auth/github/start",
  /**
   * `/auth/github/callback`
   */
  githubCallback: () => "/auth/github/callback",
  /**
   * `/auth/google/start`
   */
  googleStart: () => "/auth/google/start",
  /**
   * `/auth/google/callback`
   */
  googleCallback: () => "/auth/google/callback",
  /**
   * `/manage`
   */
  manage: (params?: MessageParams) => formatPath("/manage", params),
  /**
   * `/subscribe`
   */
  subscribe: () => "/subscribe",
  /**
   * `/subscribe/portal`
   */
  stripePortal: () => "/subscribe/portal",
  /**
   * `/cancel`
   */
  cancel: () => "/cancel",
  /**
   * `/webhook`
   */
  webhook: () => "/webhook",
  /**
   * `/healthz`
   */
  healthz: () => "/healthz",
} as const satisfies Record<string, FunctionReturnsString>;

export default paths;
