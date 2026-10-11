import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  X,
  Building2,
  LayoutDashboard,
  CalendarCheck,
  Calculator,
  FileBarChart2,
  Menu,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { WORKTRACK_NAV_ITEMS } from './WorkTrackSidebar';

export function WorkTrackMobileNav({
  isOpen,
  onClose,
  onBackToStudy,
}) {
  const navigate = useNavigate();
  const bottomItems = [
    { path: '/worktrack/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/worktrack/attendance', label: 'Attendance', icon: CalendarCheck },
    { path: '/worktrack/salary', label: 'Salary', icon: Calculator },
    { path: '/worktrack/reports', label: 'Reports', icon: FileBarChart2 },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-slate-800 z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Building2 size={18} />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">My WorkTrack</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {WORKTRACK_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Navigation to Personal OS and StudyFlow */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button
            onClick={() => {
              onClose();
              navigate('/');
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition shadow-sm"
          >
            <Sparkles size={16} />
            <span>Personal OS Hub</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onBackToStudy();
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-dashed border-slate-300 dark:border-slate-700"
          >
            <ArrowLeft size={16} />
            <span>Back to StudyFlow</span>
          </button>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-dark-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 z-30">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-14 h-full relative text-[11px] font-medium transition ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              <Icon size={19} />
              <span className="mt-1">{item.label}</span>
            </NavLink>
          );
        })}
        {/* More button */}
        <button
          onClick={onClose ? () => {} : undefined}
          data-drawer-trigger="true"
          className="flex flex-col items-center justify-center w-14 h-full text-[11px] font-medium text-slate-500 dark:text-slate-400"
        >
          <Menu size={19} />
          <span className="mt-1">All Pages</span>
        </button>
      </nav>
    </>
  );
}
