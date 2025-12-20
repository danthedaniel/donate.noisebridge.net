import { describe, expect, test } from "bun:test";
import { SubscriptionCanceledEmail } from "./subscription-canceled";

describe("SubscriptionCanceledEmail", () => {
  test("should generate email template", () => {
    const result = SubscriptionCanceledEmail({
      amountCents: 2500,
    });

    expect(result).toBeTypeOf("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
