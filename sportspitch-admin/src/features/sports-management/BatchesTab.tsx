import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Customer.batch on the backend is a free-text field, not a separate
// collection -- there is nothing to CRUD against the API here. This list
// is a small local convenience (persisted in localStorage) that suggests
// values when adding a player; it is intentionally NOT presented as
// server-synced data.
const STORAGE_KEY = "sportspitch_batch_suggestions";

function loadBatches(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : ["Morning", "Evening"];
  } catch {
    return ["Morning", "Evening"];
  }
}

export function BatchesTab() {
  const [batches, setBatches] = useState<string[]>([]);
  const [newBatch, setNewBatch] = useState("");

  useEffect(() => {
    setBatches(loadBatches());
  }, []);

  function persist(next: string[]) {
    setBatches(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function add() {
    if (!newBatch.trim() || batches.includes(newBatch.trim())) return;
    persist([...batches, newBatch.trim()]);
    setNewBatch("");
  }

  function remove(b: string) {
    persist(batches.filter((x) => x !== b));
  }

  return (
    <div>
      <p className="mb-3 rounded-lg bg-status-pending-bg px-3 py-2 text-xs text-status-pending">
        Batch names are suggestions only (stored on this device) since your backend stores batch as
        free text on each player, not a separate list.
      </p>
      <div className="mb-4 flex gap-2">
        <Input placeholder="Add batch name" value={newBatch} onChange={(e) => setNewBatch(e.target.value)} />
        <Button variant="primary" size="icon" onClick={add} aria-label="Add batch">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="divide-y divide-border rounded-lg border border-border bg-surface-2">
        {batches.map((b) => (
          <div key={b} className="flex items-center justify-between p-3">
            <span className="text-sm font-medium">{b}</span>
            <button onClick={() => remove(b)} aria-label={`Remove ${b}`} className="text-ink-muted">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
