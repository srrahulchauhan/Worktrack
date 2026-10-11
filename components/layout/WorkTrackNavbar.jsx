import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Building2,
  Plus,
  Sun,
  Moon,
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  Cloud,
  RefreshCw,
  Home,
} from 'lucide-react';
import { useWorkTrack } from '../../context/WorkTrackContext';
import { useTheme } from '../../context/ThemeContext';

export function WorkTrackNavbar({
  onOpenMobileMenu,
  onOpenAddCompany,
  onOpenMarkAttendance,
  onOpenAddOvertime,
  onOpenSaveSync,
  onBackToStudy,
}) {
  const navigate = useNavigate();
  const { companies, activeCompanyId, setActiveCompanyId, syncConfig } = useWorkTrack();
  const { theme, toggleTheme } = useTheme();
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
      {/* Left side: Hamburger & Active Company Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Company Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Building2 size={16} />
          </div>
          <select
            value={activeCompanyId}
            onChange={(e) => setActiveCompanyId(e.target.value)}
            className="text-xs sm:text-sm font-semibold py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition cursor-pointer max-w-[200px] sm:max-w-xs truncate"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.status === 'Current' ? '(Current)' : '(Left)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right side: Save & Sync, Quick Action Button, Theme toggle, Back button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Save & Sync Header Button */}
        <button
          onClick={onOpenSaveSync}
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold border transition bg-white dark:bg-dark-950 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
          title="Save, Excel Export & Google Sheets Auto-Sync Dashboard"
        >
          <Cloud size={15} className={syncConfig.syncStatus === 'syncing' ? 'text-blue-500 animate-pulse' : syncConfig.isConnected ? 'text-emerald-500' : 'text-slate-400'} />
          <span className="hidden sm:inline">Save & Sync</span>
          {syncConfig.isConnected ? (
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                syncConfig.syncStatus === 'syncing'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  : syncConfig.syncStatus === 'synced'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : syncConfig.syncStatus === 'failed'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {syncConfig.syncStatus === 'syncing' ? 'Syncing' : syncConfig.syncStatus === 'synced' ? 'Synced' : syncConfig.syncStatus === 'failed' ? 'Failed' : 'Pending'}
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-slate-400 hidden md:inline">
              Local
            </span>
          )}
        </button>

        {/* Quick Action Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition active:scale-95"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Quick Action</span>
          </button>

          {isQuickMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsQuickMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onOpenMarkAttendance();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  <Calendar size={15} className="text-emerald-500" />
                  <span>Mark Attendance</span>
                </button>

                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onOpenAddOvertime();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  <Clock size={15} className="text-amber-500" />
                  <span>Log Overtime</span>
                </button>

                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onOpenAddCompany();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  <Building2 size={15} className="text-blue-500" />
                  <span>Add Company</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Personal OS Home Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/20 transition active:scale-95"
          title="Return to Personal OS Home Dashboard"
        >
          <Home size={14} />
          <span>Home</span>
        </button>

        {/* Back to StudyFlow */}
        <button
          onClick={onBackToStudy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-800"
          title="Return to StudyFlow"
        >
          <ArrowLeft size={14} />
          <span className="hidden md:inline">StudyFlow</span>
        </button>
      </div>
    </header>
  );
}
