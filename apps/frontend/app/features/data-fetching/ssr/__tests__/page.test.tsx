import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import SsrPage, { metadata } from "../page";

// Container をモック
vi.mock("../_containers/container", () => ({
  SsrContainer: () => <div data-testid="ssr-container">SSR Container</div>,
}));

describe("SsrPage", () => {
  it("should render SsrContainer", async () => {
    const { getByTestId } = render(await SsrPage());
    expect(getByTestId("ssr-container")).toBeInTheDocument();
  });

  it("should have correct metadata", () => {
    expect(metadata.title).toBe("SSR Data Fetching Demo");
    expect(metadata.description).toBe("Server-Side Rendering demonstration with real-time data");
  });
});
