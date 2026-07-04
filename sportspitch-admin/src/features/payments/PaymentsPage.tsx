import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { useReminderQueue } from "@/hooks/useReminderQueue";
import { usePinGate } from "@/hooks/usePinGate";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { sendPaymentReminder } from "@/lib/api/whatsapp";
import type { Player, PaymentStatus } from "@/types";
import { PaymentViewSheet } from "./PaymentViewSheet";
import { PaymentEditSheet } from "./PaymentEditSheet";
import { ReminderQueueSheet } from "./ReminderQueueSheet";

const groupOrder: { key: PaymentStatus; label: string }[] = [
  { key: "overdue", label: "Overdue" },
  { key: "dueSoon", label: "Due soon" },
  { key: "partiallyPaid", label: "Partially paid" },
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Paid" },
];

export function PaymentsPage() {
  const { players, refetchPlayers, settings } = useAppData();
  const { requestPin } = usePinGate();
  const reminderQueue = useReminderQueue();
  const [viewPlayer, setViewPlayer] = useState<Player | null>(null);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);

  const editedBy = settings?.adminName || "Admin";

  function handleEditClick(player: Player) {
    requestPin(() => setEditPlayer(player));
  }

  async function remind(playerId: string) {
    const res = await sendPaymentReminder(playerId);
    window.open(res.whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Payments</h1>
        <Button
          variant="whatsapp"
          size="sm"
          onClick={() => reminderQueue.start()}
          disabled={reminderQueue.loading}
        >
          <MessageCircle className="h-4 w-4" />
          {reminderQueue.loading ? "Loading..." : "Remind all due"}
        </Button>
      </div>

      {groupOrder.map(({ key, label }) => {
        const list = players.filter((p) => p.status === key);
        if (list.length === 0) return null;
        return (
          <div key={key} className="mb-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
              {label}
            </p>
            <div className="divide-y divide-border rounded-lg border border-border bg-surface-2">
              {list.map((p) => (
                <PaymentRow
                  key={p.id}
                  player={p}
                  onView={() => setViewPlayer(p)}
                  onEdit={() => handleEditClick(p)}
                  onRemind={() => remind(p.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      <PaymentViewSheet player={viewPlayer} onClose={() => setViewPlayer(null)} />
      <PaymentEditSheet
        player={editPlayer}
        editedBy={editedBy}
        onClose={() => setEditPlayer(null)}
        onSaved={refetchPlayers}
      />
      <ReminderQueueSheet queue={reminderQueue} />
    </div>
  );
}

function PaymentRow({
  player,
  onView,
  onEdit,
  onRemind,
}: {
  player: Player;
  onView: () => void;
  onEdit: () => void;
  onRemind: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3">
      <div>
        <p className="text-sm font-medium">{player.name}</p>
        <p className="text-xs text-ink-secondary">
          {player.sport}
          {player.due > 0 ? ` - ${formatCurrency(player.due)} - ${player.month}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        {player.due > 0 && (
          <Button
            variant="whatsapp"
            size="icon"
            className="rounded-full h-9 w-9"
            onClick={onRemind}
            aria-label={`Send reminder to ${player.name}`}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onView}>
          View
        </Button>
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Edit
        </Button>
      </div>
    </div>
  );
}
