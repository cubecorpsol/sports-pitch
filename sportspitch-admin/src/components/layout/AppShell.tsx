import { Outlet } from "react-router-dom";
import { Bell, Loader2 } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { useAppData } from "@/hooks/useAppData";

export function AppShell() {
  const { loading, error } = useAppData();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-surface-0">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface-2 px-4 py-3">
        <p className="text-[15px] font-semibold">
          SportsPitch <span className="font-normal text-ink-muted">admin</span>
        </p>
        <button aria-label="Notifications" className="text-ink-secondary">
          <Bell className="h-5 w-5" />
        </button>
      </header>
      <main className="flex-1 px-4 pb-24 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-ink-muted">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Loading live data...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-status-overdue bg-status-overdue-bg p-4 text-sm text-status-overdue">
            <p className="mb-1 font-medium">Couldn't reach the server</p>
            <p>{error}</p>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
      <BottomNav />
    </div>
  );
}
