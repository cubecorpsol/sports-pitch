// "Api*" types mirror the real MongoDB/Express response shapes exactly.
// The plain (non-Api) types are what the UI components consume -- api.ts
// maps between the two so screens never have to know about backend
// quirks (string dates, computed vs. stored status, etc).

export type Sport = "Cricket" | "Badminton" | "Karate" | "Kabaddi";
export const SPORTS: Sport[] = ["Cricket", "Badminton", "Karate", "Kabaddi"];

// ---------- Bookings ----------

export type ApiBookingStatus = "Pending" | "Approved" | "Rejected";

export interface ApiBooking {
  _id: string;
  bookingId: string;
  name: string;
  phone: string;
  sport: Sport;
  date: string; // YYYY-MM-DD
  time: string;
  status: ApiBookingStatus;
  paymentStatus: "Paid" | "Unpaid";
  amount: number;
  createdAt: string;
}

export type BookingStatus = "pending" | "approved" | "rejected";
export type BookingDay = "today" | "upcoming" | "past";

export interface Booking {
  id: string;
  playerName: string;
  mobile: string;
  sport: Sport;
  date: string;
  time: string;
  slotLabel: string;
  day: BookingDay;
  status: BookingStatus;
}

// ---------- Players (Customer) ----------

export interface ApiTransaction {
  _id: string;
  customerId: string;
  amount: number;
  paymentMethod: "Cash" | "UPI" | "Bank Transfer" | "Cheque";
  remarks: string;
  month: number;
  year: number;
  monthlyFee: number;
  balanceAfterPayment: number;
  createdAt: string;
  editedBy?: string | null;
  editedAt?: string | null;
  editHistory?: {
    editedBy: string;
    editedAt: string;
    previousAmount: number;
    previousPaymentMethod: string;
    previousRemarks: string;
  }[];
}

export interface ApiCustomer {
  _id: string;
  name: string;
  phone: string;
  sports: Sport[];
  batch: string;
  monthlyFee: number;
  isActive: boolean;
  createdAt: string;
  // present only on responses from /api/payment/customers
  amountPaid?: number;
  balance?: number;
  paymentStatus?: "Paid" | "Unpaid" | "Partially Paid";
  transactions?: ApiTransaction[];
}

// Overdue/Due soon are computed client-side (see lib/paymentStatus.ts) --
// the backend only knows Paid / Partially Paid / Unpaid, with no due-date
// concept at all.
export type PaymentStatus = "overdue" | "dueSoon" | "pending" | "paid" | "partiallyPaid";

export interface Player {
  id: string;
  name: string;
  mobile: string;
  sport: Sport;
  batch: string;
  status: PaymentStatus;
  due: number;
  amountPaid: number;
  monthlyFee: number;
  month: string;
  monthNumber: number;
  year: number;
  joinDate: string;
  transactions: ApiTransaction[];
}

// ---------- Announcements ----------

export interface ApiAnnouncement {
  _id: string;
  title: string;
  description: string;
  priority: "Low" | "Normal" | "Medium" | "High";
  publishDate: string;
  expiryDate: string | null;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  priority: ApiAnnouncement["priority"];
  date: string;
  published: boolean;
}

// ---------- Sports management ----------

export interface ApiSportFee {
  _id: string;
  sport: Sport;
  monthlyFee: number;
  isActive: boolean;
}

// ---------- Settings ----------

export interface ApiSettings {
  _id: string;
  turfName: string;
  contactNumber: string;
  address: string;
  workingHours: string;
  bookingRules: string;
  upiId: string;
  bankDetails: string;
  notifyWhatsapp: boolean;
  notifyEmail: boolean;
  notifyPush: boolean;
  adminPin: string;
  adminName: string;
  adminEmail: string;
  adminMobile: string;
}
