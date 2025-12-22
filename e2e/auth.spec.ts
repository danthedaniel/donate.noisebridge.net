import { expect, test } from "@playwright/test";

test.describe("Auth Flow Tests", () => {
  test("GitHub OAuth button redirects to GitHub authorization page", async ({
    page,
  }) => {
    await page.goto("/auth");

    // Click the GitHub OAuth button
    await page.click('a.btn-github:has-text("Continue with GitHub")');

    // Should redirect to GitHub OAuth authorization page
    await expect(page).toHaveURL(/^https:\/\/github\.com\/login/);

    // Verify OAuth parameters are present in the URL
    const url = new URL(page.url());
    expect(url.searchParams.has("client_id")).toBe(true);
  });

  test("Google OAuth button redirects to Google authorization page", async ({
    page,
  }) => {
    await page.goto("/auth");

    // Click the Google OAuth button
    await page.click('a.btn-google:has-text("Continue with Google")');

    // Should redirect to Google OAuth authorization page
    await expect(page).toHaveURL(/^https:\/\/accounts\.google\.com\//);

    // Verify OAuth parameters are present in the URL
    const url = new URL(page.url());
    expect(url.searchParams.has("client_id")).toBe(true);
  });
});
