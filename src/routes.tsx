// biome-ignore lint/correctness/noUnusedImports: Html is used by JSX
import Html from "@kitajs/html";
import type { FastifyInstance } from "fastify";
import type { FastifyReply } from "fastify/types/reply";
import type { FastifyRequest } from "fastify/types/request";
import type Stripe from "stripe";
import { CookieName, cookies, getRandomState, githubRedirectUri } from "~/managers/auth";
import githubOAuth from "~/services/github";
import stripe from "~/services/stripe";
import { AuthPage } from "~/views/auth";
import { IndexPage } from "~/views/index";
import { ManagePage } from "~/views/manage";

const paths = {
  index: "/",
  signIn: (error?: string) => error ? `/auth?error=${encodeURIComponent(error)}` : `/auth`,
  signOut: "/auth/signout",
  githubStart: "/auth/github/start",
  githubCallback: (code: string, state: string) => `/auth/github/callback?${new URLSearchParams({ code, state }).toString()}`,
  manage: "/manage",
} as const;

export enum ErrorCode {
  InvalidState = "Invalid OAuth state parameter",
  InvalidRequest = "Invalid request parameters",
  GithubError = "GitHub raised an error",
  NoEmail = "Could not find an email address for you",
}

function isAuthenticated(
  request: FastifyRequest,
  reply: FastifyReply,
): boolean {
  return cookies[CookieName.UserSession](request, reply).valid();
}

export default async function routes(fastify: FastifyInstance) {
  fastify.get("/", async (request, reply) => {
    return reply.html(
      <IndexPage title="Donate to Noisebridge" isAuthenticated={isAuthenticated(request, reply)} />
    );
  });

  fastify.get<{
    Querystring: { error?: string };
  }>("/auth", async (request, reply) => {
    const error = request.query.error;
    return reply.html(<AuthPage title="Sign In" isAuthenticated={isAuthenticated(request, reply)} error={error} />);
  });

  fastify.get("/auth/github/start", async (request, reply) => {
    const state = getRandomState();
    const githubCookie = cookies[CookieName.GithubOAuthState](request, reply);
    githubCookie.value = { state };

    const authUrl = githubOAuth.getAuthorizationUrl(githubRedirectUri, state, ["user:email"]);
    return reply.redirect(authUrl);
  });

  fastify.get<{
    Querystring: { code?: string; state?: string; error?: string };
  }>("/auth/github/callback", async (request, reply) => {
    if (request.query.error) {
      fastify.log.warn({ error: request.query.error }, "GitHub OAuth error");
      return reply.redirect(paths.signIn(ErrorCode.GithubError));
    }

    const { code, state } = request.query;
    if (!code || !state) {
      fastify.log.warn("Missing code or state parameter in callback");
      return reply.redirect(paths.signIn(ErrorCode.InvalidRequest));
    }

    const githubCookie = cookies[CookieName.GithubOAuthState](request, reply);
    const cookieValue = githubCookie.value;
    if (cookieValue?.state !== state) {
      fastify.log.warn("Invalid or mismatched state parameter");
      return reply.redirect(paths.signIn(ErrorCode.InvalidState));
    }

    const { user, primaryEmail } = await githubOAuth.completeOAuthFlow(
      code,
      githubRedirectUri,
    );
    const email = primaryEmail || user.email;
    if (!email) {
      fastify.log.warn(
        { userId: user.id, login: user.login },
        "No email found for GitHub user",
      );
      return reply.redirect(paths.signIn(ErrorCode.NoEmail));
    }

    const sessionCookie = cookies[CookieName.UserSession](request, reply);
    sessionCookie.value = { email: email, provider: "github" };

    fastify.log.info(
      { userId: user.id, login: user.login, email },
      "User authenticated via GitHub",
    );

    return reply.redirect(paths.manage);
  });

  fastify.get("/auth/signout", async (request, reply) => {
    const sessionCookie = cookies[CookieName.UserSession](request, reply);
    sessionCookie.clear();

    return reply.redirect(paths.index);
  });

  fastify.get("/manage", async (request, reply) => {
    const sessionCookie = cookies[CookieName.UserSession](request, reply);
    const sessionData = sessionCookie.value;
    if (!sessionData) {
      fastify.log.debug("No valid session found, redirecting to auth");
      sessionCookie.clear();
      return reply.redirect(paths.index);
    }

    let stripeCustomer: Stripe.Customer | undefined;
    try {
      const customers = await stripe.customers.list({
        email: sessionData.email,
        limit: 1,
      });
      stripeCustomer = customers.data[0];
    } catch (error) {
      fastify.log.error(error, "Error fetching Stripe customer data");
    }

    return reply.html(
      <ManagePage
        title="Manage Donation"
        stripeCustomer={stripeCustomer}
      />,
    );
  });
}
