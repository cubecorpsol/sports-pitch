import { useState } from "react";
import { fetchBulkReminders } from "@/lib/api/whatsapp";

interface QueueItem {
  customerId: string;
  name: string;
  whatsappUrl: string;
  balance: number;
}

// Drives the "Remind all due" one-by-one flow. Pulls the ready-to-send
// wa.me links straight from the backend's own bulk-reminders endpoint
// (same message text/logic the rest of the system already uses) and steps
// through them one at a time, since WhatsApp requires a human tap per chat.
export function useReminderQueue() {
  const [queue, setQueue] = useState<QueueItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    try {
      const res = await fetchBulkReminders();
      if (res.customers.length === 0) return;
      setQueue(res.customers);
      setIndex(0);
    } finally {
      setLoading(false);
    }
  }

  function next() {
    if (!queue) return;
    if (index + 1 >= queue.length) {
      setQueue(null);
      setIndex(0);
    } else {
      setIndex((i) => i + 1);
    }
  }

  function cancel() {
    setQueue(null);
    setIndex(0);
  }

  const current = queue ? queue[index] : null;

  return {
    isActive: !!queue,
    loading,
    current,
    currentLink: current?.whatsappUrl ?? null,
    position: index + 1,
    total: queue?.length ?? 0,
    start,
    next,
    cancel,
  };
}
