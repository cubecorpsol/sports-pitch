import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Bottom sheet / drawer used everywhere instead of full page navigation or
// popups, per the "2-3 taps, no deep navigation" UX principle -- record a
// payment, add a player, view a booking, all happen in place.

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { title: string }
>(({ className, children, title, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-border bg-surface-2 p-5 pb-8",
        className
      )}
      {...props}
    >
      <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
      <div className="mb-4 flex items-center justify-between">
        <DialogPrimitive.Title className="text-base font-semibold text-ink-primary">
          {title}
        </DialogPrimitive.Title>
        <DialogPrimitive.Close className="rounded-full p-1.5 text-ink-muted hover:bg-surface-0">
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      </div>
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";

export { Sheet, SheetTrigger, SheetContent };
