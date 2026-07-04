import type { Booking, Player } from "@/types";

// WhatsApp does not allow silent, fully automatic sends from a browser or
// client app for individually-composed, non-templated messages -- opening
// wa.me pre-fills the message and the human still taps Send inside
// WhatsApp. This module builds the message text and the deep link; the
// calling UI decides whether to open one link (single action) or step
// through several one at a time (see useReminderQueue).

export function waLink(mobile: string, message: string): string {
  return `https://wa.me/${mobile}?text=${encodeURIComponent(message)}`;
}

export function bookingApprovedMessage(b: Booking): string {
  return `Hi ${b.playerName}, your ${b.sport} booking on ${b.slotLabel} is confirmed. See you on the court! - SportsPitch`;
}

export function bookingRejectedMessage(b: Booking): string {
  return `Hi ${b.playerName}, sorry, your ${b.sport} booking on ${b.slotLabel} could not be confirmed. Please try another slot. - SportsPitch`;
}

export function paymentReminderMessage(p: Player): string {
  return `Hi ${p.name}, your ${p.sport} subscription payment of Rs.${p.due} for ${p.month} is pending. Please pay at the earliest. - SportsPitch`;
}
