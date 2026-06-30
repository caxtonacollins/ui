import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SorokitProvider } from "@/context/SorokitProvider";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { AccountCard } from "@/components/AccountCard";
import { getClient } from "@/lib/client";

describe("Wallet Connect Flow Integration", () => {
  let mockClient: ReturnType<typeof getClient>;

  beforeEach(() => {
    mockClient = {
      wallet: {
        connect: vi.fn().mockResolvedValue({ data: { address: "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890" }, error: null }),
        disconnect: vi.fn().mockResolvedValue(undefined),
      },
      account: {
        getAccount: vi.fn().mockResolvedValue({ data: { sequence: "123456789" }, error: null }),
        getBalances: vi.fn().mockResolvedValue({ data: [{ asset: "XLM", balance: "100.5" }], error: null }),
      },
      network: {
        getNetwork: vi.fn().mockResolvedValue({ data: { name: "mainnet" }, error: null }),
        switchNetwork: vi.fn().mockResolvedValue({ data: { name: "testnet" }, error: null }),
      },
    } as unknown as ReturnType<typeof getClient>;
  });

  it("connects wallet, displays account, and disconnects", async () => {
    render(
      <SorokitProvider client={mockClient}>
        <WalletConnectButton />
        <AccountCard />
      </SorokitProvider>
    );

    // Initial state: Wallet not connected, AccountCard should not show sequence
    expect(screen.getByRole("button", { name: /connect/i })).toBeInTheDocument();
    expect(screen.queryByText(/Sequence:/i)).not.toBeInTheDocument();

    // Action 1: Connect Wallet
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /connect/i }));
    });

    // Verification 1: Wallet connected, AccountCard renders account data
    expect(mockClient.wallet.connect).toHaveBeenCalled();
    
    // Disconnect button should appear inside WalletConnectButton or similar if it toggles
    // We wait for the account data to be fetched and rendered in AccountCard
    await waitFor(() => {
      expect(screen.getByText(/123456789/i)).toBeInTheDocument(); // Sequence number
    });

    // Action 2: Disconnect Wallet
    // The WalletConnectButton usually turns into a Disconnect button when connected
    const disconnectBtn = screen.getByRole("button", { name: /disconnect/i });
    await act(async () => {
      fireEvent.click(disconnectBtn);
    });

    // Verification 2: Wallet disconnected, AccountCard returns null (or clears data)
    expect(mockClient.wallet.disconnect).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /connect/i })).toBeInTheDocument();
    expect(screen.queryByText(/123456789/i)).not.toBeInTheDocument();
  });
});
