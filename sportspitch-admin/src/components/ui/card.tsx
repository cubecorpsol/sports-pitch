import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-surface-2 p-4", className)}
      {...props}
    />
  );
}

export function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "danger";
}) {
  return (
    <div className="rounded-lg bg-surface-1 p-3">
      <p className="text-xs text-ink-muted mb-1">{label}</p>
      <p className={cn("text-xl font-semibold", tone === "danger" ? "text-status-overdue" : "text-ink-primary")}>
        {value}
      </p>
    </div>
  );
}
