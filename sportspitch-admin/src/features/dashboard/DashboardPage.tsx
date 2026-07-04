import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { MetricCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { sendPaymentReminder } from "@/lib/api/whatsapp";

export function DashboardPage() {
  const { bookings, players } = useAppData();

  const todaysBookings = bookings.filter((b) => b.day === "today");
  const pendingPayments = players.filter((p) => p.status !== "paid");
  const overdue = players.filter((p) => p.status === "overdue");
  const overdueAmount = overdue.reduce((sum, p) => sum + p.due, 0);
  const needsAttention = players.filter((p) => p.status === "overdue" || p.status === "dueSoon");

  async function remind(playerId: string) {
    try {
      const res = await sendPaymentReminder(playerId);
      window.open(res.whatsappUrl, "_blank", "noopener,noreferrer");
    } catch {
      // silently ignore -- the WhatsApp button in Payments has the same
      // action with a visible error state if this becomes an issue
    }
  }

  return (
    <div>
      <p className="mb-3 text-sm text-ink-secondary">Good morning</p>

      <div className="mb-6 grid grid-cols-2 gap-2.5">
        <MetricCard label="Today's bookings" value={String(todaysBookings.length)} />
        <MetricCard label="Pending payments" value={String(pendingPayments.length)} />
        <MetricCard label="Overdue" value={formatCurrency(overdueAmount)} tone="danger" />
        <MetricCard label="Active players" value={String(players.length)} />
      </div>

      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Today's bookings</h2>
        <Link to="/bookings" className="text-sm font-medium text-brand-500">
          View all
        </Link>
      </div>
      <div className="mb-6 divide-y divide-border rounded-lg border border-border bg-surface-2">
        {todaysBookings.length === 0 && (
          <p className="p-3 text-sm text-ink-muted">No bookings for today yet.</p>
        )}
        {todaysBookings.map((b) => (
          <div key={b.id} className="flex items-center justify-between p-3">
            <div>
              <p className="text-sm font-medium">{b.playerName}</p>
              <p className="text-xs text-ink-secondary">
                {b.sport} - {b.slotLabel}
              </p>
            </div>
            <StatusBadge status={b.status} />
          </div>
        ))}
      </div>

      <h2 className="mb-2 text-sm font-semibold">Needs attention</h2>
      <div className="divide-y divide-border rounded-lg border border-border bg-surface-2">
        {needsAttention.length === 0 && (
          <p className="p-3 text-sm text-ink-muted">No overdue or due-soon players.</p>
        )}
        {needsAttention.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-3">
            <div>
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-xs text-ink-secondary">
                {p.sport} - {formatCurrency(p.due)} due
              </p>
            </div>
            <Button
              variant="whatsapp"
              size="icon"
              className="rounded-full"
              onClick={() => remind(p.id)}
              aria-label={`Send WhatsApp reminder to ${p.name}`}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
