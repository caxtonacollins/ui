import { useSorokit } from "@/context/SorokitProvider";
import { AccountCard } from "@/components/AccountCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { truncateAddress } from "@/lib/utils";

export function WalletScreen() {
  const { address, isConnected, disconnectWallet, network } = useSorokit();

  return (
    <div className="flex flex-col gap-6">
      {/* ── Status card ── */}
      <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-11 h-11 rounded-full bg-[rgba(86,69,212,0.15)] border-2 border-[rgba(86,69,212,0.25)] flex items-center justify-center text-[13px] font-bold text-[#5645d4] shrink-0">
              {address ? address.slice(0, 2).toUpperCase() : "—"}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <span className="text-[15px] font-semibold text-[#ebebeb]">
                  {isConnected ? "Connected" : "Not connected"}
                </span>
                <Badge variant={isConnected ? "success" : "default"} dot>
                  {isConnected ? "Active" : "Inactive"}
                </Badge>
              </div>
              {address && (
                <span data-address>{truncateAddress(address, 14, 6)}</span>
              )}
            </div>
          </div>
          {isConnected && (
            <Button variant="secondary" size="sm" onClick={disconnectWallet}>
              Disconnect
            </Button>
          )}
        </div>

        {/* Network info */}
        {network && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[#2a2a2a]">
            <InfoCell label="Network" value={network.name} />
            <InfoCell label="RPC Endpoint" value={network.rpcUrl} mono />
          </div>
        )}
      </div>

      {/* ── Account details ── */}
      <AccountCard />
    </div>
  );
}

function InfoCell({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="px-6 py-4 flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#444]">
        {label}
      </span>
      <span
        className={`text-[13px] text-[#aaa] break-all ${mono ? "font-mono text-[12px]" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
