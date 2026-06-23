import { AccountCard } from "@/components/AccountCard";
import { BalanceList } from "@/components/BalanceList";
import { useSorokit } from "@/context/useSorokit";
import { HugeiconsIcon } from "@hugeicons/react";
import { User02Icon } from "@hugeicons/core-free-icons";

export function AccountScreen() {
  const { isConnected } = useSorokit();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-12 h-12 rounded-full bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center">
          <HugeiconsIcon
            icon={User02Icon}
            size={20}
            color="#555"
            strokeWidth={1.3}
          />
        </div>
        <p className="text-[13px] text-[#555]">
          Connect your wallet to view account details
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <AccountCard />
      <BalanceList />
    </div>
  );
}
