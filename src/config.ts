function assertEnvVar(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }

  return value;
}

export default {
  production: process.env.NODE_ENV === "production",
  serverProtocol: process.env.NODE_ENV === "production" ? "https" : "http",
  serverHost: assertEnvVar("SERVER_HOST"),
  stripeSecretKey: assertEnvVar("STRIPE_SECRET"),
  githubClientId: assertEnvVar("GITHUB_CLIENT_ID"),
  githubSecret: assertEnvVar("GITHUB_SECRET"),
  googleClientId: assertEnvVar("GOOGLE_CLIENT_ID"),
  googleSecret: assertEnvVar("GOOGLE_SECRET"),
  cookieSecret: assertEnvVar("COOKIE_SECRET"),
  resendKey: assertEnvVar("RESEND_KEY"),
  totpSecret: assertEnvVar("TOTP_SECRET"),
};
