import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Loader2 } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Avatar } from "@/components/ui/avatar";
import { changePassword, logout } from "@/lib/auth";

export function ProfilePage() {
  const { settings } = useAppData();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [pwError, setPwError] = useState("");
  const [saving, setSaving] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const name = settings?.adminName || "Admin";
  const email = settings?.adminEmail || "Not set";
  const mobile = settings?.adminMobile || "Not set";

  function handleChangePassword() {
    setPwError("");
    if (!newPassword.trim()) return;
    setSaving(true);
    const ok = changePassword(currentPassword, newPassword);
    setSaving(false);
    if (!ok) {
      setPwError("Current password is incorrect.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

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

      <p className="mb-2 text-sm font-semibold">Change password</p>
      {saved && (
        <p className="mb-3 rounded-lg bg-status-paid-bg px-3 py-2 text-sm font-medium text-status-paid">
          Password updated
        </p>
      )}
      <div className="mb-3 space-y-3">
        <Input
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      {pwError && <p className="mb-3 text-xs font-medium text-status-overdue">{pwError}</p>}
      <Button variant="primary" className="mb-6 w-full" onClick={handleChangePassword} disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Update password
      </Button>

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
