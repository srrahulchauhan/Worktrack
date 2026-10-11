import React from 'react';
import { X, Building2, MapPin, Briefcase, Calendar, Clock, DollarSign, Edit2 } from 'lucide-react';
import { calculateEmploymentDuration, formatINR } from '../../utils/workTrackCalculations';

export function CompanyDetailModal({ isOpen, onClose, company, onEdit }) {
  if (!isOpen || !company) return null;

  const tenure = calculateEmploymentDuration(company.joiningDate, company.leavingDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-dark-950/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl">
              {company.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {company.name}
                </h3>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    company.status === 'Current'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {company.status}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {company.role} • {company.department || 'General'}
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

        <div className="p-6 space-y-5">
          {/* Duration highlight */}
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/50 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                Total Tenure
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {tenure.formatted}
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {tenure.range}
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-950/40">
              <span className="text-[11px] text-slate-400 block font-medium">Monthly Salary</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
                {formatINR(company.monthlySalary)}
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-950/40">
              <span className="text-[11px] text-slate-400 block font-medium">Daily Rate</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
                {formatINR(company.dailySalaryRate)} / day
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-950/40">
              <span className="text-[11px] text-slate-400 block font-medium">Overtime Rate</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
                {formatINR(company.overtimeRate)} / hr
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-950/40">
              <span className="text-[11px] text-slate-400 block font-medium">Scheduled Days</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
                {company.scheduledWorkingDays} days/mo
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-950/40">
              <span className="text-[11px] text-slate-400 block font-medium">Standard Hours</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
                {company.standardWorkingHours} hrs/day
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-950/40">
              <span className="text-[11px] text-slate-400 block font-medium">Payment Day</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
                {company.salaryPaymentDate || '5'}th of month
              </span>
            </div>
          </div>

          {/* Location & Details */}
          <div className="space-y-2 text-xs">
            {company.location && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <MapPin size={14} className="text-slate-400" />
                <span>{company.location}</span>
              </div>
            )}
            {company.notes && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-dark-950/60 border border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-400 text-[10px] uppercase mb-1">Notes</p>
                <p className="whitespace-pre-line leading-relaxed">{company.notes}</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              onClick={() => {
                onClose();
                onEdit(company);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition"
            >
              <Edit2 size={14} />
              <span>Edit Company</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
