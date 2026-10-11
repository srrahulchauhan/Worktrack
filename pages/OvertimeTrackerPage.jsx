import React, { useState, useMemo } from 'react';
import {
  Timer,
  Clock,
  Plus,
  DollarSign,
  TrendingUp,
  Trash2,
  Edit2,
  Calendar,
  Building2,
  Search,
  Filter,
} from 'lucide-react';
import { useWorkTrack } from '../context/WorkTrackContext';
import { OvertimeModal } from '../components/overtime/OvertimeModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { formatINR, formatDate } from '../utils/workTrackCalculations';
import dayjs from 'dayjs';

export function OvertimeTrackerPage() {
  const {
    overtime,
    companies,
    activeCompany,
    activeCompanyId,
    setActiveCompanyId,
    deleteOvertime,
  } = useWorkTrack();

  const [selectedMonth, setSelectedMonth] = useState(() => dayjs().format('YYYY-MM'));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOvertime, setEditingOvertime] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter overtime records
  const filteredOvertime = useMemo(() => {
    return overtime.filter((item) => {
      const matchComp = !activeCompanyId || item.companyId === activeCompanyId;
      const matchMonth = item.date.startsWith(selectedMonth);
      const matchSearch =
        !searchTerm ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.companyName && item.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.date.includes(searchTerm);

      return matchComp && matchMonth && matchSearch;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [overtime, activeCompanyId, selectedMonth, searchTerm]);

  // Aggregate metrics
  const totalHours = filteredOvertime.reduce((s, r) => s + (Number(r.overtimeHours) || 0), 0);
  const totalAmount = filteredOvertime.reduce((s, r) => s + (Number(r.overtimeAmount) || 0), 0);
  const avgHours = filteredOvertime.length > 0 ? (totalHours / filteredOvertime.length).toFixed(1) : '0';
  const highestDay = filteredOvertime.reduce(
    (max, r) => ((Number(r.overtimeHours) || 0) > max ? Number(r.overtimeHours) : max),
    0
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Overtime Tracker & Extra Hours
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track extra hours worked, multiplier rates (1.5x, 2.0x), and synchronized earnings
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20 transition self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Log Overtime</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40">
          <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 tracking-wider block">
            Total OT Hours
          </span>
          <span className="text-2xl font-black text-amber-800 dark:text-amber-200 mt-1 block">
            {totalHours} Hours
          </span>
          <span className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5 block">
            In {dayjs(selectedMonth + '-01').format('MMMM')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40">
          <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 tracking-wider block">
            Total OT Earnings
          </span>
          <span className="text-2xl font-black text-emerald-800 dark:text-emerald-200 mt-1 block">
            {formatINR(totalAmount)}
          </span>
          <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 block">
            Rate × Multiplier applied
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/40">
          <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 tracking-wider block">
            Average Per Session
          </span>
          <span className="text-2xl font-black text-blue-800 dark:text-blue-200 mt-1 block">
            {avgHours}h
          </span>
          <span className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-0.5 block">
            {filteredOvertime.length} OT sessions logged
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/40">
          <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 tracking-wider block">
            Highest Single Day
          </span>
          <span className="text-2xl font-black text-indigo-800 dark:text-indigo-200 mt-1 block">
            {highestDay} Hours
          </span>
          <span className="text-xs text-indigo-600/80 dark:text-indigo-400/80 mt-0.5 block">
            Peak overtime load
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search overtime notes, task..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
            />
          </div>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white"
          />

          <select
            value={activeCompanyId}
            onChange={(e) => setActiveCompanyId(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-slate-700 dark:text-slate-300"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing {filteredOvertime.length} overtime logs
        </div>
      </div>

      {/* Overtime Records Table */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-dark-950/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4 text-center">Total Day Hours</th>
                <th className="py-3.5 px-4 text-center">Overtime Hours</th>
                <th className="py-3.5 px-4 text-right">Base OT Rate</th>
                <th className="py-3.5 px-4 text-center">Multiplier</th>
                <th className="py-3.5 px-4 text-right">Overtime Pay (₹)</th>
                <th className="py-3.5 px-4">Notes / Task</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredOvertime.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-10 text-center text-slate-400">
                    <Timer size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-semibold">No overtime records found for this period</p>
                    <p className="text-xs mt-0.5">Click "Log Overtime" or mark extra hours in Daily Attendance</p>
                  </td>
                </tr>
              ) : (
                filteredOvertime.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-dark-950/40">
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                      {formatDate(item.date, 'DD MMM YYYY')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {item.companyName}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap font-medium text-slate-600 dark:text-slate-400">
                      {item.workingHours ? `${item.workingHours}h` : '—'}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60">
                        {item.overtimeHours} hrs
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {formatINR(item.overtimeRate)}/hr
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {item.overtimeMultiplier || 1.5}x
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap font-black text-emerald-600 dark:text-emerald-400">
                      {formatINR(item.overtimeAmount)}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-500 dark:text-slate-400">
                      {item.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingOvertime(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Edit overtime"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Delete entry"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <OvertimeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <OvertimeModal
        isOpen={Boolean(editingOvertime)}
        overtimeToEdit={editingOvertime}
        onClose={() => setEditingOvertime(null)}
      />

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteOvertime(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete Overtime Record"
        message={`Are you sure you want to remove the ${deleteTarget?.overtimeHours}h overtime entry for ${deleteTarget?.date}?`}
        confirmText="Delete Overtime"
      />
    </div>
  );
}
