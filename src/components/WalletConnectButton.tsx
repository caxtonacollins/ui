import { useSorokit } from "@/context/useSorokit";
import { Button } from "@/components/ui/Button";
import { truncateAddress } from "@/lib/utils";

export function WalletConnectButton({
  onOpenModal,
}: {
  onOpenModal?: () => void;
}) {
  const { isConnected, isConnecting, address, connectWallet } = useSorokit();

  if (isConnected && address) {
    return (
      <button
        onClick={onOpenModal}
        className="inline-flex items-center gap-2 h-8 px-3.5 rounded-lg bg-surface-2 border border-line hover:border-line-2 transition-colors cursor-pointer"
      >
        <span className="w-2 h-2 rounded-full bg-green shrink-0" />
        <span data-address>{truncateAddress(address)}</span>
      </button>
    );
  }

  return (
    <Button size="md" loading={isConnecting} onClick={connectWallet}>
      {isConnecting ? "Connecting…" : "Connect Wallet"}
    </Button>
  );
}
