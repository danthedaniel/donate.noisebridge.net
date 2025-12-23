import type { Page } from "@playwright/test";

/**
 * Get expiry date one year from now in MM/YY format
 */
export function getExpiryOneYearFromNow(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  return `${month}/${year}`;
}

/**
 * Helper function to fill out the Stripe checkout form
 */
export async function fillStripeCheckoutForm(
  page: Page,
  options: {
    email?: string;
    cardNumber: string;
    expiry: string;
    cvc: string;
    name: string;
    zip: string;
  },
) {
  if (options.email) {
    await page.fill("#email", options.email);
  }

  await page.fill("#cardNumber", options.cardNumber);
  await page.fill("#cardExpiry", options.expiry);
  await page.fill("#cardCvc", options.cvc);
  await page.fill("#billingName", options.name);
  await page.fill("#billingPostalCode", options.zip);
}
