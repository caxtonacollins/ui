import { useState, useEffect, useCallback, useRef } from "react";
import { getClient } from "@/lib/client";
import type { ContractEvent } from "@/lib/client";

export interface ContractEventFeedProps {
  /** The Soroban contract ID to monitor */
  contractId: string;
  /** Maximum number of events to fetch (default: 10) */
  limit?: number;
  /** Polling interval in ms; 0 = no polling (default: 0) */
  pollInterval?: number;
  /** @deprecated use pollInterval instead */
  autoRefresh?: number;
  /** Callback when an event row is clicked */
  onEventClick?: (event: ContractEvent) => void;
  className?: string;
}

export function ContractEventFeed({
  contractId,
  limit = 10,
  pollInterval = 0,
  onEventClick,
  className,
}: ContractEventFeedProps) {
  const [events, setEvents] = useState<ContractEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(pollInterval > 0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error: err } = await getClient().soroban.getEvents(
        contractId,
        limit,
      );
      if (err) {
        setError(err);
        setEvents(null);
      } else {
        setEvents(data ?? []);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [contractId, limit]);

  // Initial fetch + re-fetch when contractId changes
  useEffect(() => {
    setLoading(true);
    setEvents(null);
    setError(null);
    fetchEvents();
  }, [contractId, fetchEvents]);

  // Polling
  useEffect(() => {
    if (!live || pollInterval <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(fetchEvents, pollInterval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [live, pollInterval, fetchEvents]);

  function toggleLive() {
    setLive((prev) => !prev);
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-semibold text-ink">Contract Events</h3>
        {pollInterval > 0 && (
          <button
            type="button"
            aria-pressed={live}
            onClick={toggleLive}
            className="text-[12px] text-ink-2 hover:text-ink"
          >
            {live ? "Live" : "Paused"}
          </button>
        )}
      </div>

      {/* Live region for accessibility */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {events !== null && !loading && !error
          ? `${events.length} events loaded`
          : null}
      </div>

      {/* Content */}
      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-surface-2 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <p className="text-[13px] text-red">{error}</p>
      ) : events && events.length === 0 ? (
        <p className="text-[13px] text-ink-3 text-center py-8">
          No events found
        </p>
      ) : (
        <div className="space-y-1">
          {(events ?? []).map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => onEventClick?.(event)}
              className="w-full text-left rounded-lg px-4 py-3 bg-surface-2 hover:bg-surface transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-ink">
                  {event.type}
                </span>
                <span className="text-[11px] text-ink-3">
                  {new Date(event.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
