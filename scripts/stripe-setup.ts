#!/usr/bin/env bun

import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config({ path: `${__dirname}/../.env` });

const PRODUCT_ID = "monthly_donation";
const PRODUCT_NAME = "Monthly Donation";

async function setupStripeProduct() {
  const stripe = (await import("../src/services/stripe")).default;

  console.log(
    `Checking if product "${PRODUCT_NAME}" (${PRODUCT_ID}) already exists...`,
  );

  try {
    const existingProduct = await stripe.products.retrieve(PRODUCT_ID);
    console.log(
      `✓ Product already exists: ${existingProduct.name} (${existingProduct.id})`,
    );
    console.log(`  Active: ${existingProduct.active}`);
    console.log(`  Description: ${existingProduct.description || "N/A"}`);
    return;
  } catch (error: unknown) {
    if (
      error instanceof Stripe.errors.StripeError &&
      error.type === "StripeInvalidRequestError" &&
      error.code === "resource_missing"
    ) {
      console.log("Product does not exist. Creating...");
    } else {
      throw error;
    }
  }

  const product = await stripe.products.create({
    id: PRODUCT_ID,
    name: PRODUCT_NAME,
    description: "Monthly recurring donation to support Noisebridge",
    active: true,
  });

  console.log(
    `✓ Successfully created product: ${product.name} (${product.id})`,
  );
  console.log(`  Active: ${product.active}`);
  console.log(`  Description: ${product.description}`);
}

setupStripeProduct();
