import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClaimableBalanceCard } from "./ClaimableBalanceCard";
import { getClient } from "@/lib/client";
import { fireEvent,render, screen } from "@testing-library/react";
import { beforeEach,describe, expect, it, vi } from "vitest";

import { useSorokit } from "@/context/useSorokit";
import { getClient } from "@/lib/client";

import { ClaimableBalanceCard } from "./ClaimableBalanceCard";

vi.mock("@/context/useSorokit", () => ({
  useSorokit: vi.fn(),
}));

vi.mock("@/lib/client", () => ({
  getClient: vi.fn(),
}));

describe("ClaimableBalanceCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when not connected", () => {
    vi.mocked(useSorokit).mockReturnValue({
      address: null,
      isConnected: false,
    } as unknown as ReturnType<typeof useSorokit>);

    const { container } = render(<ClaimableBalanceCard />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows fetch error when getClaimableBalances returns an error", async () => {
    vi.mocked(useSorokit).mockReturnValue({
      address: "GABC123",
      isConnected: true,
    } as unknown as ReturnType<typeof useSorokit>);

    vi.mocked(getClient).mockReturnValue({
      account: {
        getClaimableBalances: vi.fn().mockResolvedValue({
          data: null,
          error: "Failed to fetch balances",
        }),
        claimBalance: vi.fn(),
      },
    } as unknown as ReturnType<typeof getClient>);

    render(<ClaimableBalanceCard />);
    expect(await screen.findByText("Failed to fetch balances")).toBeInTheDocument();
  });

  it("shows empty state with checkmark icon when no claimable balances exist", async () => {
    vi.mocked(useSorokit).mockReturnValue({
      address: "GABC123",
      isConnected: true,
    } as unknown as ReturnType<typeof useSorokit>);

    vi.mocked(getClient).mockReturnValue({
      account: {
        getClaimableBalances: vi.fn().mockResolvedValue({ data: [], error: null }),
        claimBalance: vi.fn(),
      },
    } as unknown as ReturnType<typeof getClient>);

    render(<ClaimableBalanceCard />);
    expect(await screen.findByText(/no claimable balances/i)).toBeInTheDocument();
    // The checkmark icon SVG should be present in the empty state container
    const emptyText = screen.getByText(/no claimable balances/i);
    expect(emptyText.parentElement?.querySelector("svg")).toBeTruthy();
  });

  it("renders an error message and re-enables button on claim failure, shows Claimed badge on success", async () => {
    vi.mocked(useSorokit).mockReturnValue({
      address: "GABC123",
      isConnected: true,
    } as unknown as ReturnType<typeof useSorokit>);

    const mockClaimBalance = vi.fn()
      .mockResolvedValueOnce({ data: null, error: "Network error" }) // Failure first
      .mockResolvedValueOnce({ data: { hash: "tx123" }, error: null }); // Success second

    const mockGetClaimableBalances = vi.fn().mockResolvedValue({
      data: [
        {
          id: "cb1",
          asset: "XLM:GABC",
          amount: "10.0",
          sponsor: "GDEF",
          claimants: [],
        },
      ],
      error: null,
    });

    vi.mocked(getClient).mockReturnValue({
      account: {
        getClaimableBalances: mockGetClaimableBalances,
        claimBalance: mockClaimBalance,
      },
    } as unknown as ReturnType<typeof getClient>);

    render(<ClaimableBalanceCard />);

    // Wait for the balance to load
    expect(await screen.findByText("10.00")).toBeInTheDocument();

    const claimButton = screen.getByRole("button", { name: "Claim" });
    
    // Simulate first click: Failure
    fireEvent.click(claimButton);
    
    // Wait for error to show up
    expect(await screen.findByText("Network error")).toBeInTheDocument();
    expect(claimButton).not.toBeDisabled(); // Should re-enable

    // Simulate second click: Success
    fireEvent.click(claimButton);
    
    // Wait for "Claimed" badge
    expect(await screen.findByText("Claimed")).toBeInTheDocument();
    
    // Button should be gone after claim
    expect(screen.queryByRole("button", { name: "Claim" })).not.toBeInTheDocument();
    // Error should be gone
    expect(screen.queryByText("Network error")).not.toBeInTheDocument();
  });

  it("re-fetches balances after a successful claim", async () => {
    vi.mocked(useSorokit).mockReturnValue({
      address: "GABC123",
      isConnected: true,
    } as unknown as ReturnType<typeof useSorokit>);

    const mockClaimBalance = vi.fn().mockResolvedValue({ data: { hash: "tx123" }, error: null });

    const mockGetClaimableBalances = vi.fn()
      .mockResolvedValueOnce({
        data: [
          {
            id: "cb1",
            asset: "USDC:GABC",
            amount: "50.0",
            sponsor: "GDEF",
            claimants: [],
          },
        ],
        error: null,
      })
      // Second call (after claim) returns empty list
      .mockResolvedValueOnce({ data: [], error: null });

    vi.mocked(getClient).mockReturnValue({
      account: {
        getClaimableBalances: mockGetClaimableBalances,
        claimBalance: mockClaimBalance,
      },
    } as unknown as ReturnType<typeof getClient>);

    render(<ClaimableBalanceCard />);

    // Wait for the balance to load
    expect(await screen.findByText("50.00")).toBeInTheDocument();

    // Click Claim
    fireEvent.click(screen.getByRole("button", { name: "Claim" }));

    // After claim, list should re-fetch and show empty state
    await waitFor(() =>
      expect(screen.getByText(/no claimable balances/i)).toBeInTheDocument()
    );
    expect(mockGetClaimableBalances).toHaveBeenCalledTimes(2);
  });

  it("renders predicate time-bounds below the sponsor address", async () => {
    vi.mocked(useSorokit).mockReturnValue({
      address: "GABC123",
      isConnected: true,
    } as unknown as ReturnType<typeof useSorokit>);

    vi.mocked(getClient).mockReturnValue({
      account: {
        getClaimableBalances: vi.fn().mockResolvedValue({
          data: [
            {
              id: "cb1",
              asset: "XLM:GABC",
              amount: "5.0",
              sponsor: "GDEF",
              claimants: [
                { destination: "GABC123", predicate: { abs_before: "1767225600" } },
              ],
            },
          ],
          error: null,
        }),
        claimBalance: vi.fn(),
      },
    } as unknown as ReturnType<typeof getClient>);

    render(<ClaimableBalanceCard />);

    // Should display a "Claimable until ..." string derived from the abs_before epoch
    expect(await screen.findByText(/claimable until/i)).toBeInTheDocument();
  });
});
