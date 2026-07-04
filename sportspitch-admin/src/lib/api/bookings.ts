import { apiRequest } from "@/lib/apiClient";
import type { ApiBooking, Booking, BookingDay, BookingStatus, Sport } from "@/types";

function toDay(dateStr: string): BookingDay {
  const today = new Date().toISOString().slice(0, 10);
  if (dateStr === today) return "today";
  return dateStr > today ? "upcoming" : "past";
}

function toStatus(status: ApiBooking["status"]): BookingStatus {
  return status.toLowerCase() as BookingStatus;
}

function fromApiStatus(status: BookingStatus): ApiBooking["status"] {
  return (status.charAt(0).toUpperCase() + status.slice(1)) as ApiBooking["status"];
}

function mapBooking(b: ApiBooking): Booking {
  return {
    id: b._id,
    playerName: b.name,
    mobile: b.phone,
    sport: b.sport,
    date: b.date,
    time: b.time,
    slotLabel: `${b.date === new Date().toISOString().slice(0, 10) ? "Today" : b.date}, ${b.time}`,
    day: toDay(b.date),
    status: toStatus(b.status),
  };
}

export async function fetchBookings(): Promise<Booking[]> {
  const res = await apiRequest<{ bookings: ApiBooking[] }>("/api/bookings");
  return res.bookings.map(mapBooking);
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<{ booking: Booking; whatsappUrl: string | null }> {
  const res = await apiRequest<{ booking: ApiBooking; whatsappUrl: string | null }>(
    `/api/bookings/${id}/status`,
    { method: "PUT", body: { status: fromApiStatus(status) } }
  );
  return { booking: mapBooking(res.booking), whatsappUrl: res.whatsappUrl };
}

export async function deleteBooking(id: string): Promise<void> {
  await apiRequest(`/api/bookings/${id}`, { method: "DELETE" });
}

export async function createBooking(input: {
  name: string;
  phone: string;
  sport: Sport;
  date: string;
  time: string;
}): Promise<Booking> {
  const res = await apiRequest<{ booking: ApiBooking }>("/api/bookings", {
    method: "POST",
    body: input,
  });
  return mapBooking(res.booking);
}
