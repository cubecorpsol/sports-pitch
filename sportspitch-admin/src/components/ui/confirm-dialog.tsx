import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { Button } from "./button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
}: Props) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-[55] bg-black/40" />
        <AlertDialogPrimitive.Content className="fixed left-1/2 top-1/2 z-[56] w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-2 p-5">
          <AlertDialogPrimitive.Title className="mb-1 text-base font-semibold">
            {title}
          </AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description className="mb-5 text-sm text-ink-secondary">
            {description}
          </AlertDialogPrimitive.Description>
          <div className="flex gap-2">
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button variant="danger" className="flex-1" onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
