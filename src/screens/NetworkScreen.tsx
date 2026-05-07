import { useSorokit } from "@/context/SorokitProvider";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { NetworkName } from "@/lib/client";

const NETWORKS: {
  name: NetworkName;
  label: string;
  description: string;
  dotClass: string;
  badge: "success" | "warning" | "purple" | "default";
}[] = [
  {
    name: "mainnet",
    label: "Mainnet",
    description: "Public Global Stellar Network — real assets",
    dotClass: "bg-[#22c55e]",
    badge: "success",
  },
  {
    name: "testnet",
    label: "Testnet",
    description: "Test SDF Network — free test XLM via Friendbot",
    dotClass: "bg-[#f97316]",
    badge: "warning",
  },
  {
    name: "futurenet",
    label: "Futurenet",
    description: "Test SDF Future Network — bleeding edge features",
    dotClass: "bg-[#a855f7]",
    badge: "purple",
  },
  {
    name: "localnet",
    label: "Localnet",
    description: "Local development network — requires local node",
    dotClass: "bg-[#555555]",
    badge: "default",
  },
];

export function NetworkScreen() {
  const { network, switchNetwork } = useSorokit();

  return (
    <div className="flex flex-col gap-5">
      {/* Active network info */}
      {network && (
        <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a2a]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#444]">
              Active Network
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#2a2a2a]">
            <InfoCell label="Name" value={network.name} />
            <InfoCell label="Passphrase" value={network.passphrase} mono />
            <InfoCell label="RPC URL" value={network.rpcUrl} mono />
            <InfoCell label="Horizon URL" value={network.horizonUrl} mono />
          </div>
        </div>
      )}

      {/* Network selector */}
      <div className="flex flex-col gap-3">
        {NETWORKS.map((net) => {
          const isActive = network?.name === net.name;
          return (
            <button
              key={net.name}
              onClick={() => switchNetwork(net.name)}
              className={cn(
                "w-full text-left rounded-xl border px-6 py-5 transition-colors cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5645d4]",
                isActive
                  ? "border-[rgba(86,69,212,0.35)] bg-[rgba(86,69,212,0.06)]"
                  : "border-[#2a2a2a] bg-[#141414] hover:bg-[#181818] hover:border-[#333]",
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "w-2.5 h-2.5 rounded-full shrink-0 mt-0.5",
                      net.dotClass,
                    )}
                  />
                  <div>
                    <p className="text-[14px] font-medium text-[#ebebeb]">
                      {net.label}
                    </p>
                    <p className="text-[12px] text-[#555] mt-0.5">
                      {net.description}
                    </p>
                  </div>
                </div>
                {isActive && (
                  <Badge variant={net.badge} dot>
                    Active
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>
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
        className={cn(
          "text-[13px] text-[#aaa] break-all",
          mono && "font-mono text-[12px]",
        )}
      >
        {value}
      </span>
    </div>
  );
}
