import { useEffect, useState } from "react";
import { getClient } from "@/lib/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { RefreshCwIcon } from "@hugeicons/react";

const XLM_STROOPS = 10_000_000;
const HIGH_FEE_THRESHOLD = 2;

export interface FeeEstimatorProps {
  operations?: number;
  network?: string;
  onEstimate?: (fee: string) => void;
}

interface FeeData {
  baseFee: string;
  recommended: string;
}

export function FeeEstimator({ operations = 1, network, onEstimate }: FeeEstimatorProps) {
  const [feeData, setFeeData] = useState<FeeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFees = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await getClient().transaction.estimateFee({
        operations,
      });
      if (err) {
        setError(err);
        setFeeData(null);
      } else if (data) {
        setFeeData(data);
        onEstimate?.(data.recommended);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to estimate fee");
      setFeeData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
    const interval = setInterval(fetchFees, 10000);
    return () => clearInterval(interval);
  }, [operations]);

  const isHighFee =
    feeData &&
    parseFloat(feeData.recommended) > parseFloat(feeData.baseFee) * HIGH_FEE_THRESHOLD;

  const recommendedXlm = feeData
    ? (parseFloat(feeData.recommended) / XLM_STROOPS).toFixed(7)
    : null;

  const baseXlm = feeData
    ? (parseFloat(feeData.baseFee) / XLM_STROOPS).toFixed(7)
    : null;

  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-line">
        <h3 className="text-[14px] font-semibold text-ink">Network Fee</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={fetchFees}
          disabled={loading}
          aria-label="Refresh fee estimate"
          title="Refresh"
        >
          <RefreshCwIcon size={16} color="currentColor" />
        </Button>
      </div>

      {loading && !feeData ? (
        <div className="px-6 py-5 flex flex-col gap-3">
          <div className="h-4 w-24 rounded bg-surface-2 animate-pulse" />
          <div className="h-4 w-32 rounded bg-surface-2 animate-pulse" />
        </div>
      ) : error ? (
        <p className="text-[13px] text-red text-center py-6">{error}</p>
      ) : feeData ? (
        <div
          className="px-6 py-5"
          role="region"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-ink-3 uppercase font-semibold">
                Base Fee
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-mono text-ink">
                  {feeData.baseFee}
                </span>
                <span className="text-[11px] text-ink-3">
                  ({baseXlm} XLM)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-ink-3 uppercase font-semibold">
                  Recommended
                </span>
                {isHighFee && (
                  <Badge variant="warning" size="xs">
                    High fee
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-mono text-ink">
                  {feeData.recommended}
                </span>
                <span className="text-[11px] text-ink-3">
                  ({recommendedXlm} XLM)
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
