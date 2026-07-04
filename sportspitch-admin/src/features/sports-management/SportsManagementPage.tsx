import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import { SPORTS } from "@/types";
import type { Sport } from "@/types";
import { updateSportFee } from "@/lib/api/sportsManagement";
import { BatchesTab } from "./BatchesTab";

const tabs = ["Sports", "Batches"] as const;
type Tab = (typeof tabs)[number];

export function SportsManagementPage() {
  const { sportFees, refetchSportsManagement } = useAppData();
  const [tab, setTab] = useState<Tab>("Sports");

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Link to="/more" aria-label="Back to more" className="text-ink-secondary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">Sports management</h1>
      </div>

      <div className="mb-4 flex rounded-lg bg-surface-1 p-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-md py-2 text-xs font-medium transition-colors",
              tab === t ? "bg-surface-2 text-ink-primary shadow-sm" : "text-ink-muted"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Sports" && (
        <div className="divide-y divide-border rounded-lg border border-border bg-surface-2">
          {SPORTS.map((sport) => {
            const fee = sportFees.find((f) => f.sport === sport);
            return (
              <SportFeeRow
                key={sport}
                sport={sport}
                currentFee={fee?.monthlyFee ?? 500}
                onSaved={refetchSportsManagement}
              />
            );
          })}
        </div>
      )}

      {tab === "Batches" && <BatchesTab />}
    </div>
  );
}

function SportFeeRow({
  sport,
  currentFee,
  onSaved,
}: {
  sport: Sport;
  currentFee: number;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [fee, setFee] = useState(String(currentFee));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await updateSportFee(sport, Number(fee) || currentFee);
      await onSaved();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center justify-between p-3">
      <span className="text-sm font-medium">{sport}</span>
      {editing ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className="h-9 w-24"
          />
          <Button variant="primary" size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
          </Button>
        </div>
      ) : (
        <button
          onClick={() => {
            setFee(String(currentFee));
            setEditing(true);
          }}
          className="text-sm text-ink-secondary"
        >
          {formatCurrency(currentFee)} / month
        </button>
      )}
    </div>
  );
}
