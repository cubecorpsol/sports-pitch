import { NavLink } from "react-router-dom";
import { Home, CalendarDays, Wallet, Users, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Home", end: true },
  { to: "/bookings", icon: CalendarDays, label: "Bookings" },
  { to: "/payments", icon: Wallet, label: "Payments" },
  { to: "/players", icon: Users, label: "Players" },
  { to: "/more", icon: Menu, label: "More" },
];

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface-2 pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-md">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                isActive ? "text-brand-500" : "text-ink-muted"
              )
            }
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
