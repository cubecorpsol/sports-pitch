import { MessageCircle } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { useReminderQueue } from "@/hooks/useReminderQueue";

export function ReminderQueueSheet({ queue }: { queue: ReturnType<typeof useReminderQueue> }) {
  const { isActive, current, currentLink, position, total, next, cancel } = queue;

  return (
    <Sheet open={isActive} onOpenChange={(open) => !open && cancel()}>
      <SheetContent title={`Reminder ${position} of ${total}`}>
        {current && (
          <div className="text-center">
            <p className="mb-1 text-base font-medium">{current.name}</p>
            <p className="mb-6 text-sm text-ink-secondary">{formatCurrency(current.balance)} due</p>
            <a
              href={currentLink ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={next}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] py-3.5 text-base font-medium text-white active:scale-[0.98]"
            >
              <MessageCircle className="h-5 w-5" />
              Send WhatsApp reminder
            </a>
            <Button variant="ghost" className="w-full" onClick={next}>
              Skip
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
