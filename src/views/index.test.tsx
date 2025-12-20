import { describe, expect, test } from "bun:test";
// biome-ignore lint/correctness/noUnusedImports: Html is used by JSX
import Html from "@kitajs/html";
import { IndexPage } from "./index";

describe("IndexPage", () => {
  test("should render", async () => {
    const result = await (<IndexPage isAuthenticated={false} />);

    expect(result).toBeTypeOf("string");
    expect(result.length).toBeGreaterThan(0);
  });

  test("should display error message when provided", async () => {
    const errorMessage = "Something went wrong";
    const result = await (
      <IndexPage isAuthenticated={false} error={errorMessage} />
    );

    expect(result).toBeTypeOf("string");
    expect(result).toContain(errorMessage);
  });

  test("should not display error banner when no error provided", async () => {
    const result = await (<IndexPage isAuthenticated={false} />);

    expect(result).toBeTypeOf("string");
    expect(result).not.toContain('class="error-banner"');
  });
});
