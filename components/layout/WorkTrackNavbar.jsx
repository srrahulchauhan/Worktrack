import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Home,
  LogOut,
  Menu,
  Moon,
  Plus,
  Sun,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useWorkTrack } from "../../context/WorkTrackContext";

export function WorkTrackNavbar({
  onOpenMobileMenu,
  onOpenAddCompany,
  onOpenMarkAttendance,
  onOpenAddOvertime,
  onBackToStudy,
}) {
  const navigate = useNavigate();
  const { signOutUser } = useAuth();
  const { companies, activeCompanyId, setActiveCompanyId } = useWorkTrack();
  const { theme, toggleTheme } = useTheme();
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOutUser();
      navigate("/login", { replace: true });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="h-16 relative border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl px-3 sm:px-6 flex items-center justify-between shrink-0 z-20 shadow-xs">
      {/* Ambient bottom light bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/25 dark:via-blue-400/20 to-transparent pointer-events-none" />

      {/* Left side: Hamburger & Active Company Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Company Switcher Pill */}
        <div className="flex w-[calc(100vw-214px)] max-w-[210px] sm:w-auto sm:max-w-xs min-w-0 items-center gap-2 bg-slate-100/80 dark:bg-dark-950/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-1 sm:px-2.5 sm:py-1 transition">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Building2 size={14} />
          </div>
          <select
            value={activeCompanyId}
            onChange={(e) => setActiveCompanyId(e.target.value)}
            className="w-full min-w-0 text-xs font-bold bg-transparent text-slate-900 dark:text-white outline-hidden cursor-pointer truncate pr-1"
          >
            {companies.map((c) => (
              <option
                key={c.id}
                value={c.id}
                className="dark:bg-dark-900 text-slate-900 dark:text-white"
              >
                {c.name}{" "}
                {c.status === "Active" ||
                c.status === "Current" ||
                !c.leavingDate
                  ? "(Active)"
                  : "(Left Company)"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right side: Quick Actions, Theme & Navigation */}
      <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
        {/* Quick Action Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 transition active:scale-95"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add</span>
          </button>

          {isQuickMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsQuickMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onOpenMarkAttendance();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  <Calendar size={15} className="text-emerald-500" />
                  <span>Mark Daily Attendance</span>
                </button>

                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onOpenAddOvertime();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  <Clock size={15} className="text-amber-500" />
                  <span>Log Overtime Hours</span>
                </button>

                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onOpenAddCompany();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  <Building2 size={15} className="text-blue-500" />
                  <span>Add Company Profile</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-rose-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={17} />
        </button>

        {/* Home / StudyFlow Return Buttons */}
        <button
          onClick={() => navigate("/")}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-800"
          title="Return to Personal OS Home Dashboard"
        >
          <Home size={14} />
          <span className="hidden md:inline">Home</span>
        </button>

        <button
          onClick={onBackToStudy}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Back to StudyFlow"
        >
          <ArrowLeft size={14} />
          <span className="hidden lg:inline">Study</span>
        </button>
      </div>
    </header>
  );
}
