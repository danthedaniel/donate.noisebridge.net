// biome-ignore lint/correctness/noUnusedImports: Html is used by JSX
import Html from "@kitajs/html";
import type { FastifyInstance } from "fastify";
import type Stripe from "stripe";
import {
  buildRedirectUri,
  clearSessionCookie,
  getSessionData,
  setOAuthStateCookie,
  setSessionCookie,
  verifyOAuthStateCookie,
} from "~/managers/auth";
import githubOAuth from "~/services/github";
import stripe from "~/services/stripe";
import { AuthPage } from "~/views/auth";
import { IndexPage } from "~/views/index";
import { ManagePage } from "~/views/manage";

export default async function routes(fastify: FastifyInstance) {
  fastify.get("/", async (request, reply) => {
    const sessionData = getSessionData(request);
    const isAuthenticated = !!sessionData;
    return reply.html(
      <IndexPage title="Donate to Noisebridge" isAuthenticated={isAuthenticated} />
    );
  });

  fastify.get("/auth", async (request, reply) => {
    const sessionData = getSessionData(request);
    const isAuthenticated = !!sessionData;
    return reply.html(<AuthPage title="Sign In" isAuthenticated={isAuthenticated} />);
  });

  fastify.get("/auth/github/start", async (request, reply) => {
    try {
      // Generate a cryptographically secure state parameter for CSRF protection
      const state = githubOAuth.generateState();

      // Store the state in a signed cookie (expires in 10 minutes)
      setOAuthStateCookie(reply, state);

      // Build the redirect URI for the callback
      const redirectUri = buildRedirectUri(request, "/auth/github/callback");

      // Get the GitHub authorization URL
      const authUrl = githubOAuth.getAuthorizationUrl(redirectUri, state, ["user:email"]);

      console.log(authUrl);

      // Redirect the user to GitHub
      return reply.redirect(authUrl);
    } catch (error) {
      fastify.log.error(error, "Error starting GitHub OAuth flow");
      return reply
        .status(500)
        .send({ error: "Failed to initiate GitHub OAuth" });
    }
  });

  fastify.get<{
    Querystring: { code?: string; state?: string; error?: string };
  }>("/auth/github/callback", async (request, reply) => {
    try {
      // Check if GitHub returned an error
      if (request.query.error) {
        fastify.log.warn({ error: request.query.error }, "GitHub OAuth error");
        return reply.redirect("/auth?error=access_denied");
      }

      // Validate required parameters
      const { code, state } = request.query;
      if (!code || !state) {
        fastify.log.warn("Missing code or state parameter in callback");
        return reply.redirect("/auth?error=invalid_request");
      }

      // Verify the state parameter matches what we stored (CSRF protection)
      if (!verifyOAuthStateCookie(request, state)) {
        fastify.log.warn("Invalid or mismatched state parameter");
        reply.clearCookie("github_oauth_state", { path: "/" });
        return reply.redirect("/auth?error=invalid_state");
      }

      // Clear the state cookie now that we've verified it
      reply.clearCookie("github_oauth_state", { path: "/" });

      // Build the redirect URI (must match what we used in /start)
      const redirectUri = buildRedirectUri(request, "/auth/github/callback");

      // Complete the OAuth flow: exchange code for token and get user info
      const { user, primaryEmail } = await githubOAuth.completeOAuthFlow(
        code,
        redirectUri,
      );

      // Use the primary email, or fall back to the email from the profile
      const email = primaryEmail || user.email;

      if (!email) {
        fastify.log.warn(
          { userId: user.id, login: user.login },
          "No email found for GitHub user",
        );
        return reply.redirect("/auth?error=no_email");
      }

      // Create a session by storing user info in a signed cookie
      setSessionCookie(reply, {
        email: email,
        provider: "github",
      });

      fastify.log.info(
        { userId: user.id, login: user.login, email },
        "User authenticated via GitHub",
      );

      // Redirect to the manage page
      return reply.redirect("/manage");
    } catch (error) {
      fastify.log.error(error, "Error in GitHub OAuth callback");
      return reply.redirect("/auth?error=auth_failed");
    }
  });

  fastify.get("/auth/signout", async (_request, reply) => {
    clearSessionCookie(reply);
    return reply.redirect("/");
  });

  fastify.get("/manage", async (request, reply) => {
    try {
      // Require a valid session, redirect if not authenticated
      const sessionData = getSessionData(request);
      if (!sessionData) {
        fastify.log.debug("No valid session found, redirecting to auth");
        clearSessionCookie(reply);
        return reply.redirect("/");
      }

      // Look up Stripe customer by email
      let stripeCustomer: Stripe.Customer | undefined;

      try {
        const customers = await stripe.customers.list({
          email: sessionData.email,
          limit: 1,
        });
        stripeCustomer = customers.data[0];
      } catch (error) {
        fastify.log.error(error, "Error fetching Stripe customer data");
        // Continue without Stripe data - don't fail the whole page
      }

      return reply.html(
        <ManagePage
          title="Manage Donation"
          stripeCustomer={stripeCustomer}
          isAuthenticated={true}
        />,
      );
    } catch (error) {
      fastify.log.error(error, "Error in /manage route");
      return reply.redirect("/auth?error=session_error");
    }
  });
}
