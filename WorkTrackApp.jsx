import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { WorkTrackLayout } from "./components/layout/WorkTrackLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { WorkTrackProvider } from "./context/WorkTrackContext";
import { DailyAttendancePage } from "./pages/DailyAttendancePage";
import { MonthlyReportsPage } from "./pages/MonthlyReportsPage";
import { MyCompaniesPage } from "./pages/MyCompaniesPage";
import { OvertimeTrackerPage } from "./pages/OvertimeTrackerPage";
import { SalaryCalculatorPage } from "./pages/SalaryCalculatorPage";
import { SalaryPaymentsPage } from "./pages/SalaryPaymentsPage";
import { ShiftManagementPage } from "./pages/ShiftManagementPage";
import { WorkTrackDashboard } from "./pages/WorkTrackDashboard";
import { WorkTrackLoginPage } from "./pages/WorkTrackLoginPage";
import { WorkTrackSettingsPage } from "./pages/WorkTrackSettingsPage";

function AuthLoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f8f6] text-sm font-semibold text-[#42625d]">
      <p role="status">Checking your session...</p>
    </main>
  );
}

function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  return user ? <Navigate to="/worktrack/dashboard" replace /> : <Outlet />;
}

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function WorkTrackApp({ onBackToStudy }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <WorkTrackProvider>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/" element={<WorkTrackLoginPage />} />
              <Route path="/login" element={<WorkTrackLoginPage />} />
            </Route>
            <Route element={<RequireAuth />}>
              <Route
                path="/worktrack"
                element={<WorkTrackLayout onBackToStudy={onBackToStudy} />}
              >
                <Route
                  index
                  element={<Navigate to="/worktrack/dashboard" replace />}
                />
                <Route path="dashboard" element={<WorkTrackDashboard />} />
                <Route path="companies" element={<MyCompaniesPage />} />
                <Route path="attendance" element={<DailyAttendancePage />} />
                <Route path="shifts" element={<ShiftManagementPage />} />
                <Route path="salary" element={<SalaryCalculatorPage />} />
                <Route path="overtime" element={<OvertimeTrackerPage />} />
                <Route path="payments" element={<SalaryPaymentsPage />} />
                <Route path="reports" element={<MonthlyReportsPage />} />
                <Route path="settings" element={<WorkTrackSettingsPage />} />
                <Route
                  path="*"
                  element={<Navigate to="/worktrack/dashboard" replace />}
                />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </WorkTrackProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default WorkTrackApp;
