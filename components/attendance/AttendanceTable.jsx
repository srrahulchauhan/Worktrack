import React, { useState } from 'react';
import { Edit2, Trash2, Search, Filter, ArrowUpDown, Clock } from 'lucide-react';
import { AttendanceBadge } from '../common/Badge';
import { ConfirmModal } from '../common/ConfirmModal';
import { formatINR, formatDate } from '../../utils/workTrackCalculations';

export function AttendanceTable({
  attendance,
  onEdit,
  onDelete,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter and sort records
  const filtered = attendance.filter((item) => {
    const matchesSearch =
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.companyName && item.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.dayOfWeek.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    return sortAsc
      ? a.date.localeCompare(b.date)
      : b.date.localeCompare(a.date);
  });

  return (
    <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search records by notes, day, company..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden transition"
            >
              <option value="ALL">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Half Day">Half Day</option>
              <option value="Weekly Off">Weekly Off</option>
              <option value="Paid Leave">Paid Leave</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
              <option value="Holiday">Holiday</option>
            </select>

            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={sortAsc ? 'Sort Date: Oldest first' : 'Sort Date: Newest first'}
            >
              <ArrowUpDown size={16} />
            </button>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing {sorted.length} records
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-dark-950/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Date / Day</th>
              <th className="py-3.5 px-4">Company</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Shift Details</th>
              <th className="py-3.5 px-4">Timings</th>
              <th className="py-3.5 px-4 text-center">Hours</th>
              <th className="py-3.5 px-4 text-center">Overtime</th>
              <th className="py-3.5 px-4 text-right">Daily Earnings</th>
              <th className="py-3.5 px-4">Notes</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-12 text-center text-slate-400">
                  <p className="font-semibold text-sm">No attendance records found</p>
                  <p className="text-xs mt-1">Try adjusting your filters or search term</p>
                </td>
              </tr>
            ) : (
              sorted.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-dark-950/40 transition-colors"
                >
                  {/* Date & Day */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {formatDate(record.date, 'DD MMM YYYY')}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-medium">
                      {record.dayOfWeek}
                    </span>
                  </td>

                  {/* Company */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {record.companyName}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <AttendanceBadge status={record.status} />
                  </td>

                  {/* Shift */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                      {record.actualShift || record.plannedShift}
                    </span>
                    {record.plannedShift !== record.actualShift && (
                      <span className="text-[10px] text-slate-400 block">
                        Plan: {record.plannedShift}
                      </span>
                    )}
                  </td>

                  {/* Timings */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {record.checkIn ? (
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {record.checkIn} - {record.checkOut}
                        </span>
                        {record.breakDuration > 0 && (
                          <span className="text-[10px] text-slate-400 block">
                            Break: {record.breakDuration}m
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>

                  {/* Hours */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {record.totalWorkingHours > 0 ? `${record.totalWorkingHours}h` : '0h'}
                    </span>
                  </td>

                  {/* Overtime */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {record.overtimeHours > 0 ? (
                      <div>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          +{record.overtimeHours}h
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          +{formatINR(record.overtimeEarnings)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>

                  {/* Earnings */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <span className="font-extrabold text-slate-900 dark:text-white block">
                      {formatINR(record.totalDailyEarnings)}
                    </span>
                    {record.overtimeEarnings > 0 && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">
                        Base: {formatINR(record.dailySalary)}
                      </span>
                    )}
                  </td>

                  {/* Notes */}
                  <td className="py-3 px-4 max-w-xs truncate text-xs text-slate-500 dark:text-slate-400">
                    {record.notes || '—'}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(record)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Edit record"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(record)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Delete record"
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

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            onDelete(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete Attendance Record"
        message={`Are you sure you want to delete the attendance record for ${deleteTarget?.date}? This will update your calculated earnings and working days.`}
        confirmText="Delete Record"
      />
    </div>
  );
}
