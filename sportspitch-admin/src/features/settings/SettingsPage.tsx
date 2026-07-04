import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { usePinGate } from "@/hooks/usePinGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { changeAdminPin, updateSettings } from "@/lib/api/settings";

const tabs = ["General", "Business", "Payments", "Security", "Notifications"] as const;
type Tab = (typeof tabs)[number];

export function SettingsPage() {
  const { settings, refetchSettings } = useAppData();
  const { requestPin } = usePinGate();
  const [tab, setTab] = useState<Tab>("General");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [turfName, setTurfName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [bookingRules, setBookingRules] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankDetails, setBankDetails] = useState("");
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifyPush, setNotifyPush] = useState(true);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");

  useEffect(() => {
    if (!settings) return;
    setTurfName(settings.turfName);
    setContactNumber(settings.contactNumber);
    setAddress(settings.address);
    setWorkingHours(settings.workingHours);
    setBookingRules(settings.bookingRules);
    setUpiId(settings.upiId);
    setBankDetails(settings.bankDetails);
    setNotifyWhatsapp(settings.notifyWhatsapp);
    setNotifyEmail(settings.notifyEmail);
    setNotifyPush(settings.notifyPush);
  }, [settings]);

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function saveGeneral() {
    requestPin(async () => {
      setSaving(true);
      try {
        await updateSettings({ turfName, contactNumber, address });
        await refetchSettings();
        flashSaved();
      } finally {
        setSaving(false);
      }
    });
  }
  function saveBusiness() {
    requestPin(async () => {
      setSaving(true);
      try {
        await updateSettings({ workingHours, bookingRules });
        await refetchSettings();
        flashSaved();
      } finally {
        setSaving(false);
      }
    });
  }
  function savePayment() {
    requestPin(async () => {
      setSaving(true);
      try {
        await updateSettings({ upiId, bankDetails });
        await refetchSettings();
        flashSaved();
      } finally {
        setSaving(false);
      }
    });
  }
  function saveNotifications() {
    requestPin(async () => {
      setSaving(true);
      try {
        await updateSettings({ notifyWhatsapp, notifyEmail, notifyPush });
        await refetchSettings();
        flashSaved();
      } finally {
        setSaving(false);
      }
    });
  }

  async function handleChangePin() {
    setPinError("");
    if (newPin.length < 4) {
      setPinError("PIN must be at least 4 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("PINs do not match.");
      return;
    }
    setSaving(true);
    try {
      await changeAdminPin(currentPin, newPin);
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      flashSaved();
    } catch (err) {
      setPinError(err instanceof Error ? err.message : "Couldn't change PIN.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Link to="/more" aria-label="Back to more" className="text-ink-secondary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">Settings</h1>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium",
              tab === t
                ? "border-brand-500 bg-brand-50 text-brand-600"
                : "border-border bg-surface-2 text-ink-secondary"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {saved && (
        <p className="mb-3 rounded-lg bg-status-paid-bg px-3 py-2 text-sm font-medium text-status-paid">
          Settings updated
        </p>
      )}

      {tab === "General" && (
        <div className="space-y-4">
          <Field label="Turf name">
            <Input value={turfName} onChange={(e) => setTurfName(e.target.value)} />
          </Field>
          <Field label="Contact number">
            <Input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
          </Field>
          <Field label="Address">
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} />
          </Field>
          <Button variant="primary" className="w-full" onClick={saveGeneral} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save general settings
          </Button>
        </div>
      )}

      {tab === "Business" && (
        <div className="space-y-4">
          <Field label="Working hours">
            <Input value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} />
          </Field>
          <Field label="Booking rules">
            <Textarea value={bookingRules} onChange={(e) => setBookingRules(e.target.value)} />
          </Field>
          <Button variant="primary" className="w-full" onClick={saveBusiness} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save business settings
          </Button>
        </div>
      )}

      {tab === "Payments" && (
        <div className="space-y-4">
          <Field label="UPI ID">
            <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} />
          </Field>
          <Field label="Bank details">
            <Textarea value={bankDetails} onChange={(e) => setBankDetails(e.target.value)} />
          </Field>
          <Button variant="primary" className="w-full" onClick={savePayment} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save payment settings
          </Button>
        </div>
      )}

      {tab === "Security" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-secondary">Default admin PIN is 0000. Change it below.</p>
          <Field label="Current PIN">
            <Input type="password" inputMode="numeric" maxLength={6} value={currentPin} onChange={(e) => setCurrentPin(e.target.value)} />
          </Field>
          <Field label="New PIN">
            <Input type="password" inputMode="numeric" maxLength={6} value={newPin} onChange={(e) => setNewPin(e.target.value)} />
          </Field>
          <Field label="Confirm new PIN">
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
            />
          </Field>
          {pinError && <p className="text-xs font-medium text-status-overdue">{pinError}</p>}
          <Button variant="primary" className="w-full" onClick={handleChangePin} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Change admin PIN
          </Button>
        </div>
      )}

      {tab === "Notifications" && (
        <div className="space-y-1">
          <ToggleRow label="WhatsApp" checked={notifyWhatsapp} onChange={setNotifyWhatsapp} />
          <ToggleRow label="Email" checked={notifyEmail} onChange={setNotifyEmail} />
          <ToggleRow label="Push notifications" checked={notifyPush} onChange={setNotifyPush} />
          <Button variant="primary" className="mt-4 w-full" onClick={saveNotifications} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save notification settings
          </Button>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink-secondary">{label}</label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 p-3">
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
