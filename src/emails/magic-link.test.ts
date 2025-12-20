import { describe, expect, test } from "bun:test";
import { MagicLinkEmail } from "./magic-link";

describe("MagicLinkEmail", () => {
  test("should generate email template", () => {
    const result = MagicLinkEmail({
      magicLinkUrl: "https://example.com/magic-link?token=abc123",
    });

    expect(result).toBeTypeOf("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
