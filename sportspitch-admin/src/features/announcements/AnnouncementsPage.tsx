import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Announcement } from "@/types";
import { deleteAnnouncement, updateAnnouncement } from "@/lib/api/announcements";
import { AnnouncementSheet } from "./AnnouncementSheet";

export function AnnouncementsPage() {
  const { announcements, refetchAnnouncements } = useAppData();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function togglePublish(a: Announcement) {
    setTogglingId(a.id);
    try {
      await updateAnnouncement(a.id, {
        title: a.title,
        description: a.description,
        priority: a.priority,
        publishDate: a.date,
        published: !a.published,
      });
      await refetchAnnouncements();
    } finally {
      setTogglingId(null);
    }
  }

  async function confirmDelete() {
    if (deleteId) {
      await deleteAnnouncement(deleteId);
      await refetchAnnouncements();
    }
    setDeleteId(null);
  }

  const deleteTarget = announcements.find((a) => a.id === deleteId) ?? null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/more" aria-label="Back to more" className="text-ink-secondary">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">Announcements</h1>
        </div>
        <AnnouncementSheet
          onSaved={refetchAnnouncements}
          trigger={
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4" />
              Create
            </Button>
          }
        />
      </div>

      <div className="space-y-3">
        {announcements.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-muted">No announcements yet.</p>
        )}
        {announcements.map((a) => (
          <div key={a.id} className="rounded-lg border border-border bg-surface-2 p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-ink-secondary">
                  {a.priority} priority - {a.date}
                </p>
              </div>
              {togglingId === a.id ? (
                <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />
              ) : (
                <Switch checked={a.published} onCheckedChange={() => togglePublish(a)} />
              )}
            </div>
            <p className="mb-3 text-sm text-ink-secondary">{a.description}</p>
            <div className="flex gap-2">
              <AnnouncementSheet
                announcement={a}
                onSaved={refetchAnnouncements}
                trigger={
                  <Button variant="outline" size="sm" className="flex-1">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                }
              />
              <Button variant="danger" size="sm" className="flex-1" onClick={() => setDeleteId(a.id)}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete this announcement?"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"?`
            : "Are you sure you want to delete this announcement?"
        }
        onConfirm={confirmDelete}
      />
    </div>
  );
}
