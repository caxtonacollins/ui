import { useCallback, useEffect, useState } from "react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useSorokit } from "@/context/useSorokit";
import type { ClaimableBalance } from "@/lib/client";
import { getClient } from "@/lib/client";
import { truncateAddress } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick01Icon } from "@hugeicons/core-free-icons";
import type { ClaimableBalance } from "@/lib/client";

/** Horizon predicate shape (only the fields we care about). */
type Predicate =
  | { unconditional: true }
  | { abs_before: string }
  | { abs_after: string }
  | { rel_before: number }
  | { rel_after: number }
  | { and: Predicate[] }
  | { or: Predicate[] }
  | { not: Predicate }
  | Record<string, never>;

/** Format a Unix-epoch string or number as a locale date string. */
function fmtEpoch(epoch: string | number): string {
  const ms = typeof epoch === "number" ? epoch * 1000 : parseInt(epoch, 10) * 1000;
  return new Date(ms).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Recursively converts a Horizon predicate object to a human-readable string.
 * Returns null when the predicate is unconditional or empty.
 */
function formatPredicate(p: unknown): string | null {
  if (!p || typeof p !== "object") return null;
  const pred = p as Predicate;

  if ("unconditional" in pred && (pred as { unconditional: true }).unconditional) return null;
  if ("abs_before" in pred) return `Claimable until ${fmtEpoch((pred as { abs_before: string }).abs_before)}`;
  if ("abs_after" in pred) return `Claimable from ${fmtEpoch((pred as { abs_after: string }).abs_after)}`;
  if ("rel_before" in pred) return `Claimable within ${(pred as { rel_before: number }).rel_before}s of creation`;
  if ("rel_after" in pred) return `Claimable after ${(pred as { rel_after: number }).rel_after}s of creation`;

  if ("and" in pred) {
    const parts = (pred as { and: Predicate[] }).and.map(formatPredicate).filter(Boolean);
    return parts.length ? parts.join(" and ") : null;
  }
  if ("or" in pred) {
    const parts = (pred as { or: Predicate[] }).or.map(formatPredicate).filter(Boolean);
    return parts.length ? parts.join(" or ") : null;
  }
  if ("not" in pred) {
    const inner = formatPredicate((pred as { not: Predicate }).not);
    return inner ? `Not (${inner})` : null;
  }

  return null;
}

interface BalanceRowProps {
  cb: ClaimableBalance;
  onClaimed: () => void;
}

function BalanceRow({ cb, onClaimed }: BalanceRowProps) {
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const rawCode = cb.asset.includes(":") ? cb.asset.split(":")[0] : cb.asset;
  const assetCode = rawCode === "native" ? "XLM" : rawCode;

  // Find the predicate for the first claimant that has one
  const predicateText =
    cb.claimants
      .map((c) => formatPredicate(c.predicate))
      .find((t) => t !== null) ?? null;

  async function handleClaim() {
    setClaiming(true);
    setClaimError(null);
    try {
      const { error } = await getClient().account.claimBalance(cb.id);
      if (!error) {
        setClaimed(true);
        onClaimed();
      } else {
        setClaimError(error);
      }
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-line last:border-0 gap-4">
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-ink">
            {parseFloat(cb.amount).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            })}
          </span>
          <Badge variant="teal">{assetCode}</Badge>
          {claimed && (
            <Badge variant="success" dot live>
              Claimed
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-4">
            Sponsor
          </span>
          <span data-address>{truncateAddress(cb.sponsor, 8, 6)}</span>
        </div>
        {predicateText && (
          <span className="text-[11px] text-ink-3 mt-0.5">{predicateText}</span>
        )}
      </div>
      {!claimed && (
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Button
            size="sm"
            loading={claiming}
            onClick={handleClaim}
            className="shrink-0"
          >
            Claim
          </Button>
          {claimError && (
            <span className="text-[10px] text-red max-w-[150px] text-right truncate">
              {claimError}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function ClaimableBalanceCard() {
  const { address, isConnected } = useSorokit();
  const [balances, setBalances] = useState<ClaimableBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!address) return;

    setLoading(true);
    setError(null);
    getClient()
      .account.getClaimableBalances(address)
      .then(({ data, error: err }) => {
        if (err) {
          setError(err);
          return;
        }
        setBalances(data ?? []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [address]);

  useEffect(() => {
    if (!address) return;

    let active = true;
    const timerId = window.setTimeout(() => {
      setLoading(true);
      getClient()
        .account.getClaimableBalances(address)
        .then(({ data, error: err }) => {
          if (!active) return;
          if (err) {
            setError(err);
            return;
          }
          setBalances(data ?? []);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timerId);
    };
  }, [address]);

  if (!isConnected) return null;

  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <div>
          <h3 className="text-[14px] font-semibold text-ink">
            Claimable Balances
          </h3>
          <p className="text-[12px] text-ink-3 mt-0.5">
            Pending balances available to claim
          </p>
        </div>
        {!loading && balances.length > 0 && (
          <Badge variant="warning">{balances.length} pending</Badge>
        )}
      </div>

      {loading ? (
        <div className="px-5 py-5 flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <div className="h-4 w-28 rounded bg-surface-2 animate-pulse" />
                <div className="h-3 w-36 rounded bg-surface-2 animate-pulse" />
              </div>
              <div className="h-8 w-16 rounded-lg bg-surface-2 animate-pulse" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-[13px] text-red text-center py-10">{error}</p>
      ) : balances.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10">
          <HugeiconsIcon
            icon={Tick01Icon}
            size={24}
            color="currentColor"
            className="text-green"
          />
          <p className="text-[13px] text-ink-3 text-center">
            No claimable balances
          </p>
        </div>
      ) : (
        <div>
          {balances.map((cb) => (
            <BalanceRow key={cb.id} cb={cb} onClaimed={load} />
          ))}
        </div>
      )}
    </div>
  );
}
