// biome-ignore lint/correctness/noUnusedImports: Html is used by JSX
import Html from "@kitajs/html";
import type Stripe from "stripe";
import { DonationTierSelector } from "~/components/donation-tier-selector";
import { Layout } from "~/components/layout";

export interface ManageProps {
  customer?: Stripe.Customer | undefined;
  subscription?: Stripe.Subscription | undefined;
  error?: string | undefined;
}

export function ManagePage({ customer, subscription, error }: ManageProps) {
  return (
    <Layout
      title={subscription ? "Manage your Donation" : "Set Up your Donation"}
      styles="manage.css"
      script="manage.mjs"
      isAuthenticated={true}
    >
      <div class="manage-header">
        <h1>{customer ? "Manage your Donation" : "Start a Donation"}</h1>
        {error && (
          <div class="error-banner" role="alert">
            <span class="error-message">{error}</span>
          </div>
        )}
      </div>

      <DonationTierSelector subscription={subscription} />

      {subscription && (
        <form
          method="POST"
          action="/cancel"
          class="card cancel-subscription-form"
        >
          <p class="form-description">
            Or, if you want to cancel your monthly donation, click the button
            below.
          </p>

          <button type="submit" class="btn btn-secondary btn-large">
            Cancel Monthly Donation
          </button>
        </form>
      )}
    </Layout>
  );
}
