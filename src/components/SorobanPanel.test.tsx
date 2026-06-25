import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SorobanPanel } from "./SorobanPanel";

// Mock the getClient from lib/client
vi.mock("../lib/client", () => ({
  getClient: () => ({
    soroban: {
      invokeContract: vi.fn().mockResolvedValue({ data: "Success", error: null }),
    },
  }),
}));

describe("SorobanPanel", () => {
  it("should have invoke button disabled when method is empty", () => {
    render(<SorobanPanel />);
    const invokeBtn = screen.getByRole("button", { name: /invoke/i });
    expect(invokeBtn).toBeDisabled();
  });

  it("should show error when invalid JSON args are provided", async () => {
    render(<SorobanPanel />);
    
    // Fill out contract ID and method to enable the button
    const contractInput = screen.getByPlaceholderText(/c.../i);
    const methodInput = screen.getByPlaceholderText(/e\.g\. transfer/i);
    const argsInput = screen.getByPlaceholderText(/\[.*\]/i);
    const invokeBtn = screen.getByRole("button", { name: /invoke/i });

    fireEvent.change(contractInput, { target: { value: "C123" } });
    fireEvent.change(methodInput, { target: { value: "mint" } });
    fireEvent.change(argsInput, { target: { value: "invalid json {" } });

    expect(invokeBtn).not.toBeDisabled();
    
    fireEvent.click(invokeBtn);

    // Expect the error state to be set
    const errorText = await screen.findByText(/Invalid JSON in arguments/i);
    expect(errorText).toBeInTheDocument();
  });
});
