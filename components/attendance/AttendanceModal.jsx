import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Building2, AlertCircle, DollarSign, Sparkles, Plus, Check } from 'lucide-react';
import { useWorkTrack } from '../../context/WorkTrackContext';
import {
  calculateWorkingHours,
  calculateDailySalaryRate,
  calculateAttendanceDailyEarnings,
  calculateOvertimeAmount,
  formatINR,
} from '../../utils/workTrackCalculations';
import dayjs from 'dayjs';

export function AttendanceModal({
  isOpen,
  onClose,
  recordToEdit = null,
  initialDate = null,
  initialCompanyId = null,
}) {
  const {
    companies,
    activeCompany,
    attendance,
    shifts,
    settings,
    addAttendance,
    updateAttendance,
  } = useWorkTrack();

  const [formData, setFormData] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    companyId: activeCompany?.id || '',
    status: 'Present',
    plannedShift: 'Day Shift',
    actualShift: 'Day Shift',
    checkIn: '09:00',
    checkOut: '18:00',
    breakDuration: '60',
    overtimeHours: '',
    notes: '',
  });

  // Dedicated Overtime Salary feature state
  const [hasOvertime, setHasOvertime] = useState(false);
  const [customOtRate, setCustomOtRate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (recordToEdit) {
      const otHoursVal = Number(recordToEdit.overtimeHours) || 0;
      setHasOvertime(otHoursVal > 0 || !!recordToEdit.hasOvertime);
      setCustomOtRate(recordToEdit.overtimeRate !== undefined ? String(recordToEdit.overtimeRate) : '');
      setFormData({
        date: recordToEdit.date,
        companyId: recordToEdit.companyId,
        status: recordToEdit.status,
        plannedShift: recordToEdit.plannedShift || 'Day Shift',
        actualShift: recordToEdit.actualShift || 'Day Shift',
        checkIn: recordToEdit.checkIn || '',
        checkOut: recordToEdit.checkOut || '',
        breakDuration: recordToEdit.breakDuration?.toString() || '0',
        overtimeHours: otHoursVal > 0 ? String(otHoursVal) : '',
        notes: recordToEdit.notes || '',
      });
    } else {
      const defaultCompany = initialCompanyId || activeCompany?.id || (companies[0]?.id ?? '');
      setHasOvertime(false);
      setCustomOtRate('');
      setFormData({
        date: initialDate || dayjs().format('YYYY-MM-DD'),
        companyId: defaultCompany,
        status: 'Present',
        plannedShift: 'Day Shift',
        actualShift: 'Day Shift',
        checkIn: '09:00',
        checkOut: '18:00',
        breakDuration: '60',
        overtimeHours: '',
        notes: '',
      });
    }
    setError('');
  }, [recordToEdit, initialDate, initialCompanyId, isOpen, activeCompany, companies]);

  // Adjust timings when shift changes
  const handleShiftChange = (shiftType, isPlanned = false) => {
    let checkIn = formData.checkIn;
    let checkOut = formData.checkOut;
    let breakDuration = formData.breakDuration;

    if (shiftType === 'Day Shift') {
      checkIn = shifts?.dayShift?.startTime || '09:00';
      checkOut = shifts?.dayShift?.endTime || '18:00';
      breakDuration = (shifts?.dayShift?.breakMinutes || 60).toString();
    } else if (shiftType === 'Night Shift') {
      checkIn = shifts?.nightShift?.startTime || '20:00';
      checkOut = shifts?.nightShift?.endTime || '05:00';
      breakDuration = (shifts?.nightShift?.breakMinutes || 60).toString();
    }

    if (isPlanned) {
      setFormData((prev) => ({
        ...prev,
        plannedShift: shiftType,
        actualShift: shiftType === 'Rotational Shift' ? prev.actualShift : shiftType,
        checkIn: prev.status === 'Present' || prev.status === 'Half Day' ? checkIn : prev.checkIn,
        checkOut: prev.status === 'Present' || prev.status === 'Half Day' ? checkOut : prev.checkOut,
        breakDuration,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        actualShift: shiftType,
        checkIn,
        checkOut,
        breakDuration,
      }));
    }
  };

  // Adjust defaults when status changes
  const handleStatusChange = (status) => {
    if (status === 'Absent' || status === 'Weekly Off' || status === 'Paid Leave' || status === 'Unpaid Leave' || status === 'Holiday') {
      setHasOvertime(false);
      setFormData((prev) => ({
        ...prev,
        status,
        checkIn: '',
        checkOut: '',
        breakDuration: '0',
        overtimeHours: '0',
      }));
    } else if (status === 'Half Day') {
      setFormData((prev) => ({
        ...prev,
        status,
        checkIn: '09:00',
        checkOut: '13:30',
        breakDuration: '30',
      }));
    } else {
      // Present (Full Day)
      setFormData((prev) => ({
        ...prev,
        status,
        checkIn: prev.checkIn || '09:00',
        checkOut: prev.checkOut || '18:00',
        breakDuration: prev.breakDuration || '60',
      }));
    }
  };

  // Live Calculations
  const selectedCompany = companies.find((c) => c.id === formData.companyId) || activeCompany;
  const standardHours = selectedCompany?.standardWorkingHours || 8;

  const hoursResult = calculateWorkingHours(formData.checkIn, formData.checkOut, formData.breakDuration);
  const netHours = hoursResult.netHours;

  const defaultOtRate = selectedCompany?.overtimeRate || (selectedCompany?.monthlySalary ? Math.round(Number(selectedCompany.monthlySalary) / ((Number(selectedCompany.scheduledWorkingDays) || 26) * standardHours)) : 200) || 200;
  const effectiveOtRate = customOtRate !== '' && !isNaN(Number(customOtRate)) ? Number(customOtRate) : defaultOtRate;

  // Overtime Hours determination:
  let calculatedOT = 0;
  if (hasOvertime) {
    if (formData.overtimeHours !== '' && !isNaN(Number(formData.overtimeHours))) {
      calculatedOT = Math.max(0, Number(formData.overtimeHours));
    } else if (netHours > standardHours) {
      calculatedOT = Math.round((netHours - standardHours) * 100) / 100;
    } else {
      calculatedOT = 2; // Default 2 hours upon checking
    }
  }

  const dailyRate = selectedCompany?.dailySalaryRate || calculateDailySalaryRate({
    monthlySalary: selectedCompany?.monthlySalary || 0,
    scheduledWorkingDays: selectedCompany?.scheduledWorkingDays || 26,
    date: formData.date,
    method: settings?.calculationMethod,
  });

  const dailyBaseEarnings = calculateAttendanceDailyEarnings({
    status: formData.status,
    dailyRate,
    settings,
  });

  // OT Salary Calculation as per user's exact specification:
  // OT Hours * OT Rate per hour (e.g., 2 hrs * 200 = 400)
  const overtimeAmount = hasOvertime ? Math.round(calculatedOT * effectiveOtRate) : 0;
  const totalDayEarnings = dailyBaseEarnings + overtimeAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.companyId) {
      setError('Please select a company.');
      return;
    }
    if (!formData.date) {
      setError('Please select a date.');
      return;
    }

    try {
      const payload = {
        ...formData,
        hasOvertime,
        overtimeHours: hasOvertime ? calculatedOT : 0,
        overtimeRate: effectiveOtRate,
        overtimeEarnings: overtimeAmount,
        dailySalary: dailyBaseEarnings,
        totalDailyEarnings: totalDayEarnings,
      };

      if (recordToEdit) {
        updateAttendance(recordToEdit.id, payload);
      } else {
        addAttendance(payload);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Error saving attendance record.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-dark-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {recordToEdit ? 'Edit Attendance Record' : 'Daily Attendance + Overtime'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mark attendance and automatically calculate Overtime (OT) salary
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Calculation Strip (Base + OT + Total) */}
        <div className="bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-amber-500/10 p-4 border-b border-slate-200/60 dark:border-slate-800/60 grid grid-cols-3 gap-3 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              मूल वेतन (Base)
            </span>
            <span className="text-base font-extrabold text-slate-800 dark:text-white mt-0.5 block">
              {formatINR(dailyBaseEarnings)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-500 block tracking-wider">
              ओवरटाइम (OT Salary)
            </span>
            <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 block">
              {hasOvertime && calculatedOT > 0
                ? `+${formatINR(overtimeAmount)} (${calculatedOT}h)`
                : '₹0 (कोई OT नहीं)'}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-500 block tracking-wider">
              कुल दैनिक वेतन (Total)
            </span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {formatINR(totalDayEarnings)}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                तारीख (Date) *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-hidden transition"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                कंपनी (Company) *
              </label>
              <select
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-hidden transition"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.status === 'Current' ? '(Current)' : '(Left)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Attendance Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Attendance Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-hidden transition"
              >
                <option value="Present">Present (उपस्थित - Full Day)</option>
                <option value="Absent">Absent (अनुपस्थित)</option>
                <option value="Half Day">Half Day (आधा दिन)</option>
                <option value="Paid Leave">Leave (Paid - छुट्टी)</option>
                <option value="Unpaid Leave">Leave (Unpaid - अवैतनिक)</option>
                <option value="Weekly Off">Weekly Off (साप्ताहिक अवकाश)</option>
                <option value="Holiday">Holiday (त्योहार / अवकाश)</option>
              </select>
            </div>

            {/* Shift Timings Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Shift Type
              </label>
              <select
                value={formData.actualShift}
                onChange={(e) => handleShiftChange(e.target.value, false)}
                disabled={formData.status === 'Absent' || formData.status === 'Weekly Off'}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition disabled:opacity-50"
              >
                <option value="Day Shift">Day Shift (09:00 - 18:00)</option>
                <option value="Night Shift">Night Shift (20:00 - 05:00)</option>
                <option value="Custom">Custom Timings</option>
              </select>
            </div>

            {/* Check-in Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Check-in Time
              </label>
              <input
                type="time"
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                disabled={formData.status === 'Absent' || formData.status === 'Weekly Off'}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition disabled:opacity-50"
              />
            </div>

            {/* Check-out Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Check-out Time
              </label>
              <input
                type="time"
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                disabled={formData.status === 'Absent' || formData.status === 'Weekly Off'}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition disabled:opacity-50"
              />
            </div>

            {/* Break Minutes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Break Duration (Minutes)
              </label>
              <input
                type="number"
                value={formData.breakDuration}
                onChange={(e) => setFormData({ ...formData, breakDuration: e.target.value })}
                disabled={formData.status === 'Absent' || formData.status === 'Weekly Off'}
                placeholder="60"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition disabled:opacity-50"
              />
            </div>

            {/* Overtime (OT) Selector Feature - Directly triggered when Present or Half Day */}
            {(formData.status === 'Present' || formData.status === 'Half Day') && (
              <div className="sm:col-span-2 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3.5 transition-all">
                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasOvertime}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setHasOvertime(checked);
                        if (checked && (!formData.overtimeHours || formData.overtimeHours === '0')) {
                          setFormData((prev) => ({ ...prev, overtimeHours: '2' }));
                        }
                      }}
                      className="w-5 h-5 rounded-lg text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                    />
                    <div>
                      <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Overtime (OT) जोड़ें</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          Active
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        अतिरिक्त काम के घंटे दर्ज करें और स्वतः OT सैलरी जोड़ें
                      </span>
                    </div>
                  </label>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">कंपनी OT दर</span>
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                      ₹{effectiveOtRate}/घंटा
                    </span>
                  </div>
                </div>

                {hasOvertime && (
                  <div className="pt-3 border-t border-amber-200 dark:border-amber-800/50 space-y-3 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          OT घंटे (Overtime Hours):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            max="24"
                            value={formData.overtimeHours}
                            onChange={(e) => setFormData({ ...formData, overtimeHours: e.target.value })}
                            placeholder="2"
                            className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white font-extrabold focus:ring-2 focus:ring-amber-500 outline-hidden"
                          />
                          <span className="text-xs font-bold text-slate-500">hrs</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          OT दर (Rate/Hour):
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="relative w-full">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={customOtRate !== '' ? customOtRate : defaultOtRate}
                              onChange={(e) => setCustomOtRate(e.target.value)}
                              placeholder={String(defaultOtRate)}
                              className="w-full pl-7 pr-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white font-extrabold focus:ring-2 focus:ring-amber-500 outline-hidden"
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-500">/hr</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Hours Preset Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-500">त्वरित चयन:</span>
                      {[1, 2, 3, 4, 5].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setFormData({ ...formData, overtimeHours: String(h) })}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                            Number(formData.overtimeHours) === h
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-white dark:bg-dark-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-amber-500/10'
                          }`}
                        >
                          +{h} घंटा
                        </button>
                      ))}
                    </div>

                    {/* Real-time OT Calculation Callout */}
                    <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between">
                      <div className="text-xs text-slate-700 dark:text-slate-200">
                        <span className="font-bold">गणना: </span>
                        <span>{calculatedOT} घंटे × ₹{effectiveOtRate} = </span>
                      </div>
                      <div className="text-sm font-black text-amber-600 dark:text-amber-400">
                        +₹{overtimeAmount.toLocaleString('en-IN')} OT Salary
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes / Task Summary
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Worked 2 extra hours for production deployment..."
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
            />
          </div>

          {/* Buttons */}
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
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition active:scale-95"
            >
              {recordToEdit ? 'Update Attendance' : 'Save Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
