import { AccountCard } from "@/components/AccountCard";
import { BalanceList } from "@/components/BalanceList";
import { useSorokit } from "@/context/SorokitProvider";

export function AccountScreen() {
  const { isConnected } = useSorokit();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-12 h-12 rounded-full bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="5" r="2.2" stroke="#555" strokeWidth="1.3" />
            <path
              d="M2 12C2 9.79 4.24 8 7 8C9.76 8 12 9.79 12 12"
              stroke="#555"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
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
