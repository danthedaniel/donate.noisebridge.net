const userAgent = "NoisebridgeDonorPortal";

const serverHost = process.env["SERVER_HOST"];
if (!serverHost) {
  throw new Error("SERVER_HOST env var is not set");
}
const serverProtocol = process.env.NODE_ENV === "production" ? "https" : "http";
export const githubRedirectUri = `${serverProtocol}://${serverHost}/auth/github/callback`;

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface GitHubUser {
  id: number;
  login: string;
  email: string | null;
  name: string | null;
  avatar_url: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

/**
 * GitHubOAuth service for handling GitHub OAuth authentication
 */
export class GitHubOAuth {
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor() {
    const clientId = process.env["GITHUB_CLIENT_ID"];
    if (!clientId) {
      throw new Error(
        "Missing required GitHub OAuth environment variables: GITHUB_CLIENT_ID"
      );
    }

    const clientSecret = process.env["GITHUB_SECRET"];
    if (!clientSecret) {
      throw new Error(
        "Missing required GitHub OAuth environment variables: GITHUB_SECRET"
      );
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Build the GitHub OAuth authorization URL
   * @param redirectUri - The URI to redirect to after authorization
   * @param state - CSRF protection state parameter
   * @param scopes - Array of OAuth scopes to request (defaults to user:email)
   */
  getAuthorizationUrl(
    redirectUri: string,
    state: string,
    scopes: string[]
  ): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      state: state,
      scope: scopes.join(" "),
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange an authorization code for an access token
   * @param code - The authorization code from GitHub
   * @param redirectUri - The same redirect URI used in the authorization request
   */
  async getAccessToken(code: string, redirectUri: string): Promise<string> {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = (await response.json()) as GitHubTokenResponse;

    if (!data.access_token) {
      throw new Error("No access token in response");
    }

    return data.access_token;
  }

  /**
   * Get the authenticated user's profile information
   * @param accessToken - The GitHub access token
   */
  async getUserProfile(accessToken: string): Promise<GitHubUser> {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user profile: ${response.statusText}`);
    }

    return (await response.json()) as GitHubUser;
  }

  /**
   * Get the authenticated user's email addresses
   * @param accessToken - The GitHub access token
   */
  async getUserEmails(accessToken: string): Promise<GitHubEmail[]> {
    const response = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user emails: ${response.statusText}`);
    }

    return (await response.json()) as GitHubEmail[];
  }

  /**
   * Get the primary verified email address for a user
   * @param accessToken - The GitHub access token
   */
  async getPrimaryEmail(accessToken: string): Promise<string | null> {
    const emails = await this.getUserEmails(accessToken);
    const primaryEmail = emails.find((email) => email.primary && email.verified);
    return primaryEmail?.email || null;
  }

  /**
   * Complete OAuth flow: exchange code for token and get user info
   * @param code - The authorization code from GitHub
   * @param redirectUri - The redirect URI used in the authorization request
   * @returns Object containing access token, user profile, and primary email
   */
  async completeOAuthFlow(
    code: string,
    redirectUri: string
  ): Promise<{
    accessToken: string;
    user: GitHubUser;
    primaryEmail: string | null;
  }> {
    const accessToken = await this.getAccessToken(code, redirectUri);
    const user = await this.getUserProfile(accessToken);
    const primaryEmail = await this.getPrimaryEmail(accessToken);

    return {
      accessToken,
      user,
      primaryEmail,
    };
  }
}

// Create and export a singleton instance
const githubOAuth = new GitHubOAuth();
export default githubOAuth;
