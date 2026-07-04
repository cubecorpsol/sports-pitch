import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Announcement, ApiSettings, ApiSportFee, Booking, Player } from "@/types";
import { fetchBookings } from "@/lib/api/bookings";
import { fetchPlayers } from "@/lib/api/players";
import { fetchAnnouncements } from "@/lib/api/announcements";
import { fetchSportFees } from "@/lib/api/sportsManagement";
import { fetchSettings } from "@/lib/api/settings";

interface AppDataShape {
  loading: boolean;
  error: string | null;
  bookings: Booking[];
  players: Player[];
  announcements: Announcement[];
  sportFees: ApiSportFee[];
  settings: ApiSettings | null;
  refetchBookings: () => Promise<void>;
  refetchPlayers: () => Promise<void>;
  refetchAnnouncements: () => Promise<void>;
  refetchSportsManagement: () => Promise<void>;
  refetchSettings: () => Promise<void>;
}

const AppDataContext = createContext<AppDataShape | null>(null);

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sportFees, setSportFees] = useState<ApiSportFee[]>([]);
  const [settings, setSettings] = useState<ApiSettings | null>(null);

  const refetchBookings = useCallback(async () => setBookings(await fetchBookings()), []);
  const refetchPlayers = useCallback(async () => setPlayers(await fetchPlayers()), []);
  const refetchAnnouncements = useCallback(async () => setAnnouncements(await fetchAnnouncements()), []);
  const refetchSportsManagement = useCallback(async () => setSportFees(await fetchSportFees()), []);
  const refetchSettings = useCallback(async () => setSettings(await fetchSettings()), []);

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          refetchBookings(),
          refetchPlayers(),
          refetchAnnouncements(),
          refetchSportsManagement(),
          refetchSettings(),
        ]);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data from the server.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadAll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        loading,
        error,
        bookings,
        players,
        announcements,
        sportFees,
        settings,
        refetchBookings,
        refetchPlayers,
        refetchAnnouncements,
        refetchSportsManagement,
        refetchSettings,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}
