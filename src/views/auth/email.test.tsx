import { describe, expect, test } from "bun:test";
// biome-ignore lint/correctness/noUnusedImports: Html is used by JSX
import Html from "@kitajs/html";
import { AuthEmailPage } from "./email";

describe("AuthEmailPage", () => {
  test("should display provided email address", async () => {
    const email = "user@example.com";
    const result = await (
      <AuthEmailPage email={email} isAuthenticated={false} />
    );

    expect(result).toBeTypeOf("string");
    expect(result).toContain(email);
  });
});
