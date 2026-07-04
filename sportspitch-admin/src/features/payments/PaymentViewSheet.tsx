import type { ReactNode } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Player } from "@/types";

export function PaymentViewSheet({
  player,
  onClose,
}: {
  player: Player | null;
  onClose: () => void;
}) {
  if (!player) return null;

  const latestTransaction = player.transactions[player.transactions.length - 1];

  return (
    <Sheet open={!!player} onOpenChange={(open) => !open && onClose()}>
      <SheetContent title={`Payment - ${player.name}`}>
        <div className="mb-5 divide-y divide-border rounded-lg border border-border">
          <Row label="Status" value={<StatusBadge status={player.status} />} />
          <Row label="Amount paid" value={formatCurrency(player.amountPaid)} />
          <Row label="Balance amount" value={formatCurrency(player.due)} />
          <Row label="Month" value={player.month} />
          {latestTransaction && (
            <Row label="Last payment" value={`${latestTransaction.createdAt.slice(0, 10)} via ${latestTransaction.paymentMethod}`} />
          )}
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Transactions this month
        </p>
        {player.transactions.length === 0 ? (
          <p className="text-sm text-ink-muted">No payments recorded yet.</p>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {player.transactions.map((t) => (
              <div key={t._id} className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{formatCurrency(t.amount)}</span>
                  <span className="text-xs text-ink-secondary">{t.createdAt.slice(0, 10)}</span>
                </div>
                <p className="text-xs text-ink-secondary">{t.paymentMethod}{t.remarks ? ` - ${t.remarks}` : ""}</p>
                {t.editedBy && (
                  <p className="mt-1 text-[11px] text-ink-muted">
                    Edited by {t.editedBy} on {t.editedAt?.slice(0, 10)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3">
      <span className="text-sm text-ink-secondary">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
