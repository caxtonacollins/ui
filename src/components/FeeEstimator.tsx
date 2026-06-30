import { useState, useEffect, useCallback } from "react";
import { getClient } from "@/lib/client";
import { AssetRowSkeleton } from "@/components/ui/Skeleton";

export interface FeeEstimatorProps {
  /** @deprecated unused — fee estimation always uses the injected client */
  operations?: number;
  /** @deprecated unused — fee estimation always uses the injected client */
  network?: "testnet" | "public";
  /** Callback invoked with the recommended fee string whenever fees load */
  onEstimate?: (fee: string) => void;
  className?: string;
}

interface FeeData {
  baseFee: string;
  recommended: string;
}

export function FeeEstimator({ onEstimate, className }: FeeEstimatorProps) {
  const [loading, setLoading] = useState(true);
  const [fee, setFee] = useState<FeeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await getClient().transaction.estimateFee();
      if (err) {
        setError(err);
      } else if (data) {
        setFee(data);
        onEstimate?.(data.recommended);
      }
    } finally {
      setLoading(false);
    }
  }, [onEstimate]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-semibold text-ink">Network Fee</h3>
        <button
          type="button"
          title="Refresh"
          aria-label="Refresh fee estimate"
          disabled={loading}
          onClick={load}
          className="text-ink-2 hover:text-ink disabled:opacity-40 transition-colors"
        >
          ↻
        </button>
      </div>

      {/* Persistent aria-live region so it exists even during loading */}
      <div aria-live="polite" aria-atomic="true">
        {loading ? (
          <AssetRowSkeleton />
        ) : error ? (
          <p className="text-[13px] text-red">{error}</p>
        ) : fee ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-surface-2 px-4 py-3">
              <p className="text-[11px] text-ink-3 mb-1">Base Fee</p>
              <p className="text-[14px] font-semibold text-ink tabular-nums">
                {fee.baseFee}
              </p>
            </div>
            <div className="rounded-lg bg-surface-2 px-4 py-3">
              <p className="text-[11px] text-ink-3 mb-1">Recommended</p>
              <p className="text-[14px] font-semibold text-ink tabular-nums">
                {fee.recommended}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
