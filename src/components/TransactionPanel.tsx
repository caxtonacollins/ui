import { useState } from "react";
import { getClient } from "@/lib/client";
import { useSorokit } from "@/context/useSorokit";

/** Minimal Stellar address validation: G + 55 chars from A-Z0-9 */
function isValidStellarAddress(addr: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(addr);
}

const MIN_AMOUNT = 0.0000001;

type SubmitStatus = "idle" | "loading" | "success" | "error";

interface TxResult {
  hash: string;
  ledger: number;
}

export interface TransactionPanelProps {
  className?: string;
}

export function TransactionPanel({ className }: TransactionPanelProps) {
  const { address } = useSorokit();

  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [destDirty, setDestDirty] = useState(false);
  const [amountDirty, setAmountDirty] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const destValid = isValidStellarAddress(destination);
  const amountNum = parseFloat(amount);
  const amountValid = !isNaN(amountNum) && amountNum >= MIN_AMOUNT;
  const isSelfPayment = destValid && destination === address;
  const canSubmit = destValid && amountValid;

  const showDestError = destDirty && destination.length > 0 && !destValid;
  const showAmountError = amountDirty && amount !== "" && !amountValid;

  async function handleSubmit() {
    if (!canSubmit) return;

    if (!address) {
      setStatus("error");
      setSubmitError("Wallet not connected");
      return;
    }

    setStatus("loading");
    setSubmitError(null);

    try {
      const { data, error: txError } = await getClient().transaction.submit({
        destination,
        amount,
        sourceAccount: address,
      });

      if (txError) {
        setStatus("error");
        setSubmitError(txError);
      } else if (data) {
        setTxResult({ hash: data.hash, ledger: data.ledger });
        setStatus("success");
      }
    } catch (e) {
      setStatus("error");
      setSubmitError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  function handleReset() {
    setDestination("");
    setAmount("");
    setDestDirty(false);
    setAmountDirty(false);
    setStatus("idle");
    setTxResult(null);
    setSubmitError(null);
  }

  const isLoading = status === "loading";

  return (
    <div className={className}>
      <h3 className="text-[14px] font-semibold text-ink mb-4">Send Payment</h3>
      {status === "success" && txResult ? (
        <div className="space-y-4">
          <p className="text-[14px] font-semibold text-green">
            Transaction submitted
          </p>
          <p className="text-[13px] text-ink-2">
            Ledger #{txResult.ledger}
          </p>
          <p className="text-[12px] font-mono text-ink-3 break-all">
            {txResult.hash}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg bg-brand text-white h-9 px-4 text-[13px] font-medium"
          >
            New Transaction
          </button>
        </div>
      ) : status === "error" ? (
        <div className="space-y-4">
          <p className="text-[14px] font-semibold text-red">
            Transaction failed
          </p>
          {submitError && (
            <p className="text-[13px] text-ink-2">{submitError}</p>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg bg-surface-2 text-ink h-9 px-4 text-[13px] font-medium"
          >
            Try Again
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
          noValidate
        >
          {/* Destination */}
          <div>
            <label
              htmlFor="tx-destination"
              className="block text-[12px] font-medium text-ink-2 mb-1.5"
            >
              Destination Address
            </label>
            <input
              id="tx-destination"
              type="text"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setDestDirty(true);
              }}
              placeholder="G..."
              className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:ring-1 focus:ring-brand"
            />
          {/* Destination error — only rendered once dirty so queryByText returns null initially */}
            {destDirty && destination.length > 0 && (
              <p
                className={`text-[11px] text-red mt-1 transition-opacity ${showDestError ? "opacity-100" : "opacity-0"}`}
              >
                Invalid Stellar address
              </p>
            )}
            {isSelfPayment && (
              <p className="text-[11px] text-orange mt-1">
                Destination is the same as your wallet address
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="tx-amount"
              className="block text-[12px] font-medium text-ink-2 mb-1.5"
            >
              Amount (XLM)
            </label>
            <input
              id="tx-amount"
              type="number"
              min={MIN_AMOUNT}
              step="any"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setAmountDirty(true);
              }}
              placeholder="0.00"
              className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <p
              className={`text-[11px] text-red mt-1 transition-opacity ${showAmountError ? "opacity-100" : "opacity-0"}`}
            >
              Minimum amount is 0.0000001 XLM
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit || isLoading}
            aria-label={isLoading ? "Submitting…" : "Send Payment"}
            className="w-full rounded-lg bg-brand text-white h-9 px-4 text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? "Submitting…" : "Send"}
          </button>
        </form>
      )}
    </div>
  );
}
