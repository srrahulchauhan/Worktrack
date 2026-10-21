import { Navigate, Route, Routes } from "react-router-dom";
import { WorkTrackLayout } from "./components/layout/WorkTrackLayout";
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
import { WorkTrackSettingsPage } from "./pages/WorkTrackSettingsPage";

export function WorkTrackApp({ onBackToStudy }) {
  return (
    <ThemeProvider>
      <WorkTrackProvider>
        <Routes>
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
          <Route
            path="/"
            element={<Navigate to="/worktrack/dashboard" replace />}
          />
          <Route
            path="/login"
            element={<Navigate to="/worktrack/dashboard" replace />}
          />
          <Route
            path="*"
            element={<Navigate to="/worktrack/dashboard" replace />}
          />
        </Routes>
      </WorkTrackProvider>
    </ThemeProvider>
  );
}

export default WorkTrackApp;
