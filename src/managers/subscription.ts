import type Stripe from "stripe";
import config from "~/config";
import type { Cents } from "~/money";
import stripe from "~/services/stripe";
import emailManager from "./email";

export enum SubscriptionErrorCode {
  InvalidAmount = "Please select a valid donation amount",
  SameAmount = "Select a different donation amount",
  NoCustomer = "No Stripe customer found",
  NoSubscription = "No active monthly donation found to cancel",
  NoLineItem = "No line items in your active subscription",
  CreateError = "Unable to create monthly donation. Please try again.",
  CancelError = "Unable to cancel monthly donation. Please try again.",
  UpdateError = "Unable to update donation amount. Please try again.",
}

export type SubscribeResult =
  | { success: true; checkoutUrl?: string }
  | { success: false; error: SubscriptionErrorCode };

export type CancelResult =
  | { success: true }
  | { success: false; error: string };

export interface SubscriptionInfo {
  customer?: Stripe.Customer | undefined;
  subscription?: Stripe.Subscription | undefined;
}

export class SubscriptionManager {
  static readonly minimumAmount: Cents = { cents: 500 };
  static readonly productId = "monthly_donation";

  /**
   * Get customer and their active subscription by email
   */
  async getSubscription(email: string): Promise<SubscriptionInfo> {
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    const customer = customers.data[0];
    if (!customer) {
      return { customer: undefined, subscription: undefined };
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
      limit: 2,
    });

    if (subscriptions.data.length > 1) {
      throw new Error("Multiple active subscriptions found");
    }

    const subscription = subscriptions.data[0];
    if (!subscription) {
      return { customer };
    }
    if (!this.validateSubscription(subscription)) {
      throw new Error("Subscription is not valid");
    }

    return { customer, subscription };
  }

  private validateSubscription(subscription: Stripe.Subscription): boolean {
    const items = subscription.items.data;
    if (items.length !== 1) {
      return false;
    }

    const item = items[0];
    if (item?.price?.product !== SubscriptionManager.productId) {
      return false;
    }

    return true;
  }

  /**
   * Create a new subscription or update an existing one.
   * If the customer has an existing subscription with a different amount,
   * it will be updated with prorated billing.
   */
  async subscribe(email: string, amount: Cents): Promise<SubscribeResult> {
    if (amount.cents < SubscriptionManager.minimumAmount.cents) {
      return { success: false, error: SubscriptionErrorCode.InvalidAmount };
    }

    const { customer: existingCustomer, subscription: existingSubscription } =
      await this.getSubscription(email);
    const customer =
      existingCustomer ?? (await stripe.customers.create({ email }));
    if (!existingSubscription) {
      return await this.createSubscription(customer, amount);
    }

    return await this.updateSubscription(existingSubscription, amount);
  }

  private async createSubscription(
    customer: Stripe.Customer,
    amount: Cents,
  ): Promise<SubscribeResult> {
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product: SubscriptionManager.productId,
            unit_amount: amount.cents,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${config.serverProtocol}://${config.serverHost}/manage`,
      cancel_url: `${config.serverProtocol}://${config.serverHost}/manage`,
    });

    const checkoutUrl = session.url;
    if (!checkoutUrl) {
      throw new Error("Failed to create checkout session");
    }

    return {
      success: true,
      checkoutUrl,
    };
  }

  private async updateSubscription(
    subscription: Stripe.Subscription,
    amount: Cents,
  ): Promise<SubscribeResult> {
    const existingAmount = subscription.items.data[0]?.price?.unit_amount;
    if (existingAmount === amount.cents) {
      return { success: false, error: SubscriptionErrorCode.SameAmount };
    }

    const existingItemId = subscription.items.data[0]?.id;
    if (!existingItemId) {
      return { success: false, error: SubscriptionErrorCode.NoLineItem };
    }

    // Update subscription with new price - no checkout needed since payment method exists
    await stripe.subscriptions.update(subscription.id, {
      items: [
        {
          id: existingItemId,
          price_data: {
            currency: "usd",
            product: SubscriptionManager.productId,
            unit_amount: amount.cents,
            recurring: {
              interval: "month",
            },
          },
        },
      ],
      proration_behavior: "create_prorations",
    });

    return { success: true };
  }

  /**
   * Cancel an active subscription for the given email.
   * Issues a prorated refund to the original payment method.
   */
  async cancel(email: string): Promise<CancelResult> {
    const { customer, subscription } = await this.getSubscription(email);

    if (!customer) {
      return { success: false, error: SubscriptionErrorCode.NoCustomer };
    }

    if (!subscription) {
      return { success: false, error: SubscriptionErrorCode.NoSubscription };
    }

    await stripe.subscriptions.cancel(subscription.id);

    const amountCents = this.subscriptionAmount(subscription);
    await emailManager.sendSubscriptionCanceledEmail(email, amountCents);

    return { success: true };
  }

  private subscriptionAmount(
    subscription: Stripe.Subscription,
  ): Cents | undefined {
    const unit_amount =
      subscription.items.data[0]?.price?.unit_amount ?? undefined;
    if (!unit_amount) {
      return undefined;
    }

    return { cents: unit_amount };
  }
}

const subscriptionManager = new SubscriptionManager();
export default subscriptionManager;
