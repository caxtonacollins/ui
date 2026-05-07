import { useSorokit } from "@/context/SorokitProvider";
import { Button } from "@/components/ui/Button";

export function ConnectScreen() {
  const { connectWallet, isConnecting, error, clearError } = useSorokit();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] px-4">
      <div className="w-full max-w-[400px] flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#5645d4] flex items-center justify-center shadow-[0_0_40px_rgba(86,69,212,0.3)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12C5 8.13 8.13 5 12 5C15.87 5 19 8.13 19 12C19 15.87 15.87 19 12 19"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M12 19C10.34 19 9 17.66 9 16C9 14.34 10.34 13 12 13"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="12" r="1.5" fill="white" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-[22px] font-semibold text-[#ebebeb] tracking-tight">
              sorokit
            </h1>
            <p className="text-[13px] text-[#555] mt-1">
              Stellar control dashboard
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
          <div className="px-8 pt-8 pb-6 border-b border-[#2a2a2a]">
            <h2 className="text-[18px] font-semibold text-[#ebebeb] tracking-tight">
              Connect Wallet
            </h2>
            <p className="text-[13px] text-[#555] mt-2 leading-relaxed">
              Connect your Stellar wallet to access the dashboard and manage
              your assets.
            </p>
          </div>

          <div className="px-8 py-6 flex flex-col gap-4">
            {error && (
              <div className="flex items-start justify-between gap-3 rounded-lg bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.15)] px-4 py-3">
                <p className="text-[13px] text-[#ef4444]">{error}</p>
                <button
                  onClick={clearError}
                  className="text-[#ef4444] opacity-50 hover:opacity-100 shrink-0 mt-0.5 transition-opacity"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 2L10 10M10 2L2 10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            )}

            <Button
              size="lg"
              loading={isConnecting}
              onClick={connectWallet}
              className="w-full justify-center"
            >
              {isConnecting ? "Connecting…" : "Connect Wallet"}
            </Button>

            <p className="text-[11px] text-[#444] text-center">
              Powered by sorokit-core · Stellar network
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
