import { useSorokit } from "@/context/SorokitProvider";
import { Badge } from "@/components/ui/Badge";
import { truncateAddress } from "@/lib/utils";

export function AccountCard() {
  const { address, account, isLoadingAccount } = useSorokit();
  if (!address) return null;

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
        <div>
          <h3 className="text-[14px] font-semibold text-[#ebebeb]">Account</h3>
          <p className="text-[12px] text-[#555] mt-0.5">
            Stellar account details
          </p>
        </div>
        <Badge variant="success" dot>
          Active
        </Badge>
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        {isLoadingAccount ? (
          <div className="flex flex-col gap-4">
            {[80, 48, 32].map((w, i) => (
              <div
                key={i}
                className={`h-4 rounded-lg bg-[#1c1c1c] animate-pulse w-${w === 80 ? "full" : w === 48 ? "48" : "32"}`}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <Field label="Address">
              <span data-address className="break-all leading-relaxed">
                {address}
              </span>
            </Field>
            {account && (
              <div className="grid grid-cols-2 gap-5">
                <Field label="Sequence">
                  <span className="font-mono text-[12px] text-[#aaa]">
                    {account.sequence}
                  </span>
                </Field>
                <Field label="Subentries">
                  <span className="text-[13px] text-[#ebebeb]">
                    {account.subentryCount}
                  </span>
                </Field>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#444]">
        {label}
      </span>
      {children}
    </div>
  );
}

export function AccountCardCompact() {
  const { address } = useSorokit();
  if (!address) return null;
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
      <div className="w-7 h-7 rounded-full bg-[#5645d4] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
        {address.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[10px] text-[#555] uppercase tracking-widest">
          Connected
        </span>
        <span data-address className="truncate">
          {truncateAddress(address)}
        </span>
      </div>
    </div>
  );
}
