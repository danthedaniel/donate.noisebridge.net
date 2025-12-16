// biome-ignore lint/correctness/noUnusedImports: Html is used by JSX
import Html from "@kitajs/html";
import type Stripe from "stripe";
import { Layout } from "~/components/layout";

export interface ManageProps {
  title: string;
  stripeCustomer: Stripe.Customer | undefined;
  isAuthenticated: boolean;
}

export function ManagePage({
  title,
  stripeCustomer,
  isAuthenticated,
}: ManageProps) {
  return (
    <Layout title={title} styles="manage.css" isAuthenticated={isAuthenticated}>
      <section class="manage-container">
        <div class="manage-header">
          <h1>Manage Your Donation</h1>
        </div>

        <div class="customer-details">
          <div class="card">
            <h2>Account Information</h2>
            <dl class="details-list">
              <dt>Email:</dt>
              <dd>{stripeCustomer?.email}</dd>

              {stripeCustomer?.name && (
                <>
                  <dt>Name:</dt>
                  <dd>{stripeCustomer?.name}</dd>
                </>
              )}

              <dt>Customer ID:</dt>
              <dd class="monospace">{stripeCustomer?.id}</dd>
            </dl>
          </div>
        </div>
      </section>
    </Layout>
  );
}
