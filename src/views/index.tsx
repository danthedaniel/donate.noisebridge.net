// biome-ignore lint/correctness/noUnusedImports: Html is used by JSX
import Html from "@kitajs/html";
import { Layout } from "~/components/layout";

export interface IndexProps {
  isAuthenticated: boolean;
}

export function IndexPage({ isAuthenticated }: IndexProps) {
  return (
    <Layout title="Donate to Noisebridge!" script="index.mjs" styles="index.css" isAuthenticated={isAuthenticated}>
      <section class="hero">
        <h1>Support Noisebridge</h1>
        <p>All donations are tax-deductible. Noisebridge is a 501(c)(3) non-profit.</p>
      </section>

      <section class="donation-section">
        <div class="card membership-cta">
          <h2>Monthly Donation</h2>
          <p>
            Help keep our hackerspace running and accessible to everyone. Your contribution supports workshops,
            equipment, and a vibrant community of makers, thinkers, and tinkerers.
          </p>
          <button class="btn btn-primary btn-large" type="button">Start Membership Donation</button>
        </div>

        <div class="card onetime-donation">
          <h2>One-Time Donation</h2>
          <p>Make a single contribution to support Noisebridge.</p>

          <div class="amount-buttons">
            <button class="btn btn-amount" type="button" data-amount="10">$10</button>
            <button class="btn btn-amount" type="button" data-amount="20">$20</button>
            <button class="btn btn-amount" type="button" data-amount="40">$40</button>
            <button class="btn btn-amount" type="button" data-amount="80">$80</button>
            <button class="btn btn-amount" type="button" data-amount="160">$160</button>
          </div>

          <div class="custom-amount">
            <div class="input-group">
              <span class="input-prefix">$</span>
              <input
                type="number"
                id="custom-amount"
                name="custom-amount"
                placeholder="0.00"
                min="1"
                step="0.01"
              />
            </div>
          </div>

          <button class="btn btn-secondary btn-large" type="button">Donate Now</button>
        </div>
      </section>
    </Layout>
  );
}
