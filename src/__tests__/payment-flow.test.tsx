import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SorokitProvider } from "@/context/SorokitProvider";
import { TransactionPanel } from "@/components/TransactionPanel";
import { getClient } from "@/lib/client";

describe("Payment Flow Integration", () => {
  let mockClient: ReturnType<typeof getClient>;
  const mockAddress = "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

  beforeEach(() => {
    mockClient = {
      wallet: {
        connect: vi.fn().mockResolvedValue({ data: { address: mockAddress }, error: null }),
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
      transaction: {
        submit: vi.fn().mockResolvedValue({ data: { hash: "txhash123", ledger: 100 }, error: null }),
      }
    } as unknown as ReturnType<typeof getClient>;
  });

  it("submits payment with correct destination, amount, and source", async () => {
    // We render SorokitProvider, but we must "connect" it first to have an active address.
    // We can simulate this by calling client.wallet.connect() inside a wrapper, or we can just 
    // click a connect button if we add one.
    // Alternatively, SorokitProvider might just rely on the client.
    // Let's create a small component to trigger connection.
    const Wrapper = () => {
      return (
        <SorokitProvider client={mockClient}>
          <TransactionPanel />
          <ConnectTrigger />
        </SorokitProvider>
      );
    };

    const ConnectTrigger = () => {
      const { connectWallet } = require("@/context/useSorokit").useSorokit();
      return <button onClick={() => connectWallet()}>Test Connect</button>;
    };

    render(<Wrapper />);

    // Connect the wallet first so TransactionPanel doesn't show "Wallet not connected"
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Test Connect" }));
    });

    const destInput = screen.getByLabelText("Destination Address");
    const amountInput = screen.getByLabelText("Amount (XLM)");
    const submitBtn = screen.getByRole("button", { name: "Send Payment" });

    const validDest = "GCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC";
    const validAmount = "15.5";

    fireEvent.change(destInput, { target: { value: validDest } });
    fireEvent.change(amountInput, { target: { value: validAmount } });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Verify loading state appears
    expect(screen.getByRole("button", { name: "Submitting…" })).toBeInTheDocument();

    // Verify success state renders
    await waitFor(() => {
      expect(screen.getByText("Transaction submitted")).toBeInTheDocument();
      expect(screen.getByText("txhash123")).toBeInTheDocument();
    });

    // Most importantly, verify the mock client's transaction.submit was called with the correct parameters
    expect(mockClient.transaction.submit).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: validDest,
        amount: validAmount,
        source: mockAddress
      })
    );
  });
});
