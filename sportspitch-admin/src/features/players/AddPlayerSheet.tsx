import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { SPORTS } from "@/types";
import type { Sport } from "@/types";
import { createPlayer } from "@/lib/api/players";

interface Props {
  onAdded: () => void;
}

export function AddPlayerSheet({ onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [sport, setSport] = useState<Sport>("Cricket");
  const [batch, setBatch] = useState("");
  const [fee, setFee] = useState("500");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setName("");
    setMobile("");
    setSport("Cricket");
    setBatch("");
    setFee("500");
    setError("");
  }

  async function handleSave() {
    if (!name.trim() || !mobile.trim()) return;
    setSaving(true);
    setError("");
    try {
      await createPlayer({
        name: name.trim(),
        phone: mobile.trim(),
        sport,
        batch: batch.trim() || undefined,
        monthlyFee: Number(fee) || undefined,
      });
      onAdded();
      reset();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add player. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="primary" size="sm">
          <Plus className="h-4 w-4" />
          Add player
        </Button>
      </SheetTrigger>
      <SheetContent title="Add player">
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Name</label>
        <Input
          placeholder="Player name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4"
        />

        <label className="mb-1 block text-xs font-medium text-ink-secondary">Mobile number</label>
        <Input
          placeholder="91XXXXXXXXXX"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="mb-4"
        />

        <label className="mb-1 block text-xs font-medium text-ink-secondary">Sport</label>
        <Select value={sport} onValueChange={(v) => setSport(v as Sport)}>
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

        <label className="mb-1 block text-xs font-medium text-ink-secondary">Batch (optional)</label>
        <Input
          placeholder="e.g. Morning, Evening"
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          className="mb-4"
        />

        <label className="mb-1 block text-xs font-medium text-ink-secondary">Monthly fee</label>
        <Input type="number" value={fee} onChange={(e) => setFee(e.target.value)} className="mb-4" />

        {error && <p className="mb-3 text-xs font-medium text-status-overdue">{error}</p>}

        <Button variant="primary" size="lg" className="w-full" onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save player
        </Button>
      </SheetContent>
    </Sheet>
  );
}
