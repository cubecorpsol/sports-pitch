import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { Player } from "@/types";
import { editTransaction, recordPayment, updatePaymentStatus } from "@/lib/api/payments";

interface Props {
  player: Player | null;
  editedBy: string;
  onClose: () => void;
  onSaved: () => void;
}

const statusOptions = [
  { value: "Paid", label: "Paid" },
  { value: "Partially Paid", label: "Partially paid" },
  { value: "Unpaid", label: "Overdue / Pending" },
] as const;

export function PaymentEditSheet({ player, editedBy, onClose, onSaved }: Props) {
  const [status, setStatus] = useState<(typeof statusOptions)[number]["value"]>("Unpaid");
  const [amount, setAmount] = useState("0");
  const [method, setMethod] = useState<"Cash" | "UPI" | "Bank Transfer" | "Cheque">("Cash");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const latestTransaction = player?.transactions[player.transactions.length - 1];

  useEffect(() => {
    if (!player) return;
    const apiStatus = player.due <= 0 ? "Paid" : player.amountPaid > 0 ? "Partially Paid" : "Unpaid";
    setStatus(apiStatus);
    setAmount(String(latestTransaction?.amount ?? 0));
    setMethod((latestTransaction?.paymentMethod as typeof method) ?? "Cash");
    setRemarks(latestTransaction?.remarks ?? "");
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  if (!player) return null;

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      if (latestTransaction) {
        await editTransaction(latestTransaction._id, {
          amount: Number(amount) || 0,
          paymentMethod: method,
          remarks,
          editedBy,
        });
      } else if (Number(amount) > 0) {
        await recordPayment({
          customerId: player!.id,
          amount: Number(amount),
          paymentMethod: method,
          remarks,
          month: player!.monthNumber,
          year: player!.year,
        });
      }

      await updatePaymentStatus({
        customerId: player!.id,
        status,
        month: player!.monthNumber,
        year: player!.year,
        editedBy,
      });

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={!!player} onOpenChange={(open) => !open && onClose()}>
      <SheetContent title={`Edit payment - ${player.name}`}>
        {!latestTransaction && (
          <p className="mb-4 rounded-lg bg-status-pending-bg px-3 py-2 text-xs text-status-pending">
            No payment recorded yet this month -- entering an amount below will record the first payment.
          </p>
        )}

        <label className="mb-1 block text-xs font-medium text-ink-secondary">Payment status</label>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="mb-4">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="mb-1 block text-xs font-medium text-ink-secondary">
          {latestTransaction ? "Amount (last payment)" : "Amount paid"}
        </label>
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mb-4" />

        <label className="mb-1 block text-xs font-medium text-ink-secondary">Payment method</label>
        <Select value={method} onValueChange={(v) => setMethod(v as typeof method)}>
          <SelectTrigger className="mb-4">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="UPI">UPI</SelectItem>
            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
            <SelectItem value="Cheque">Cheque</SelectItem>
          </SelectContent>
        </Select>

        <label className="mb-1 block text-xs font-medium text-ink-secondary">Remarks</label>
        <Textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Any additional notes"
          className="mb-4"
        />

        {error && <p className="mb-3 text-xs font-medium text-status-overdue">{error}</p>}

        <Button variant="primary" size="lg" className="w-full" onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save payment
        </Button>
      </SheetContent>
    </Sheet>
  );
}
