import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Clock,
  Calculator,
  Timer,
  CreditCard,
  FileBarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useWorkTrack } from '../../context/WorkTrackContext';

export const WORKTRACK_NAV_ITEMS = [
  { path: '/worktrack/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/worktrack/companies', label: 'Company Profiles', icon: Building2 },
  { path: '/worktrack/attendance', label: 'Daily Attendance', icon: CalendarCheck },
  { path: '/worktrack/shifts', label: 'Shift Management', icon: Clock },
  { path: '/worktrack/salary', label: 'Salary Calculator', icon: Calculator },
  { path: '/worktrack/overtime', label: 'Overtime Tracker', icon: Timer },
  { path: '/worktrack/payments', label: 'Salary Payments', icon: CreditCard },
  { path: '/worktrack/reports', label: 'Monthly Reports', icon: FileBarChart2 },
  { path: '/worktrack/settings', label: 'Settings', icon: Settings },
];

export function WorkTrackSidebar({
  isCollapsed,
  setIsCollapsed,
  onBackToStudy,
}) {
  const { activeCompany, companies, syncConfig } = useWorkTrack();
  const navigate = useNavigate();

  return (
    <aside
      className={`hidden lg:flex flex-col bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl border-r border-slate-200/80 dark:border-white/10 transition-all duration-300 z-30 select-none shadow-xs ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div
          onClick={() => navigate('/worktrack/dashboard')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Building2 size={22} />
          </div>
          {!isCollapsed && (
            <div>
              <span className="font-black text-base tracking-tight bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 dark:from-white dark:to-blue-300 bg-clip-text text-transparent">
                My WorkTrack
              </span>
              <span className="block text-[10px] text-blue-600 dark:text-blue-400 font-semibold tracking-wider uppercase">
                Career & Attendance
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Active Company Pill Snippet */}
      {!isCollapsed && activeCompany && (
        <div className="p-3 mx-3 my-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
              Current Company
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-1 truncate">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate block">
              {activeCompany.name}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
              {activeCompany.role}
            </span>
          </div>
        </div>
      )}

      {/* Nav items list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {WORKTRACK_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
              title={isCollapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={19}
                    className={`shrink-0 ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                  {isActive && !isCollapsed && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Cloud & Excel Status Indicator */}
      {!isCollapsed && (
        <div className="px-3 pb-1">
          <div className="p-2.5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-emerald-50/80 dark:from-blue-950/30 dark:to-emerald-950/30 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  syncConfig?.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {syncConfig?.isConnected ? 'Google Sheets' : 'Local Ready'}
              </span>
            </div>
            <span className="font-black text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
              .XLSX
            </span>
          </div>
        </div>
      )}

      {/* Return to Personal OS Hub */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-cyan-400 bg-indigo-50 dark:bg-slate-800/80 hover:bg-indigo-100 dark:hover:bg-slate-800 transition border border-indigo-200/80 dark:border-indigo-800/60"
          title="Return to Personal OS — My Digital World"
        >
          <Sparkles size={15} />
          {!isCollapsed && <span>Personal OS Hub</span>}
        </button>
        <button
          onClick={onBackToStudy}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition"
          title="Switch to StudyFlow"
        >
          <ArrowLeft size={14} />
          {!isCollapsed && <span>StudyFlow</span>}
        </button>
      </div>
    </aside>
  );
}
