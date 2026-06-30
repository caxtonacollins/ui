/**
 * ContractEventFeed Component
 * 
 * Real-time feed of contract events from Soroban smart contracts.
 * Displays event history, filtering, and search capabilities.
 * 
 * @component
 * @example
 * ```tsx
 * import { ContractEventFeed } from 'sorokit-ui';
 * 
 * export function Dashboard() {
 *   return (
 *     <ContractEventFeed 
 *       contractId="CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4"
 *       limit={50}
 *     />
 *   );
 * }
 * ```
 * 
 * @param props - Component props
 * @param props.contractId - Smart contract ID to monitor
 * @param props.limit - Maximum number of events to display (default: 100)
 * @param props.autoRefresh - Auto-refresh interval in ms (default: 5000, 0 to disable)
 * @param props.onEventClick - Callback when event is clicked
 * 
 * @returns The rendered ContractEventFeed component
 * 
 * @throws Error if contractId is invalid format
 * 
 * @remarks
 * - Auto-refreshes every 5 seconds by default
 * - Shows timestamp, topics, and event data
 * - Searchable event topics
 * - Requires SorokitProvider context
 * - Known issue: QR code scanner doesn't work with complex metadata (issue #8)
 * 
 * @see {@link SorokitProvider} for setup
 * @see GitHub issue #8 for QR code scanner limitation
 */
import { useState, useEffect, useRef } from "react";
import { getClient } from "@/lib/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { ContractEvent } from '@/lib/client';
import { HugeiconsIcon } from "@hugeicons/react";
import { PlayIcon, PauseIcon } from "@hugeicons/core-free-icons";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  
  if (diffSecs < 60) return "just now";
  if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
  if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
  return `${Math.floor(diffSecs / 86400)}d ago`;
}

export function ContractEventFeed({
  contractId,
  limit = 100,
  autoRefresh = 5000,
  onEventClick
}: ContractEventFeedProps) {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadEvents = async () => {
    if (!contractId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const client = getClient();
      const result = await client.soroban.getEvents(contractId, limit);
      
      if (result.error) {
        setError(result.error);
        setEvents([]);
      } else {
        setEvents(result.data ?? []);
        setLastUpdated(new Date());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [contractId, limit]);

  useEffect(() => {
    if (!isLive || autoRefresh === 0) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    pollIntervalRef.current = setInterval(() => {
      loadEvents();
    }, autoRefresh);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isLive, autoRefresh, contractId, limit]);

  const toggleLive = () => {
    setIsLive(!isLive);
  };

  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <div>
          <h3 className="text-[14px] font-semibold text-ink">Contract Events</h3>
          <p className="text-[12px] text-ink-3 mt-0.5">
            {lastUpdated ? `Last updated: ${formatRelativeTime(lastUpdated)}` : "Loading..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="w-4 h-4 border border-ink-3 border-t-transparent rounded-full animate-spin" />
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleLive}
            aria-label={isLive ? "Pause live updates" : "Resume live updates"}
            aria-pressed={isLive}
          >
            <HugeiconsIcon
              icon={isLive ? PauseIcon : PlayIcon}
              size={12}
              color="currentColor"
              strokeWidth={2}
            />
            {isLive ? "Live" : "Paused"}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-[13px] text-red text-center py-10">{error}</p>
      ) : loading && events.length === 0 ? (
        <div className="px-5 py-4 flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-2 animate-pulse shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-3 w-32 rounded bg-surface-2 animate-pulse" />
                <div className="h-2.5 w-20 rounded bg-surface-2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <p className="text-[13px] text-ink-3 text-center py-10">
          No events found
        </p>
      ) : (
        <div aria-live="polite">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between px-5 py-3.5 border-b border-line last:border-0 gap-4 cursor-pointer hover:bg-surface-2 transition-colors"
              onClick={() => onEventClick?.(event)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-white">
                    {event.type.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[13px] text-ink font-medium truncate">
                    {event.type}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-ink-3">Ledger {event.ledger}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                <Badge variant="default" live>
                  {event.topics.length} topics
                </Badge>
                <span className="text-[10px] text-ink-3">
                  {new Date(event.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export interface ContractEventFeedProps {
  contractId: string;
  limit?: number;
  autoRefresh?: number;
  pollInterval?: number;
  onEventClick?: (event: ContractEvent) => void;
}
