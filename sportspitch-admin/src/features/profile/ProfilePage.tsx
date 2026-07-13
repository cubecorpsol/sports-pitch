import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Avatar } from "@/components/ui/avatar";
import { logout } from "@/lib/auth";

export function ProfilePage() {
  const { settings } = useAppData();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const name = settings?.adminName || "Admin";
  const email = settings?.adminEmail || "Not set";
  const mobile = settings?.adminMobile || "Not set";

  function handleLogout() {
    logout();
    setLogoutOpen(false);
    navigate("/login", { replace: true });
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Link to="/more" aria-label="Back to more" className="text-ink-secondary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">Profile</h1>
      </div>

      <div className="mb-5 flex items-center gap-3">
        <Avatar name={name} size={56} />
        <div>
          <p className="text-base font-semibold">{name}</p>
          <p className="text-sm text-ink-secondary">Owner / Admin</p>
        </div>
      </div>

      <div className="mb-6 divide-y divide-border rounded-lg border border-border bg-surface-2">
        <InfoRow label="Email" value={email} />
        <InfoRow label="Mobile" value={mobile} />
        <InfoRow label="Role" value="Owner / Admin" />
      </div>

      <div className="mb-6 rounded-lg border border-border bg-surface-2 p-3">
        <p className="text-sm font-semibold">Password</p>
        <p className="mt-1 text-sm text-ink-secondary">
          Admin credentials are managed by backend environment variables.
        </p>
      </div>

      <Button variant="outline" className="w-full text-status-overdue" onClick={() => setLogoutOpen(true)}>
        <LogOut className="h-4 w-4" />
        Logout
      </Button>

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Log out?"
        description="You'll need to sign in again to access the admin portal."
        confirmLabel="Logout"
        onConfirm={handleLogout}
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3">
      <span className="text-sm text-ink-secondary">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
