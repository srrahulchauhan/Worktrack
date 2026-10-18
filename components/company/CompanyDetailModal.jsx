import React from 'react';
import {
  X,
  Building2,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Edit2,
  CheckCircle2,
  Timer,
  FileText,
} from 'lucide-react';
import {
  calculateEmploymentDuration,
  formatINR,
  formatDate,
} from '../../utils/workTrackCalculations';

export function CompanyDetailModal({ isOpen, onClose, company, onEdit }) {
  if (!isOpen || !company) return null;

  const isActive =
    company.status === 'Active' ||
    company.status === 'Current' ||
    !company.leavingDate;

  const tenure = calculateEmploymentDuration(company.joiningDate, company.leavingDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-white dark:from-dark-950/80 dark:via-blue-950/20 dark:to-dark-900">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-blue-500/25 shrink-0">
              {company.name?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {company.name}
                </h3>
                <span
                  className={`px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider rounded-full border ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {isActive ? 'Active' : 'Left Company'}
                </span>
              </div>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                {company.role || 'Employee'} • {company.department || 'General'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Employment Duration & Dates Highlight Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/60 to-cyan-50/50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/20 border border-blue-200/80 dark:border-blue-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <Timer size={14} />
                <span>Employment Duration</span>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                {tenure.range}
              </span>
            </div>

            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {tenure.formatted}
            </div>

            {tenure.isValid && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/80 dark:bg-dark-900/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50">
                  {tenure.years} {tenure.years === 1 ? 'Year' : 'Years'}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/80 dark:bg-dark-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50">
                  {tenure.months} {tenure.months === 1 ? 'Month' : 'Months'}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/80 dark:bg-dark-900/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/50">
                  {tenure.days} {tenure.days === 1 ? 'Day' : 'Days'}
                </span>
              </div>
            )}
          </div>

          {/* Joining & Leaving Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-dark-950/40">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Joining Date
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-500 shrink-0" />
                <span>{formatDate(company.joiningDate, 'DD MMMM YYYY')}</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-dark-950/40">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Leaving Date
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block flex items-center gap-1.5">
                <Calendar size={14} className="text-indigo-500 shrink-0" />
                <span>
                  {isActive
                    ? 'Currently Working (Present)'
                    : formatDate(company.leavingDate, 'DD MMMM YYYY')}
                </span>
              </span>
            </div>
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
                {company.scheduledWorkingDays || 26} days/mo
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-950/40">
              <span className="text-[11px] text-slate-400 block font-medium">Standard Hours</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
                {company.standardWorkingHours || 8} hrs/day
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-950/40">
              <span className="text-[11px] text-slate-400 block font-medium">Payment Day</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
                {company.salaryPaymentDate || '5'}th of month
              </span>
            </div>
          </div>

          {/* Location & Notes */}
          <div className="space-y-2 text-xs">
            {company.location && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <MapPin size={14} className="text-slate-400" />
                <span>{company.location}</span>
              </div>
            )}
            {company.notes && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-dark-950/60 border border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-300">
                <p className="font-bold text-slate-400 text-[10px] uppercase mb-1 flex items-center gap-1.5">
                  <FileText size={12} />
                  <span>Notes & Details</span>
                </p>
                <p className="whitespace-pre-line leading-relaxed">{company.notes}</p>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              onClick={() => {
                onClose();
                onEdit(company);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition active:scale-95"
            >
              <Edit2 size={14} />
              <span>Edit Company Profile</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyDetailModal;
