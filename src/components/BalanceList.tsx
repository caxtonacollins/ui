import { useSorokit } from "@/context/SorokitProvider";
import { Badge } from "@/components/ui/Badge";
import { truncateAddress } from "@/lib/utils";
import type { Balance } from "@/lib/client";

function AssetRow({ b }: { b: Balance }) {
  const symbol = b.assetType === "native" ? "XLM" : (b.assetCode ?? b.asset);
  const isNative = b.assetType === "native";

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a] last:border-0">
      <div className="flex items-center gap-4">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
            isNative
              ? "bg-[rgba(20,184,166,0.12)] text-[#14b8a6]"
              : "bg-[rgba(168,85,247,0.12)] text-[#a855f7]"
          }`}
        >
          {symbol.slice(0, 2)}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[14px] font-medium text-[#ebebeb]">
            {symbol}
          </span>
          {b.assetIssuer ? (
            <span data-address>{truncateAddress(b.assetIssuer, 8, 4)}</span>
          ) : (
            <span className="text-[11px] text-[#555]">Stellar Lumens</span>
          )}
        </div>
      </div>
      <span className="text-[14px] font-semibold text-[#ebebeb] tabular-nums">
        {parseFloat(b.balance).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })}
      </span>
    </div>
  );
}

export function BalanceList() {
  const { balances, isLoadingAccount, isConnected } = useSorokit();
  if (!isConnected) return null;

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
        <div>
          <h3 className="text-[14px] font-semibold text-[#ebebeb]">Assets</h3>
          <p className="text-[12px] text-[#555] mt-0.5">Token balances</p>
        </div>
        {!isLoadingAccount && (
          <Badge variant="default">{balances.length} assets</Badge>
        )}
      </div>

      {/* Rows */}
      {isLoadingAccount ? (
        <div className="px-6 py-5 flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-[#1c1c1c] animate-pulse shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-3.5 w-20 rounded bg-[#1c1c1c] animate-pulse" />
                <div className="h-3 w-28 rounded bg-[#1c1c1c] animate-pulse" />
              </div>
              <div className="h-3.5 w-16 rounded bg-[#1c1c1c] animate-pulse" />
            </div>
          ))}
        </div>
      ) : balances.length === 0 ? (
        <p className="text-[13px] text-[#555] text-center py-10">
          No assets found
        </p>
      ) : (
        <div>
          {balances.map((b) => (
            <AssetRow key={b.asset} b={b} />
          ))}
        </div>
      )}
    </div>
  );
}
