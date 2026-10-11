import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Eye, Edit3 } from 'lucide-react';
import { AttendanceBadge } from '../common/Badge';
import { formatINR } from '../../utils/workTrackCalculations';
import dayjs from 'dayjs';

export function AttendanceCalendar({
  attendance,
  selectedMonth,
  setSelectedMonth,
  onDateClick,
  onEditRecord,
}) {
  const currentMonthDate = dayjs(selectedMonth + '-01');
  const startDayOfMonth = currentMonthDate.startOf('month');
  const endDayOfMonth = currentMonthDate.endOf('month');
  const daysInMonth = currentMonthDate.daysInMonth();
  const startDayOfWeek = startDayOfMonth.day(); // 0 (Sun) to 6 (Sat)

  // Quick lookup map: date string (YYYY-MM-DD) -> record
  const recordMap = {};
  attendance.forEach((rec) => {
    recordMap[rec.date] = rec;
  });

  const handlePrevMonth = () => {
    setSelectedMonth(currentMonthDate.subtract(1, 'month').format('YYYY-MM'));
  };

  const handleNextMonth = () => {
    setSelectedMonth(currentMonthDate.add(1, 'month').format('YYYY-MM'));
  };

  const handleToday = () => {
    setSelectedMonth(dayjs().format('YYYY-MM'));
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calendar cells array
  const calendarCells = [];
  // Empty leading cells
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(currentMonthDate.date(d).format('YYYY-MM-DD'));
  }

  return (
    <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Month Navigation Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {currentMonthDate.format('MMMM YYYY')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any date square to mark attendance or view shift breakdown
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-800"
            title="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-800"
          >
            Current Month
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-800"
            title="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-dark-950/60 text-center text-xs font-bold text-slate-500 dark:text-slate-400 py-2.5">
        {daysOfWeek.map((day, idx) => (
          <span key={day} className={idx === 0 ? 'text-rose-500' : ''}>
            {day}
          </span>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-fr gap-px bg-slate-200 dark:bg-slate-800/80">
        {calendarCells.map((dateStr, idx) => {
          if (!dateStr) {
            return (
              <div
                key={`empty_${idx}`}
                className="min-h-[90px] sm:min-h-[105px] bg-slate-50/40 dark:bg-dark-950/20 p-2 opacity-50"
              />
            );
          }

          const record = recordMap[dateStr];
          const isToday = dateStr === dayjs().format('YYYY-MM-DD');
          const dateObj = dayjs(dateStr);
          const dayNum = dateObj.date();

          return (
            <div
              key={dateStr}
              onClick={() => {
                if (record) {
                  onEditRecord(record);
                } else {
                  onDateClick(dateStr);
                }
              }}
              className={`min-h-[90px] sm:min-h-[105px] p-2 bg-white dark:bg-dark-900 transition-all cursor-pointer group hover:bg-blue-50/40 dark:hover:bg-blue-950/20 relative flex flex-col justify-between ${
                isToday ? 'ring-2 ring-blue-500 ring-inset z-10' : ''
              }`}
            >
              {/* Day Number and Quick Action */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday
                      ? 'bg-blue-600 text-white font-black'
                      : dateObj.day() === 0
                      ? 'text-rose-500'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {dayNum}
                </span>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {record ? (
                    <Edit3 size={12} className="text-blue-500" />
                  ) : (
                    <Plus size={14} className="text-slate-400 hover:text-blue-600" />
                  )}
                </div>
              </div>

              {/* Attendance Content */}
              {record ? (
                <div className="mt-1 space-y-1">
                  <AttendanceBadge status={record.status} size="sm" />

                  {record.status === 'Present' && (
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate flex items-center justify-between">
                      <span>{record.totalWorkingHours}h</span>
                      {record.overtimeHours > 0 && (
                        <span className="text-amber-600 font-bold">
                          +{record.overtimeHours}h OT
                        </span>
                      )}
                    </div>
                  )}

                  <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {formatINR(record.totalDailyEarnings)}
                  </div>
                </div>
              ) : (
                <div className="mt-auto text-[10px] text-slate-400 group-hover:text-blue-500 transition-colors">
                  + Add
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
