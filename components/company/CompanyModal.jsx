import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Building2,
  Calendar,
  Clock,
  Briefcase,
  MapPin,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useWorkTrack } from '../../context/WorkTrackContext';
import { calculateEmploymentDuration, formatINR } from '../../utils/workTrackCalculations';
import dayjs from 'dayjs';

export function CompanyModal({ isOpen, onClose, companyToEdit = null }) {
  const { addCompany, updateCompany } = useWorkTrack();

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: '',
    location: '',
    joiningDate: dayjs().format('YYYY-MM-DD'),
    leavingDate: '',
    isCurrentlyWorking: true,
    status: 'Active',
    monthlySalary: '60000',
    scheduledWorkingDays: '26',
    standardWorkingHours: '8',
    dailySalaryRate: '2308',
    overtimeRate: '288',
    salaryPaymentDate: '5',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (companyToEdit) {
      const isCurrent =
        companyToEdit.isCurrentlyWorking !== undefined
          ? Boolean(companyToEdit.isCurrentlyWorking)
          : companyToEdit.status === 'Active' ||
            companyToEdit.status === 'Current' ||
            !companyToEdit.leavingDate;

      setFormData({
        name: companyToEdit.name || '',
        role: companyToEdit.role || '',
        department: companyToEdit.department || '',
        location: companyToEdit.location || '',
        joiningDate: companyToEdit.joiningDate || dayjs().format('YYYY-MM-DD'),
        leavingDate: isCurrent ? '' : companyToEdit.leavingDate || '',
        isCurrentlyWorking: isCurrent,
        status: isCurrent ? 'Active' : 'Left Company',
        monthlySalary: companyToEdit.monthlySalary?.toString() || '60000',
        scheduledWorkingDays: companyToEdit.scheduledWorkingDays?.toString() || '26',
        standardWorkingHours: companyToEdit.standardWorkingHours?.toString() || '8',
        dailySalaryRate: companyToEdit.dailySalaryRate?.toString() || '',
        overtimeRate: companyToEdit.overtimeRate?.toString() || '',
        salaryPaymentDate: companyToEdit.salaryPaymentDate?.toString() || '5',
        notes: companyToEdit.notes || '',
      });
    } else {
      setFormData({
        name: '',
        role: '',
        department: '',
        location: '',
        joiningDate: dayjs().format('YYYY-MM-DD'),
        leavingDate: '',
        isCurrentlyWorking: true,
        status: 'Active',
        monthlySalary: '60000',
        scheduledWorkingDays: '26',
        standardWorkingHours: '8',
        dailySalaryRate: '2308',
        overtimeRate: '288',
        salaryPaymentDate: '5',
        notes: '',
      });
    }
    setErrors({});
  }, [companyToEdit, isOpen]);

  // Handle "Currently Working" checkbox change
  const handleCurrentlyWorkingChange = (e) => {
    const checked = e.target.checked;
    setFormData((prev) => {
      const updated = {
        ...prev,
        isCurrentlyWorking: checked,
        status: checked ? 'Active' : 'Left Company',
        leavingDate: checked ? '' : prev.leavingDate,
      };
      return updated;
    });

    // Clear leavingDate error if user checked "Currently Working"
    if (checked && errors.leavingDate) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.leavingDate;
        return next;
      });
    }
  };

  // Recalculate suggested daily and OT rates when monthly salary or days change
  const handleSalaryChange = (val) => {
    const salary = Number(val) || 0;
    const days = Number(formData.scheduledWorkingDays) || 26;
    const hours = Number(formData.standardWorkingHours) || 8;
    const autoDaily = days > 0 ? Math.round(salary / days) : 0;
    const autoOT = hours > 0 ? Math.round(autoDaily / hours) : 0;

    setFormData((prev) => ({
      ...prev,
      monthlySalary: val,
      dailySalaryRate: autoDaily.toString(),
      overtimeRate: autoOT.toString(),
    }));
  };

  // Live Employment Duration Calculation (Years, Months, Days)
  const durationPreview = useMemo(() => {
    const effectiveLeavingDate = formData.isCurrentlyWorking ? '' : formData.leavingDate;
    return calculateEmploymentDuration(formData.joiningDate, effectiveLeavingDate);
  }, [formData.joiningDate, formData.leavingDate, formData.isCurrentlyWorking]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }

    if (!formData.joiningDate) {
      newErrors.joiningDate = 'Company joining date is required';
    }

    // Date validation: leaving date cannot be earlier than joining date
    if (!formData.isCurrentlyWorking) {
      if (!formData.leavingDate) {
        newErrors.leavingDate = 'Please select a leaving date or check Currently Working';
      } else if (
        formData.joiningDate &&
        dayjs(formData.leavingDate).isBefore(dayjs(formData.joiningDate), 'day')
      ) {
        newErrors.leavingDate = 'Leaving date cannot be earlier than joining date';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      ...formData,
      status: formData.isCurrentlyWorking ? 'Active' : 'Left Company',
      leavingDate: formData.isCurrentlyWorking ? '' : formData.leavingDate,
      role: formData.role.trim() || 'Employee',
    };

    if (companyToEdit) {
      updateCompany(companyToEdit.id, payload);
    } else {
      addCompany(payload);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white dark:from-dark-950/80 dark:via-blue-950/30 dark:to-dark-900">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
              <Building2 size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {companyToEdit ? 'Edit Company Profile' : 'Add Company Profile'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track employment tenure, joining & leaving dates, salary rates, and shifts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Real-time Employment Duration Card */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              !durationPreview.isValid
                ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200'
                : 'bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-cyan-50/50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/20 border-blue-200/80 dark:border-blue-800/60'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start gap-2.5">
                <div
                  className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    !durationPreview.isValid
                      ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400'
                      : 'bg-blue-600 text-white shadow-xs'
                  }`}
                >
                  <Calendar size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Calculated Employment Duration
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        formData.isCurrentlyWorking
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {formData.isCurrentlyWorking ? 'Active' : 'Left Company'}
                    </span>
                  </div>

                  <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                    {durationPreview.formatted}
                  </div>

                  {durationPreview.isValid && (
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-white/80 dark:bg-dark-900/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50">
                        {durationPreview.years} {durationPreview.years === 1 ? 'Year' : 'Years'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-white/80 dark:bg-dark-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50">
                        {durationPreview.months} {durationPreview.months === 1 ? 'Month' : 'Months'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-white/80 dark:bg-dark-900/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/50">
                        {durationPreview.days} {durationPreview.days === 1 ? 'Day' : 'Days'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
                  Date Range
                </span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {durationPreview.range}
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Core Company Profile & Tenure Dates */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Building2 size={14} />
              <span>Company & Employment Details</span>
            </h4>

            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Company Name *
              </label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Google India, Infosys, Apex Tech..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border bg-white dark:bg-dark-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-hidden transition ${
                    errors.name ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
              </div>
              {errors.name && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.name}</p>}
            </div>

            {/* "Currently Working" Checkbox Banner */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-dark-950/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="currentlyWorkingCheckbox"
                  checked={formData.isCurrentlyWorking}
                  onChange={handleCurrentlyWorkingChange}
                  className="w-4 h-4 text-blue-600 rounded-md border-slate-300 dark:border-slate-700 focus:ring-blue-500 cursor-pointer"
                />
                <label
                  htmlFor="currentlyWorkingCheckbox"
                  className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 cursor-pointer select-none"
                >
                  Currently Working at this company
                </label>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    formData.isCurrentlyWorking
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      formData.isCurrentlyWorking ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span>{formData.isCurrentlyWorking ? 'Active' : 'Left Company'}</span>
                </span>
              </div>
            </div>

            {/* Joining Date & Leaving Date Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Joining Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Company Joining Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-white dark:bg-dark-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-hidden transition ${
                      errors.joiningDate ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                </div>
                {errors.joiningDate && (
                  <p className="text-xs text-rose-500 font-semibold mt-1">{errors.joiningDate}</p>
                )}
              </div>

              {/* Leaving Date */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Company Leaving Date {!formData.isCurrentlyWorking && '*'}
                  </label>
                  {formData.isCurrentlyWorking && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Empty (Currently Working)
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="date"
                    disabled={formData.isCurrentlyWorking}
                    min={formData.joiningDate}
                    value={formData.leavingDate}
                    onChange={(e) => setFormData({ ...formData, leavingDate: e.target.value })}
                    placeholder="YYYY-MM-DD"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border font-medium outline-hidden transition ${
                      formData.isCurrentlyWorking
                        ? 'bg-slate-100 dark:bg-dark-950/40 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-75'
                        : errors.leavingDate
                        ? 'border-rose-500 ring-1 ring-rose-500/20 bg-white dark:bg-dark-950 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {errors.leavingDate && (
                  <p className="text-xs text-rose-500 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle size={13} />
                    <span>{errors.leavingDate}</span>
                  </p>
                )}
                {formData.isCurrentlyWorking && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Status is set to <span className="font-bold text-emerald-500">Active</span>. Leaving date is kept empty.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Role, Department & Location */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Briefcase size={14} />
              <span>Position & Location Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Job Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Job Role / Designation
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Engineering, Sales, QA"
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Location / Work Mode
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Bengaluru, Remote, Hybrid"
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Salary, Rates & Working Schedule */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <DollarSign size={14} />
              <span>Salary Rates & Work Schedule</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Monthly Salary */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Salary (₹)
                </label>
                <input
                  type="number"
                  value={formData.monthlySalary}
                  onChange={(e) => handleSalaryChange(e.target.value)}
                  placeholder="e.g. 60000"
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition font-bold"
                />
              </div>

              {/* Daily Salary Rate */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Daily Rate (₹/day)
                </label>
                <input
                  type="number"
                  value={formData.dailySalaryRate}
                  onChange={(e) => setFormData({ ...formData, dailySalaryRate: e.target.value })}
                  placeholder="e.g. 2308"
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                />
              </div>

              {/* Overtime Rate */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  OT Rate (₹/hour)
                </label>
                <input
                  type="number"
                  value={formData.overtimeRate}
                  onChange={(e) => setFormData({ ...formData, overtimeRate: e.target.value })}
                  placeholder="e.g. 288"
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                />
              </div>

              {/* Scheduled Working Days */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Working Days / Month
                </label>
                <input
                  type="number"
                  value={formData.scheduledWorkingDays}
                  onChange={(e) => {
                    const days = e.target.value;
                    const sal = Number(formData.monthlySalary) || 0;
                    const autoDaily = Number(days) > 0 ? Math.round(sal / Number(days)) : 0;
                    setFormData((prev) => ({
                      ...prev,
                      scheduledWorkingDays: days,
                      dailySalaryRate: autoDaily.toString(),
                    }));
                  }}
                  placeholder="e.g. 26"
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                />
              </div>

              {/* Standard Hours */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Standard Hours / Day
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.standardWorkingHours}
                  onChange={(e) => setFormData({ ...formData, standardWorkingHours: e.target.value })}
                  placeholder="e.g. 8"
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                />
              </div>

              {/* Salary Payment Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Salary Pay Day (Monthly)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.salaryPaymentDate}
                  onChange={(e) => setFormData({ ...formData, salaryPaymentDate: e.target.value })}
                  placeholder="e.g. 5 (5th of month)"
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes / Appraisal & Employment Details
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Full-time role, probation completed, annual appraisal in April..."
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!durationPreview.isValid}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md transition active:scale-95 ${
                !durationPreview.isValid
                  ? 'bg-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25'
              }`}
            >
              <CheckCircle2 size={16} />
              <span>{companyToEdit ? 'Save Changes' : 'Add Company Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompanyModal;
