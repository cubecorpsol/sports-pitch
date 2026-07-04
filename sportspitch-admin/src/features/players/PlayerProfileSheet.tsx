import { useEffect, useState } from "react";
import { Phone, Trophy, Users2, CreditCard, CalendarDays, Loader2 } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { usePinGate } from "@/hooks/usePinGate";
import { SPORTS } from "@/types";
import type { Player, Sport } from "@/types";
import { deletePlayer, updatePlayer } from "@/lib/api/players";
import { Avatar } from "@/components/ui/avatar";

interface Props {
  player: Player | null;
  onClose: () => void;
  onChanged: () => void;
}

export function PlayerProfileSheet({ player, onClose, onChanged }: Props) {
  const { requestPin } = usePinGate();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [draft, setDraft] = useState<Player | null>(player);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(player);
    setMode("view");
  }, [player]);

  if (!player || !draft) return null;

  function handleDeleteClick() {
    requestPin(() => setConfirmOpen(true));
  }

  async function confirmDelete() {
    await deletePlayer(player!.id);
    setConfirmOpen(false);
    onChanged();
    onClose();
  }

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    try {
      await updatePlayer(draft.id, {
        name: draft.name,
        phone: draft.mobile,
        sport: draft.sport,
        batch: draft.batch,
        monthlyFee: draft.monthlyFee,
      });
      onChanged();
      setMode("view");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Sheet open={!!player} onOpenChange={(open) => !open && onClose()}>
        <SheetContent title={mode === "view" ? "Player profile" : "Edit player"}>
          {mode === "view" ? (
            <>
              <div className="mb-4 flex items-center gap-3">
                <Avatar name={player.name} size={56} />
                <div>
                  <p className="text-base font-semibold">{player.name}</p>
                  <StatusBadge status={player.status} />
                </div>
              </div>

              <div className="mb-5 divide-y divide-border rounded-lg border border-border">
                <ProfileRow icon={Phone} label="Mobile number" value={player.mobile} />
                <ProfileRow icon={Trophy} label="Sport" value={player.sport} />
                <ProfileRow icon={Users2} label="Batch" value={player.batch || "Not set"} />
                <ProfileRow icon={CreditCard} label="Monthly fee" value={formatCurrency(player.monthlyFee)} />
                <ProfileRow icon={CalendarDays} label="Join date" value={player.joinDate.slice(0, 10)} />
                <ProfileRow
                  icon={CreditCard}
                  label="Payment status"
                  value={player.status === "paid" ? "Paid" : `${formatCurrency(player.due)} due`}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => setMode("edit")}>
                  Edit player
                </Button>
                <Button variant="danger" className="flex-1" onClick={handleDeleteClick}>
                  Delete player
                </Button>
              </div>
            </>
          ) : (
            <>
              <label className="mb-1 block text-xs font-medium text-ink-secondary">Name</label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="mb-4"
              />

              <label className="mb-1 block text-xs font-medium text-ink-secondary">Mobile number</label>
              <Input
                value={draft.mobile}
                onChange={(e) => setDraft({ ...draft, mobile: e.target.value })}
                className="mb-4"
              />

              <label className="mb-1 block text-xs font-medium text-ink-secondary">Sport</label>
              <Select value={draft.sport} onValueChange={(v) => setDraft({ ...draft, sport: v as Sport })}>
                <SelectTrigger className="mb-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPORTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <label className="mb-1 block text-xs font-medium text-ink-secondary">Batch</label>
              <Input
                value={draft.batch}
                onChange={(e) => setDraft({ ...draft, batch: e.target.value })}
                className="mb-4"
              />

              <label className="mb-1 block text-xs font-medium text-ink-secondary">Monthly fee</label>
              <Input
                type="number"
                value={draft.monthlyFee}
                onChange={(e) => setDraft({ ...draft, monthlyFee: Number(e.target.value) || 0 })}
                className="mb-6"
              />

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setMode("view")} disabled={saving}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1" onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save changes
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this player?"
        description="Are you sure you want to delete this player? This can't be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between p-3">
      <span className="flex items-center gap-2 text-sm text-ink-secondary">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
