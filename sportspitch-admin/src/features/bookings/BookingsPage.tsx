import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { cn } from "@/lib/utils";
import { BookingCard } from "./BookingCard";
import type { Booking } from "@/types";

const tabs: { key: Booking["day"]; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
];

export function BookingsPage() {
  const { bookings, refetchBookings } = useAppData();
  const [tab, setTab] = useState<Booking["day"]>("today");

  const filtered = bookings.filter((b) => b.day === tab);

  return (
    <div>
      <h1 className="mb-3 text-lg font-semibold">Bookings</h1>

      <div className="mb-4 flex rounded-lg bg-surface-1 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
              tab === t.key ? "bg-surface-2 text-ink-primary shadow-sm" : "text-ink-muted"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-muted">No bookings here.</p>
        )}
        {filtered.map((b) => (
          <BookingCard key={b.id} booking={b} onChanged={refetchBookings} />
        ))}
      </div>
    </div>
  );
}
