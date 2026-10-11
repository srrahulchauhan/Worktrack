import React, { useState } from 'react';
import { X, Clock, Sun, Moon, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { useWorkTrack } from '../../context/WorkTrackContext';
import { calculateWorkingHours } from '../../utils/workTrackCalculations';

export function ShiftConfigModal({ isOpen, onClose }) {
  const { shifts, updateShiftSettings } = useWorkTrack();

  const [shiftState, setShiftState] = useState(() => ({
    dayShift: {
      startTime: shifts?.dayShift?.startTime || '09:00',
      endTime: shifts?.dayShift?.endTime || '18:00',
      breakMinutes: shifts?.dayShift?.breakMinutes || 60,
      standardHours: shifts?.dayShift?.standardHours || 8,
    },
    nightShift: {
      startTime: shifts?.nightShift?.startTime || '20:00',
      endTime: shifts?.nightShift?.endTime || '05:00',
      breakMinutes: shifts?.nightShift?.breakMinutes || 60,
      standardHours: shifts?.nightShift?.standardHours || 8,
    },
    rotationalSchedule: {
      Monday: shifts?.rotationalSchedule?.Monday || 'Day Shift',
      Tuesday: shifts?.rotationalSchedule?.Tuesday || 'Day Shift',
      Wednesday: shifts?.rotationalSchedule?.Wednesday || 'Night Shift',
      Thursday: shifts?.rotationalSchedule?.Thursday || 'Night Shift',
      Friday: shifts?.rotationalSchedule?.Friday || 'Day Shift',
      Saturday: shifts?.rotationalSchedule?.Saturday || 'Day Shift',
      Sunday: shifts?.rotationalSchedule?.Sunday || 'Weekly Off',
    },
  }));

  const dayHours = calculateWorkingHours(
    shiftState.dayShift.startTime,
    shiftState.dayShift.endTime,
    shiftState.dayShift.breakMinutes
  );

  const nightHours = calculateWorkingHours(
    shiftState.nightShift.startTime,
    shiftState.nightShift.endTime,
    shiftState.nightShift.breakMinutes
  );

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSave = (e) => {
    e.preventDefault();
    updateShiftSettings({
      ...shifts,
      dayShift: {
        ...shifts?.dayShift,
        ...shiftState.dayShift,
        standardHours: Number(shiftState.dayShift.standardHours) || 8,
        breakMinutes: Number(shiftState.dayShift.breakMinutes) || 60,
      },
      nightShift: {
        ...shifts?.nightShift,
        ...shiftState.nightShift,
        standardHours: Number(shiftState.nightShift.standardHours) || 8,
        breakMinutes: Number(shiftState.nightShift.breakMinutes) || 60,
      },
      rotationalSchedule: shiftState.rotationalSchedule,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-dark-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Configure Work Shifts & Rotations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Setup Day Shift, Overnight Night Shift, and Rotational day-by-day mapping
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Day Shift Config */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-950/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sun size={18} className="text-amber-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Day Shift Settings</h4>
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Net Work: {dayHours.netHours} hrs/day
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Start Time</label>
                <input
                  type="time"
                  value={shiftState.dayShift.startTime}
                  onChange={(e) =>
                    setShiftState({
                      ...shiftState,
                      dayShift: { ...shiftState.dayShift, startTime: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">End Time</label>
                <input
                  type="time"
                  value={shiftState.dayShift.endTime}
                  onChange={(e) =>
                    setShiftState({
                      ...shiftState,
                      dayShift: { ...shiftState.dayShift, endTime: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Break (Minutes)</label>
                <input
                  type="number"
                  value={shiftState.dayShift.breakMinutes}
                  onChange={(e) =>
                    setShiftState({
                      ...shiftState,
                      dayShift: { ...shiftState.dayShift, breakMinutes: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Night Shift Config (with overnight support) */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-950/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Moon size={18} className="text-indigo-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Night Shift (Overnight Support)</h4>
              </div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Net Work: {nightHours.netHours} hrs {nightHours.isOvernight && '(Next Day Checkout)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Start Time (Evening/Night)</label>
                <input
                  type="time"
                  value={shiftState.nightShift.startTime}
                  onChange={(e) =>
                    setShiftState({
                      ...shiftState,
                      nightShift: { ...shiftState.nightShift, startTime: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">End Time (Morning Checkout)</label>
                <input
                  type="time"
                  value={shiftState.nightShift.endTime}
                  onChange={(e) =>
                    setShiftState({
                      ...shiftState,
                      nightShift: { ...shiftState.nightShift, endTime: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Break (Minutes)</label>
                <input
                  type="number"
                  value={shiftState.nightShift.breakMinutes}
                  onChange={(e) =>
                    setShiftState({
                      ...shiftState,
                      nightShift: { ...shiftState.nightShift, breakMinutes: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Note: If checkout is earlier in clock time than check-in (e.g. 20:00 PM to 05:00 AM), our system automatically calculates overnight hours across calendar days.
            </p>
          </div>

          {/* Rotational Shift Mapping */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-950/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <RefreshCw size={18} className="text-emerald-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Rotational Schedule by Day</h4>
              </div>
              <span className="text-[11px] text-slate-400">Custom mapping per weekday</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {weekdays.map((day) => (
                <div key={day} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-dark-950 border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{day}</span>
                  <select
                    value={shiftState.rotationalSchedule[day] || 'Day Shift'}
                    onChange={(e) =>
                      setShiftState({
                        ...shiftState,
                        rotationalSchedule: {
                          ...shiftState.rotationalSchedule,
                          [day]: e.target.value,
                        },
                      })
                    }
                    className="text-xs font-medium px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Day Shift">Day Shift</option>
                    <option value="Night Shift">Night Shift</option>
                    <option value="Weekly Off">Weekly Off</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition"
            >
              Save Shift Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
