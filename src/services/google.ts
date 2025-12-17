import config from "~/config";

const userAgent = "NoisebridgeDonorPortal";

const serverProtocol = config.production ? "https" : "http";
export const googleRedirectUri = `${serverProtocol}://${config.serverHost}/auth/google/callback`;

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  id_token?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale?: string;
}

/**
 * GoogleOAuth service for handling Google OAuth 2.0 authentication
 */
export class GoogleOAuth {
  /**
   * Build the Google OAuth authorization URL
   * @param redirectUri - The URI to redirect to after authorization
   * @param state - CSRF protection state parameter
   * @param scopes - Array of OAuth scopes to request
   */
  getAuthorizationUrl(
    redirectUri: string,
    state: string,
    scopes: string[]
  ): string {
    const params = new URLSearchParams({
      client_id: config.googleClientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes.join(" "),
      state: state,
      access_type: "online",
      prompt: "select_account",
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange an authorization code for an access token
   * @param code - The authorization code from Google
   * @param redirectUri - The same redirect URI used in the authorization request
   */
  async getAccessToken(code: string, redirectUri: string): Promise<string> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": userAgent,
      },
      body: new URLSearchParams({
        client_id: config.googleClientId,
        client_secret: config.googleSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get access token: ${response.statusText} - ${errorText}`);
    }

    const data = (await response.json()) as GoogleTokenResponse;
    if (!data.access_token) {
      throw new Error("No access token in response");
    }

    return data.access_token;
  }

  /**
   * Get the authenticated user's profile information
   * @param accessToken - The Google access token
   */
  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": userAgent,
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get user info: ${response.statusText} - ${errorText}`);
    }

    return (await response.json()) as GoogleUserInfo;
  }

  /**
   * Complete OAuth flow: exchange code for token and get user info
   * @param code - The authorization code from Google
   * @param redirectUri - The redirect URI used in the authorization request
   * @returns Object containing access token and user info
   */
  async completeOAuthFlow(
    code: string,
    redirectUri: string
  ): Promise<{
    accessToken: string;
    userInfo: GoogleUserInfo;
  }> {
    const accessToken = await this.getAccessToken(code, redirectUri);
    const userInfo = await this.getUserInfo(accessToken);

    return {
      accessToken,
      userInfo,
    };
  }
}

// Create and export a singleton instance
const googleOAuth = new GoogleOAuth();
export default googleOAuth;
