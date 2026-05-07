import { useState } from "react";
import { useSorokit } from "@/context/SorokitProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { getClient, type TxResult } from "@/lib/client";

type State = "idle" | "loading" | "success" | "error";

export function TransactionPanel() {
  const { address, isConnected } = useSorokit();
  const [dest, setDest] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<TxResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    isConnected && dest.trim() && amount.trim() && parseFloat(amount) > 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setState("loading");
    setError(null);
    setResult(null);
    try {
      const { data, error: err } = await getClient().transaction.submit({
        source: address,
        destination: dest.trim(),
        amount: amount.trim(),
        memo: memo.trim() || undefined,
        asset: "XLM",
      });
      if (err) {
        setError(err);
        setState("error");
        return;
      }
      setResult(data);
      setState("success");
      setDest("");
      setAmount("");
      setMemo("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setState("error");
    }
  }

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#2a2a2a]">
        <h3 className="text-[14px] font-semibold text-[#ebebeb]">
          Send Payment
        </h3>
        <p className="text-[12px] text-[#555] mt-0.5">
          Submit a payment on the Stellar network
        </p>
      </div>

      {/* Body */}
      <div className="px-6 py-6">
        {!isConnected ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-10 h-10 rounded-full bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
                <rect
                  x="1"
                  y="3.5"
                  width="12"
                  height="8"
                  rx="1.5"
                  stroke="#555"
                  strokeWidth="1.3"
                />
                <path d="M1 6.5H13" stroke="#555" strokeWidth="1.3" />
              </svg>
            </div>
            <p className="text-[13px] text-[#555]">
              Connect your wallet to send transactions
            </p>
          </div>
        ) : state === "success" && result ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[rgba(34,197,94,0.1)] flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6L5 9L10 3"
                    stroke="#22c55e"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#ebebeb]">
                  Transaction submitted
                </p>
                <p className="text-[12px] text-[#555]">
                  Ledger #{result.ledger}
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] px-5 py-4 flex flex-col gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#444]">
                Transaction Hash
              </p>
              <span data-txhash className="break-all leading-relaxed">
                {result.hash}
              </span>
              <Badge variant="success" dot>
                Successful
              </Badge>
            </div>
          </div>
        ) : state === "error" ? (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[rgba(239,68,68,0.1)] flex items-center justify-center shrink-0 mt-0.5">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 4V6.5M6 8.5H6.01"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle
                  cx="6"
                  cy="6"
                  r="4.5"
                  stroke="#ef4444"
                  strokeWidth="1.2"
                />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#ebebeb]">
                Transaction failed
              </p>
              <p className="text-[13px] text-[#ef4444] mt-1">{error}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-5">
            <Input
              label="Destination Address"
              placeholder="G..."
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              disabled={state === "loading"}
            />
            <Input
              label="Amount (XLM)"
              type="number"
              placeholder="0.00"
              min="0.0000001"
              step="0.0000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={state === "loading"}
            />
            <Input
              label="Memo (optional)"
              placeholder="Text memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              disabled={state === "loading"}
            />
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#2a2a2a] flex items-center gap-3">
        {state === "success" || state === "error" ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setState("idle");
              setResult(null);
              setError(null);
            }}
          >
            New Transaction
          </Button>
        ) : (
          <Button
            size="md"
            loading={state === "loading"}
            disabled={!canSubmit}
            onClick={submit as unknown as React.MouseEventHandler}
          >
            {state === "loading" ? "Submitting…" : "Send Payment"}
          </Button>
        )}
      </div>
    </div>
  );
}
