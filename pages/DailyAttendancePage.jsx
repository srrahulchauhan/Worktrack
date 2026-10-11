import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Table as TableIcon,
  Plus,
  Filter,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Download,
} from 'lucide-react';
import { useWorkTrack } from '../context/WorkTrackContext';
import { AttendanceCalendar } from '../components/attendance/AttendanceCalendar';
import { AttendanceTable } from '../components/attendance/AttendanceTable';
import { AttendanceModal } from '../components/attendance/AttendanceModal';
import { formatINR } from '../utils/workTrackCalculations';
import dayjs from 'dayjs';

export function DailyAttendancePage() {
  const {
    attendance,
    companies,
    activeCompany,
    activeCompanyId,
    setActiveCompanyId,
    deleteAttendance,
  } = useWorkTrack();

  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'table'
  const [selectedMonth, setSelectedMonth] = useState(() => dayjs().format('YYYY-MM'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [targetDateForNew, setTargetDateForNew] = useState(null);

  // Filter attendance by active company and selected month
  const filteredAttendance = useMemo(() => {
    return attendance.filter((item) => {
      const matchCompany = !activeCompanyId || item.companyId === activeCompanyId;
      const matchMonth = item.date.startsWith(selectedMonth);
      return matchCompany && matchMonth;
    });
  }, [attendance, activeCompanyId, selectedMonth]);

  // Aggregate metrics for summary ribbon
  const presentCount = filteredAttendance.filter((a) => a.status === 'Present').length;
  const absentCount = filteredAttendance.filter((a) => a.status === 'Absent').length;
  const halfDayCount = filteredAttendance.filter((a) => a.status === 'Half Day').length;
  const leavesCount = filteredAttendance.filter(
    (a) => a.status === 'Paid Leave' || a.status === 'Unpaid Leave'
  ).length;
  const weeklyOffCount = filteredAttendance.filter((a) => a.status === 'Weekly Off').length;

  const totalWorkingHours = filteredAttendance.reduce(
    (acc, a) => acc + (Number(a.totalWorkingHours) || 0),
    0
  );

  const totalOvertimeHours = filteredAttendance.reduce(
    (acc, a) => acc + (Number(a.overtimeHours) || 0),
    0
  );

  const totalBaseSalary = filteredAttendance.reduce(
    (acc, a) => acc + (Number(a.dailySalary) || 0),
    0
  );

  const totalOtSalary = filteredAttendance.reduce(
    (acc, a) => acc + (Number(a.overtimeEarnings) || 0),
    0
  );

  const totalDailyEarnings = totalBaseSalary + totalOtSalary;

  const handleDateClick = (dateStr) => {
    setEditingRecord(null);
    setTargetDateForNew(dateStr);
    setIsModalOpen(true);
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setTargetDateForNew(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Daily Attendance Manager
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track daily check-ins, shifts, overnight timings, and automatic daily salary earnings
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-dark-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CalendarIcon size={14} />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-dark-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TableIcon size={14} />
              <span>Table</span>
            </button>
          </div>

          {/* Mark Attendance Button */}
          <button
            onClick={() => {
              setEditingRecord(null);
              setTargetDateForNew(dayjs().format('YYYY-MM-DD'));
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <Plus size={16} />
            <span>Mark Attendance</span>
          </button>
        </div>
      </div>

      {/* Monthly Summary Statistics Ribbon with Base, OT, and Total Salary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40">
          <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 tracking-wider block">
            Present
          </span>
          <span className="text-xl font-black text-emerald-800 dark:text-emerald-200 mt-0.5 block">
            {presentCount} Days
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/40">
          <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300 tracking-wider block">
            Absent
          </span>
          <span className="text-xl font-black text-rose-800 dark:text-rose-200 mt-0.5 block">
            {absentCount} Days
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/40">
          <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-300 tracking-wider block">
            Leaves / Offs
          </span>
          <span className="text-xl font-black text-teal-800 dark:text-teal-200 mt-0.5 block">
            {leavesCount + weeklyOffCount} Days
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/40">
          <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 tracking-wider block">
            Work Hours
          </span>
          <span className="text-xl font-black text-blue-800 dark:text-blue-200 mt-0.5 block">
            {Math.round(totalWorkingHours)}h
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/40">
          <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 tracking-wider block">
            OT Hours
          </span>
          <span className="text-xl font-black text-indigo-800 dark:text-indigo-200 mt-0.5 block">
            {totalOvertimeHours}h
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/40">
          <span className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-300 tracking-wider block">
            मूल वेतन (Base)
          </span>
          <span className="text-lg font-black text-sky-800 dark:text-sky-200 mt-0.5 block truncate">
            {formatINR(totalBaseSalary)}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40">
          <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 tracking-wider block">
            ओवरटाइम (OT Salary)
          </span>
          <span className="text-lg font-black text-amber-800 dark:text-amber-200 mt-0.5 block truncate">
            +{formatINR(totalOtSalary)}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 tracking-wider block">
            कुल वेतन (Total)
          </span>
          <span className="text-lg font-black text-emerald-800 dark:text-emerald-200 mt-0.5 block truncate">
            {formatINR(totalDailyEarnings)}
          </span>
        </div>
      </div>

      {/* Main View: Calendar or Table */}
      {viewMode === 'calendar' ? (
        <AttendanceCalendar
          attendance={filteredAttendance}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          onDateClick={handleDateClick}
          onEditRecord={handleEditRecord}
        />
      ) : (
        <AttendanceTable
          attendance={filteredAttendance}
          onEdit={handleEditRecord}
          onDelete={deleteAttendance}
        />
      )}

      {/* Modal */}
      <AttendanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recordToEdit={editingRecord}
        initialDate={targetDateForNew}
        initialCompanyId={activeCompanyId}
      />
    </div>
  );
}
