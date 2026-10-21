import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AttendanceModal } from "../attendance/AttendanceModal";
import { WorkTrackToasts } from "../common/WorkTrackToasts";
import { CompanyModal } from "../company/CompanyModal";
import { OvertimeModal } from "../overtime/OvertimeModal";
import { WorkTrackMobileNav } from "./WorkTrackMobileNav";
import { WorkTrackNavbar } from "./WorkTrackNavbar";
import { WorkTrackSidebar } from "./WorkTrackSidebar";

export function WorkTrackLayout({ onBackToStudy }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Quick Action & Sync Modal states
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isMarkAttendanceOpen, setIsMarkAttendanceOpen] = useState(false);
  const [isAddOvertimeOpen, setIsAddOvertimeOpen] = useState(false);

  const navigate = useNavigate();

  const handleBackToStudy = () => {
    if (onBackToStudy) {
      onBackToStudy();
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <WorkTrackSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onBackToStudy={handleBackToStudy}
      />

      {/* Mobile Drawer & Bottom Navigation */}
      <WorkTrackMobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onBackToStudy={handleBackToStudy}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <WorkTrackNavbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenAddCompany={() => setIsAddCompanyOpen(true)}
          onOpenMarkAttendance={() => setIsMarkAttendanceOpen(true)}
          onOpenAddOvertime={() => setIsAddOvertimeOpen(true)}
          onBackToStudy={handleBackToStudy}
        />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12">
          <div className="max-w-7xl mx-auto">
            <Outlet
              context={{
                onOpenAddCompany: () => setIsAddCompanyOpen(true),
                onOpenMarkAttendance: () => setIsMarkAttendanceOpen(true),
                onOpenAddOvertime: () => setIsAddOvertimeOpen(true),
              }}
            />
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <CompanyModal
        isOpen={isAddCompanyOpen}
        onClose={() => setIsAddCompanyOpen(false)}
      />

      <AttendanceModal
        isOpen={isMarkAttendanceOpen}
        onClose={() => setIsMarkAttendanceOpen(false)}
      />

      <OvertimeModal
        isOpen={isAddOvertimeOpen}
        onClose={() => setIsAddOvertimeOpen(false)}
      />

      {/* Floating Notifications */}
      <WorkTrackToasts />
    </div>
  );
}
