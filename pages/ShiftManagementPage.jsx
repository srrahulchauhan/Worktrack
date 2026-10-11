import React, { useState } from 'react';
import {
  Clock,
  Sun,
  Moon,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Calendar,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useWorkTrack } from '../context/WorkTrackContext';
import { ShiftConfigModal } from '../components/shifts/ShiftConfigModal';
import { calculateWorkingHours } from '../utils/workTrackCalculations';

export function ShiftManagementPage() {
  const { shifts, updateShiftSettings } = useWorkTrack();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Overnight Hours Interactive Calculator Sandbox
  const [testIn, setTestIn] = useState('20:00');
  const [testOut, setTestOut] = useState('05:00');
  const [testBreak, setTestBreak] = useState('60');

  const testResult = calculateWorkingHours(testIn, testOut, testBreak);

  const dayHours = calculateWorkingHours(
    shifts?.dayShift?.startTime || '09:00',
    shifts?.dayShift?.endTime || '18:00',
    shifts?.dayShift?.breakMinutes || 60
  );

  const nightHours = calculateWorkingHours(
    shifts?.nightShift?.startTime || '20:00',
    shifts?.nightShift?.endTime || '05:00',
    shifts?.nightShift?.breakMinutes || 60
  );

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleRotationalChange = (day, newShift) => {
    updateShiftSettings({
      ...shifts,
      rotationalSchedule: {
        ...shifts.rotationalSchedule,
        [day]: newShift,
      },
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Shift Management & Timings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure Day Shift, Overnight Night Shift, and day-by-day Rotational shift schedules
          </p>
        </div>

        <button
          onClick={() => setIsConfigModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition self-start sm:self-auto"
        >
          <Sliders size={16} />
          <span>Edit Shift Timings</span>
        </button>
      </div>

      {/* 3 Core Shifts Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Day Shift Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sun size={20} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Standard Day
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3">Day Shift</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              General day working hours
            </p>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Timings:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {shifts?.dayShift?.startTime} – {shifts?.dayShift?.endTime}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Break Duration:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {shifts?.dayShift?.breakMinutes} mins
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Net Working Hours:</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400">
                  {dayHours.netHours} hrs/day
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Standard 8h working schedule
          </div>
        </div>

        {/* Night Shift Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Moon size={20} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Overnight Shift
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3">Night Shift</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Checkout on the next calendar day
            </p>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Timings:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {shifts?.nightShift?.startTime} – {shifts?.nightShift?.endTime}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Break Duration:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {shifts?.nightShift?.breakMinutes} mins
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Net Working Hours:</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                  {nightHours.netHours} hrs/day
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            ✓ Automatic next-day rollover calculation supported
          </div>
        </div>

        {/* Rotational Shift Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <RefreshCw size={20} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Dynamic Schedule
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3">Rotational Shift</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Custom schedule independent for each day
            </p>

            <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <p>• Day-by-day shift mapping</p>
              <p>• Seamlessly mixes Day & Night duties</p>
              <p>• Configured for Monday through Sunday</p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-blue-600 dark:text-blue-400 font-bold">
            Interactive weekly mapping below ↓
          </div>
        </div>
      </div>

      {/* Rotational Weekday Mapping Matrix */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Rotational Shift Weekly Schedule Planner
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select which shift applies to each day of the week. Changes are saved automatically.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {weekdays.map((day) => {
            const currentShift = shifts?.rotationalSchedule?.[day] || 'Day Shift';
            const isNight = currentShift === 'Night Shift';
            const isOff = currentShift === 'Weekly Off';

            return (
              <div
                key={day}
                className={`p-4 rounded-xl border transition-all ${
                  isNight
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800'
                    : isOff
                    ? 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                    : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{day}</span>
                  {isNight ? (
                    <Moon size={14} className="text-indigo-600 dark:text-indigo-400" />
                  ) : isOff ? (
                    <Calendar size={14} className="text-slate-400" />
                  ) : (
                    <Sun size={14} className="text-amber-500" />
                  )}
                </div>

                <select
                  value={currentShift}
                  onChange={(e) => handleRotationalChange(day, e.target.value)}
                  className="w-full text-xs font-semibold py-1.5 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="Day Shift">Day Shift</option>
                  <option value="Night Shift">Night Shift</option>
                  <option value="Weekly Off">Weekly Off</option>
                </select>

                <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {isNight
                    ? `${shifts?.nightShift?.startTime} - ${shifts?.nightShift?.endTime}`
                    : isOff
                    ? 'Day off'
                    : `${shifts?.dayShift?.startTime} - ${shifts?.dayShift?.endTime}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overnight Calculation Interactive Sandbox */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles size={14} />
          <span>Interactive Overnight Shift Calculator</span>
        </div>
        <h3 className="text-lg font-bold">
          Test Overnight Working Hours Across Calendar Days
        </h3>
        <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
          E.g. Check-in at 08:00 PM (20:00) and check-out at 05:00 AM (05:00 next morning). The engine calculates midnight crossing accurately.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Check-in Time</label>
            <input
              type="time"
              value={testIn}
              onChange={(e) => setTestIn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Check-out Time</label>
            <input
              type="time"
              value={testOut}
              onChange={(e) => setTestOut(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Break Duration (mins)</label>
            <input
              type="number"
              value={testBreak}
              onChange={(e) => setTestBreak(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white"
            />
          </div>

          {/* Result card */}
          <div className="p-3 rounded-xl bg-white/10 border border-white/20 text-center">
            <span className="text-[10px] text-indigo-200 uppercase font-bold block">
              Calculated Net Hours
            </span>
            <span className="text-xl font-black text-white block mt-0.5">
              {testResult.netHours} hrs {testResult.isOvernight && <span className="text-[11px] text-amber-300">(Overnight)</span>}
            </span>
          </div>
        </div>
      </div>

      <ShiftConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </div>
  );
}
