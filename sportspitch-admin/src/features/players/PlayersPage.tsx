import { useMemo, useState, type ReactNode } from "react";
import { Search, Trash2 } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { usePinGate } from "@/hooks/usePinGate";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { SPORTS } from "@/types";
import type { Player } from "@/types";
import { deletePlayer } from "@/lib/api/players";
import { AddPlayerSheet } from "./AddPlayerSheet";
import { PlayerProfileSheet } from "./PlayerProfileSheet";

export function PlayersPage() {
  const { players, refetchPlayers } = useAppData();
  const { requestPin } = usePinGate();
  const [query, setQuery] = useState("");
  const [sportFilter, setSportFilter] = useState<string | null>(null);
  const [profilePlayer, setProfilePlayer] = useState<Player | null>(null);
  const [rowDeleteId, setRowDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return players.filter((p) => {
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
      const matchesSport = !sportFilter || p.sport === sportFilter;
      return matchesQuery && matchesSport;
    });
  }, [players, query, sportFilter]);

  function handleRowDeleteClick(id: string) {
    requestPin(() => setRowDeleteId(id));
  }

  async function confirmRowDelete() {
    if (rowDeleteId) {
      await deletePlayer(rowDeleteId);
      await refetchPlayers();
    }
    setRowDeleteId(null);
  }

  const rowDeletePlayer = players.find((p) => p.id === rowDeleteId) ?? null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Players</h1>
        <AddPlayerSheet onAdded={refetchPlayers} />
      </div>

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <Input
          placeholder="Search players"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <FilterChip active={sportFilter === null} onClick={() => setSportFilter(null)}>
          All
        </FilterChip>
        {SPORTS.map((s) => (
          <FilterChip key={s} active={sportFilter === s} onClick={() => setSportFilter(s)}>
            {s}
          </FilterChip>
        ))}
      </div>

      <div className="divide-y divide-border rounded-lg border border-border bg-surface-2">
        {filtered.length === 0 && (
          <p className="p-4 text-center text-sm text-ink-muted">No players found.</p>
        )}
        {filtered.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-2 p-3">
            <button
              onClick={() => setProfilePlayer(p)}
              className="flex flex-1 items-center gap-3 text-left"
            >
              <Avatar name={p.name} size={38} />
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-ink-secondary">
                  {p.sport}
                  {p.batch ? ` - ${p.batch}` : ""}
                </p>
              </div>
            </button>
            <StatusBadge status={p.status} />
            <button
              onClick={() => handleRowDeleteClick(p.id)}
              aria-label={`Delete ${p.name}`}
              className="rounded-lg p-2 text-ink-muted hover:bg-surface-0 hover:text-status-overdue"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <PlayerProfileSheet
        player={profilePlayer}
        onClose={() => setProfilePlayer(null)}
        onChanged={refetchPlayers}
      />

      <ConfirmDialog
        open={!!rowDeleteId}
        onOpenChange={(open) => !open && setRowDeleteId(null)}
        title="Delete this player?"
        description={
          rowDeletePlayer
            ? `Are you sure you want to delete ${rowDeletePlayer.name}?`
            : "Are you sure you want to delete this player?"
        }
        confirmLabel="Delete"
        onConfirm={confirmRowDelete}
      />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium",
        active
          ? "border-brand-500 bg-brand-50 text-brand-600"
          : "border-border bg-surface-2 text-ink-secondary"
      )}
    >
      {children}
    </button>
  );
}
