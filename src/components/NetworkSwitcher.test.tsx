import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NetworkSwitcher } from "./NetworkSwitcher";
import { useSorokit } from "@/context/useSorokit";

vi.mock("@/context/useSorokit", () => ({ useSorokit: vi.fn() }));

// Radix DropdownMenu relies on pointer events and portals that don't work in jsdom.
// Replace with thin pass-through stubs so items are always rendered.
vi.mock("@radix-ui/react-dropdown-menu", () => ({
  Root: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Trigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Content: ({ children }: { children: React.ReactNode }) => <div role="menu">{children}</div>,
  Item: ({
    children,
    onSelect,
    className,
  }: {
    children: React.ReactNode;
    onSelect?: () => void;
    className?: string;
  }) => (
    <div role="menuitem" className={className} onClick={onSelect}>
      {children}
    </div>
  ),
}));

const switchNetwork = vi.fn();

beforeEach(() => vi.clearAllMocks());

describe("NetworkSwitcher", () => {
  it("shows the current network in the trigger button", () => {
    vi.mocked(useSorokit).mockReturnValue({
      network: { name: "mainnet" },
      switchNetwork,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<NetworkSwitcher />);
    expect(screen.getByRole("button", { name: /mainnet/i })).toBeInTheDocument();
  });

  it("calls switchNetwork with the correct network name on selection", () => {
    vi.mocked(useSorokit).mockReturnValue({
      network: { name: "testnet" },
      switchNetwork,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<NetworkSwitcher />);
    fireEvent.click(screen.getByRole("menuitem", { name: /mainnet/i }));
    expect(switchNetwork).toHaveBeenCalledWith("mainnet");
  });

  it("active network item has font-medium class", () => {
    vi.mocked(useSorokit).mockReturnValue({
      network: { name: "testnet" },
      switchNetwork,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<NetworkSwitcher />);
    expect(screen.getByRole("menuitem", { name: /testnet/i })).toHaveClass("font-medium");
    expect(screen.getByRole("menuitem", { name: /mainnet/i })).not.toHaveClass("font-medium");
  });
});
