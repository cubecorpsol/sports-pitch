import { Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/features/auth/LoginPage";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { BookingsPage } from "@/features/bookings/BookingsPage";
import { PaymentsPage } from "@/features/payments/PaymentsPage";
import { PlayersPage } from "@/features/players/PlayersPage";
import { MorePage } from "@/features/more/MorePage";
import { SportsManagementPage } from "@/features/sports-management/SportsManagementPage";
import { ReportsPage } from "@/features/reports/ReportsPage";
import { AnnouncementsPage } from "@/features/announcements/AnnouncementsPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { ProfilePage } from "@/features/profile/ProfilePage";
import { AppDataProvider } from "@/hooks/useAppData";
import { PinGateProvider } from "@/hooks/usePinGate";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppDataProvider>
              <PinGateProvider>
                <AppShell />
              </PinGateProvider>
            </AppDataProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="players" element={<PlayersPage />} />
        <Route path="more" element={<MorePage />} />
        <Route path="more/sports-management" element={<SportsManagementPage />} />
        <Route path="more/reports" element={<ReportsPage />} />
        <Route path="more/announcements" element={<AnnouncementsPage />} />
        <Route path="more/settings" element={<SettingsPage />} />
        <Route path="more/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}
