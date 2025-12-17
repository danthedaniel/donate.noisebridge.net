import mjml2html from "mjml";

export interface MagicLinkEmailProps {
  email: string;
  magicLinkUrl: string;
}

/**
 * Generate HTML email for magic link authentication
 */
export function magicLinkEmail({ email, magicLinkUrl }: MagicLinkEmailProps): string {
  const mjml = `
    <mjml>
      <mj-head>
        <mj-title>Sign in to Noisebridge Donations</mj-title>
        <mj-attributes>
          <mj-all font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" />
          <mj-text font-size="14px" color="#555555" line-height="1.6" />
          <mj-button background-color="#cc3333" color="#ffffff" font-size="16px" font-weight="600" border-radius="6px" padding="12px 32px" />
        </mj-attributes>
      </mj-head>
      <mj-body background-color="#f4f4f4">
        <mj-section background-color="#ffffff" padding="40px 20px">
          <mj-column>
            <mj-text font-size="24px" font-weight="700" color="#333333" align="center" padding-bottom="20px">
              Sign in to Noisebridge
            </mj-text>
            <mj-text align="center" padding-bottom="10px">
              You requested a magic link to sign in to manage your Noisebridge donation.
            </mj-text>
            <mj-text align="center" color="#888888" font-size="13px" padding-bottom="30px">
              Email: <strong>${email}</strong>
            </mj-text>
            <mj-button href="${magicLinkUrl}" align="center">
              Sign In
            </mj-button>
            <mj-text align="center" color="#888888" font-size="13px" padding-top="30px">
              This link will expire in 5 minutes.
            </mj-text>
            <mj-divider border-color="#e0e0e0" padding="30px 0 20px 0" />
            <mj-text align="center" color="#888888" font-size="12px">
              If you didn't request this email, you can safely ignore it.
            </mj-text>
            <mj-text align="center" color="#888888" font-size="12px">
              Or copy and paste this link into your browser:
            </mj-text>
            <mj-text align="center" color="#0066cc" font-size="11px" padding-top="10px">
              ${magicLinkUrl}
            </mj-text>
          </mj-column>
        </mj-section>
        <mj-section padding="20px">
          <mj-column>
            <mj-text align="center" color="#999999" font-size="12px">
              Noisebridge Hackerspace
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

  const { html, errors } = mjml2html(mjml);
  if (errors.length > 0) {
    console.error("MJML compilation errors:", errors);
    throw new Error("Failed to generate HTML from MJML");
  }

  return html;
}
