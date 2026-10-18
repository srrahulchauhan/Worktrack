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
  FileSpreadsheet,
  RefreshCw,
  Home,
  CheckCircle2,
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
  const {
    companies,
    activeCompanyId,
    setActiveCompanyId,
    syncConfig,
    downloadExcel,
    syncNow,
  } = useWorkTrack();
  const { theme, toggleTheme } = useTheme();
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  const handleSheetsClick = () => {
    if (syncConfig.isConnected) {
      syncNow();
    } else {
      onOpenSaveSync();
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
        <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-dark-950/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-1 sm:px-2.5 sm:py-1 max-w-[210px] sm:max-w-xs transition">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Building2 size={14} />
          </div>
          <select
            value={activeCompanyId}
            onChange={(e) => setActiveCompanyId(e.target.value)}
            className="text-xs font-bold bg-transparent text-slate-900 dark:text-white outline-hidden cursor-pointer truncate pr-1"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id} className="dark:bg-dark-900 text-slate-900 dark:text-white">
                {c.name} {c.status === 'Active' || c.status === 'Current' || !c.leavingDate ? '(Active)' : '(Left Company)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right side: Quick Excel, Google Sheets, Save & Sync, Quick Action, Theme */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* 1-Click Excel (.xlsx) Download Button */}
        <button
          onClick={downloadExcel}
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold border transition bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60 shadow-xs active:scale-95"
          title="Instant 1-Click Excel (.xlsx) Multi-Sheet Export"
        >
          <FileSpreadsheet size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="hidden md:inline">Excel</span>
          <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-200/70 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 hidden lg:inline">
            .xlsx
          </span>
        </button>

        {/* Quick Google Sheets Sync Button */}
        <button
          onClick={handleSheetsClick}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold border transition shadow-xs active:scale-95 ${
            syncConfig.isConnected
              ? 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60'
              : 'bg-white hover:bg-slate-50 dark:bg-dark-950 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
          }`}
          title={
            syncConfig.isConnected
              ? `Connected to Google Sheets: ${syncConfig.spreadsheetName}. Click to Sync Now.`
              : 'Connect Google Sheets Web App for Auto-Sync'
          }
        >
          <Cloud
            size={15}
            className={`shrink-0 ${
              syncConfig.syncStatus === 'syncing'
                ? 'text-blue-500 animate-pulse'
                : syncConfig.isConnected
                ? 'text-emerald-500'
                : 'text-slate-400'
            }`}
          />
          <span className="hidden md:inline">Google Sheets</span>
          {syncConfig.isConnected ? (
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                syncConfig.syncStatus === 'syncing'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  : syncConfig.syncStatus === 'synced'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {syncConfig.syncStatus === 'syncing' ? 'Syncing' : 'Live'}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hidden lg:inline">
              Connect
            </span>
          )}
        </button>

        {/* Save & Sync Hub Button */}
        <button
          onClick={onOpenSaveSync}
          className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold border transition bg-white dark:bg-dark-950 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-xs"
          title="Open Full Save, Export & Google Sheets Sync Center"
        >
          <span className="hidden sm:inline">Save Hub</span>
          <span className="sm:hidden">
            <RefreshCw size={15} className="text-slate-500" />
          </span>
        </button>

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

                <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    downloadExcel();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                >
                  <FileSpreadsheet size={15} className="text-emerald-500" />
                  <span>Download Full Excel (.xlsx)</span>
                </button>

                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onOpenSaveSync();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                >
                  <Cloud size={15} className="text-blue-500" />
                  <span>Google Sheets Sync Hub</span>
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

        {/* Home / StudyFlow Return Buttons */}
        <button
          onClick={() => navigate('/')}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-800"
          title="Return to Personal OS Home Dashboard"
        >
          <Home size={14} />
          <span className="hidden md:inline">Home</span>
        </button>

        <button
          onClick={onBackToStudy}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Back to StudyFlow"
        >
          <ArrowLeft size={14} />
          <span className="hidden lg:inline">Study</span>
        </button>
      </div>
    </header>
  );
}
