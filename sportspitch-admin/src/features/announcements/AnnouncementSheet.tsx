import { useEffect, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { Announcement, ApiAnnouncement } from "@/types";
import { createAnnouncement, updateAnnouncement } from "@/lib/api/announcements";

interface Props {
  announcement?: Announcement;
  trigger: ReactNode;
  onSaved: () => void;
}

const priorities: ApiAnnouncement["priority"][] = ["Low", "Normal", "Medium", "High"];

export function AnnouncementSheet({ announcement, trigger, onSaved }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(announcement?.title ?? "");
  const [description, setDescription] = useState(announcement?.description ?? "");
  const [priority, setPriority] = useState<ApiAnnouncement["priority"]>(announcement?.priority ?? "Normal");
  const [date, setDate] = useState(announcement?.date ?? new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(announcement?.title ?? "");
      setDescription(announcement?.description ?? "");
      setPriority(announcement?.priority ?? "Normal");
      setDate(announcement?.date ?? new Date().toISOString().slice(0, 10));
      setError("");
    }
  }, [open, announcement]);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    setError("");
    try {
      if (announcement) {
        await updateAnnouncement(announcement.id, {
          title: title.trim(),
          description: description.trim(),
          priority,
          publishDate: date,
          published: announcement.published,
        });
      } else {
        await createAnnouncement({ title: title.trim(), description: description.trim(), priority, publishDate: date });
      }
      onSaved();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent title={announcement ? "Edit announcement" : "Create announcement"}>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mb-4" />

        <label className="mb-1 block text-xs font-medium text-ink-secondary">Description</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mb-4" />

        <label className="mb-1 block text-xs font-medium text-ink-secondary">Priority</label>
        <Select value={priority} onValueChange={(v) => setPriority(v as ApiAnnouncement["priority"])}>
          <SelectTrigger className="mb-4">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priorities.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="mb-1 block text-xs font-medium text-ink-secondary">Date</label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mb-4" />

        {error && <p className="mb-3 text-xs font-medium text-status-overdue">{error}</p>}

        <Button variant="primary" size="lg" className="w-full" onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save announcement
        </Button>
      </SheetContent>
    </Sheet>
  );
}
