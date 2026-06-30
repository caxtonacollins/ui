import { useState } from "react";
import { getClient } from "@/lib/client";
import { useSorokit } from "@/context/useSorokit";

export interface SorobanPanelProps {
  /** The Soroban contract ID — controlled by the parent */
  contractId: string;
  /** Called whenever the user edits the contract ID input */
  onContractIdChange?: (id: string) => void;
  className?: string;
}

type InvokeStatus = "idle" | "loading" | "success" | "error";

export function SorobanPanel({
  contractId,
  onContractIdChange,
  className,
}: SorobanPanelProps) {
  const { address } = useSorokit();

  const [method, setMethod] = useState("");
  const [argsRaw, setArgsRaw] = useState("");
  const [status, setStatus] = useState<InvokeStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);

  const canInvoke = contractId.trim().length > 0 && method.trim().length > 0;

  async function handleInvoke() {
    if (!canInvoke) return;

    // Validate JSON args
    let parsedArgs: unknown[] = [];
    if (argsRaw.trim()) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(argsRaw.trim());
      } catch {
        setError("Invalid JSON in arguments. Please provide a valid JSON array.");
        setStatus("error");
        return;
      }
      if (!Array.isArray(parsed)) {
        setError("Arguments must be a JSON array (e.g. [\"arg1\", 42]).");
        setStatus("error");
        return;
      }
      parsedArgs = parsed;
    }

    setStatus("loading");
    setError(null);
    setResult(null);

    try {
      const { data, error: invokeError } = await getClient().soroban.invokeContract({
        contractId: contractId.trim(),
        method: method.trim(),
        args: parsedArgs,
        sourceAccount: address ?? undefined,
      });

      if (invokeError) {
        setError(invokeError);
        setStatus("error");
      } else {
        setResult(data);
        setStatus("success");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    }
  }

  function handleClear() {
    setStatus("idle");
    setError(null);
    setResult(null);
    setMethod("");
    setArgsRaw("");
  }

  return (
    <div className={className}>
      {/* Contract ID row — controlled externally */}
      <div className="mb-4">
        <label
          htmlFor="soroban-contract-id"
          className="block text-[12px] font-medium text-ink-2 mb-1.5"
        >
          Contract ID
        </label>
        <input
          id="soroban-contract-id"
          type="text"
          placeholder="C..."
          value={contractId}
          onChange={(e) => onContractIdChange?.(e.target.value)}
          className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      {/* Method */}
      <div className="mb-4">
        <label
          htmlFor="soroban-method"
          className="block text-[12px] font-medium text-ink-2 mb-1.5"
        >
          Method
        </label>
        <input
          id="soroban-method"
          type="text"
          placeholder="transfer"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      {/* Arguments */}
      <div className="mb-4">
        <label
          htmlFor="soroban-args"
          className="block text-[12px] font-medium text-ink-2 mb-1.5"
        >
          Arguments (JSON array)
        </label>
        <input
          id="soroban-args"
          type="text"
          placeholder='["arg1", 42]'
          value={argsRaw}
          onChange={(e) => setArgsRaw(e.target.value)}
          className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      {/* Invoke button */}
      <button
        type="button"
        disabled={!canInvoke || status === "loading"}
        onClick={handleInvoke}
        className="w-full rounded-lg bg-brand text-white h-9 px-4 text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Invoking…" : "Invoke"}
      </button>

      {/* Error */}
      {(status === "error" || error) && (
        <div className="mt-3 rounded-lg bg-error-dim border border-error-dim-strong px-4 py-3">
          <p className="text-[13px] text-red">{error}</p>
        </div>
      )}

      {/* Result */}
      {status === "success" && result !== null && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[13px] font-semibold text-ink">Result</h4>
            <button
              type="button"
              onClick={handleClear}
              className="text-[12px] text-ink-2 hover:text-ink"
            >
              Clear
            </button>
          </div>
          <pre className="rounded-lg bg-surface-2 p-4 text-[12px] text-ink-2 overflow-auto max-h-60">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
