import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { WalletConnectButton } from "./WalletConnectButton";
import { useSorokit } from "@/context/useSorokit";

vi.mock("@/context/useSorokit", () => ({ useSorokit: vi.fn() }));

const base = {
  isConnected: false,
  isConnecting: false,
  address: null,
  connectWallet: vi.fn(),
} as unknown as ReturnType<typeof useSorokit>;

beforeEach(() => vi.clearAllMocks());

describe("WalletConnectButton", () => {
  it("disconnected: renders Connect Wallet button", () => {
    vi.mocked(useSorokit).mockReturnValue(base);
    render(<WalletConnectButton />);
    expect(screen.getByRole("button", { name: /connect wallet/i })).toBeInTheDocument();
  });

  it("connecting: renders Connecting… text", () => {
    vi.mocked(useSorokit).mockReturnValue({ ...base, isConnecting: true });
    render(<WalletConnectButton />);
    expect(screen.getByRole("button", { name: /connecting/i })).toBeInTheDocument();
  });

  it("connected: renders truncated address", () => {
    vi.mocked(useSorokit).mockReturnValue({
      ...base,
      isConnected: true,
      address: "GABCDEFGHIJKLMNOPQRSTUVWXYZ123456",
    });
    render(<WalletConnectButton />);
    // truncateAddress("GABCDE...") → first 6 chars + ... + last 4
    expect(screen.getByText(/GABCDE\.\.\.3456/)).toBeInTheDocument();
  });
});
