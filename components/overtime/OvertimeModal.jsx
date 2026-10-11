import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { useWorkTrack } from '../../context/WorkTrackContext';
import { calculateOvertimeAmount, formatINR } from '../../utils/workTrackCalculations';
import dayjs from 'dayjs';

export function OvertimeModal({ isOpen, onClose, overtimeToEdit = null }) {
  const { companies, activeCompany, addOvertime, updateOvertime } = useWorkTrack();

  const [formData, setFormData] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    companyId: activeCompany?.id || '',
    workingHours: '10',
    overtimeHours: '2',
    overtimeRate: '360',
    overtimeMultiplier: '1.5',
    notes: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (overtimeToEdit) {
      setFormData({
        date: overtimeToEdit.date,
        companyId: overtimeToEdit.companyId,
        workingHours: overtimeToEdit.workingHours?.toString() || '10',
        overtimeHours: overtimeToEdit.overtimeHours?.toString() || '2',
        overtimeRate: overtimeToEdit.overtimeRate?.toString() || '360',
        overtimeMultiplier: overtimeToEdit.overtimeMultiplier?.toString() || '1.5',
        notes: overtimeToEdit.notes || '',
      });
    } else {
      const comp = activeCompany || companies[0];
      setFormData({
        date: dayjs().format('YYYY-MM-DD'),
        companyId: comp?.id || '',
        workingHours: '10',
        overtimeHours: '2',
        overtimeRate: comp?.overtimeRate?.toString() || '300',
        overtimeMultiplier: '1.5',
        notes: '',
      });
    }
    setError('');
  }, [overtimeToEdit, isOpen, activeCompany, companies]);

  const selectedCompany = companies.find((c) => c.id === formData.companyId) || activeCompany;

  const hours = Number(formData.overtimeHours) || 0;
  const rate = Number(formData.overtimeRate) || selectedCompany?.overtimeRate || 300;
  const multiplier = Number(formData.overtimeMultiplier) || 1.5;
  const calculatedAmount = calculateOvertimeAmount(hours, rate, multiplier);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.companyId) {
      setError('Please select a company.');
      return;
    }
    if (!formData.date) {
      setError('Please select a date.');
      return;
    }
    if (hours <= 0) {
      setError('Overtime hours must be greater than 0.');
      return;
    }

    if (overtimeToEdit) {
      updateOvertime(overtimeToEdit.id, formData);
    } else {
      addOvertime(formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-dark-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {overlineToEdit ? 'Edit Overtime Entry' : 'Log Overtime Hours'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formula: Hours × Rate × Multiplier
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

        {/* Calculated amount preview badge */}
        <div className="p-4 bg-amber-500/10 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Calculated Overtime Pay
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 block mt-0.5">
              {formatINR(calculatedAmount)}
            </span>
          </div>
          <div className="text-right text-xs text-slate-500 dark:text-slate-400 font-medium">
            {hours} hrs @ {formatINR(rate)}/hr × {multiplier}x
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden transition"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company *
              </label>
              <select
                value={formData.companyId}
                onChange={(e) => {
                  const compId = e.target.value;
                  const comp = companies.find((c) => c.id === compId);
                  setFormData((prev) => ({
                    ...prev,
                    companyId: compId,
                    overtimeRate: comp?.overtimeRate?.toString() || prev.overtimeRate,
                  }));
                }}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden transition"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Working Hours */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Hours Worked Today
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.workingHours}
                onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                placeholder="e.g. 10.5"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden transition"
              />
            </div>

            {/* Overtime Hours */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Overtime Hours *
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.overtimeHours}
                onChange={(e) => setFormData({ ...formData, overtimeHours: e.target.value })}
                placeholder="e.g. 2.5"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden transition"
              />
            </div>

            {/* Overtime Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Overtime Rate Per Hour (₹)
              </label>
              <input
                type="number"
                value={formData.overtimeRate}
                onChange={(e) => setFormData({ ...formData, overtimeRate: e.target.value })}
                placeholder="e.g. 360"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden transition"
              />
            </div>

            {/* Overtime Multiplier */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rate Multiplier (e.g. 1.0x, 1.5x, 2.0x)
              </label>
              <select
                value={formData.overtimeMultiplier}
                onChange={(e) => setFormData({ ...formData, overtimeMultiplier: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden transition"
              >
                <option value="1.0">1.0x (Standard 100%)</option>
                <option value="1.25">1.25x (125%)</option>
                <option value="1.5">1.5x (150% - Standard OT)</option>
                <option value="2.0">2.0x (200% - Double Pay)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Notes / Reason
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Production server deployment, client patch..."
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden transition"
            />
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
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20 transition"
            >
              {overlineToEdit ? 'Update Overtime' : 'Log Overtime'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
