import React, { useState, useEffect } from 'react';
import { X, Building2, Calendar, DollarSign, Clock, MapPin, Briefcase } from 'lucide-react';
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
    monthlySalary: '60000',
    scheduledWorkingDays: '26',
    standardWorkingHours: '8',
    dailySalaryRate: '',
    overtimeRate: '',
    salaryPaymentDate: '5',
    status: 'Current',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (companyToEdit) {
      setFormData({
        name: companyToEdit.name || '',
        role: companyToEdit.role || '',
        department: companyToEdit.department || '',
        location: companyToEdit.location || '',
        joiningDate: companyToEdit.joiningDate || '',
        leavingDate: companyToEdit.leavingDate || '',
        monthlySalary: companyToEdit.monthlySalary?.toString() || '',
        scheduledWorkingDays: companyToEdit.scheduledWorkingDays?.toString() || '26',
        standardWorkingHours: companyToEdit.standardWorkingHours?.toString() || '8',
        dailySalaryRate: companyToEdit.dailySalaryRate?.toString() || '',
        overtimeRate: companyToEdit.overtimeRate?.toString() || '',
        salaryPaymentDate: companyToEdit.salaryPaymentDate?.toString() || '5',
        status: companyToEdit.status || 'Current',
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
        monthlySalary: '60000',
        scheduledWorkingDays: '26',
        standardWorkingHours: '8',
        dailySalaryRate: '2308',
        overtimeRate: '288',
        salaryPaymentDate: '5',
        status: 'Current',
        notes: '',
      });
    }
    setErrors({});
  }, [companyToEdit, isOpen]);

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

  const durationPreview = calculateEmploymentDuration(
    formData.joiningDate,
    formData.status === 'Left' ? formData.leavingDate : ''
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Company name is required';
    if (!formData.role.trim()) newErrors.role = 'Job role is required';
    if (!formData.joiningDate) newErrors.joiningDate = 'Joining date is required';
    if (formData.status === 'Left' && !formData.leavingDate) {
      newErrors.leavingDate = 'Leaving date is required when status is Left';
    }
    if (
      formData.leavingDate &&
      formData.joiningDate &&
      dayjs(formData.leavingDate).isBefore(dayjs(formData.joiningDate))
    ) {
      newErrors.leavingDate = 'Leaving date cannot be before joining date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (companyToEdit) {
      updateCompany(companyToEdit.id, formData);
    } else {
      addCompany(formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-dark-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {companyToEdit ? 'Edit Company Profile' : 'Add New Company'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your employment details, salary rate, and working schedule
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Employment Duration Live Preview Banner */}
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Calendar size={15} />
              <span className="font-semibold">Calculated Tenure:</span>
              <span className="font-bold">{durationPreview.formatted}</span>
            </div>
            <span className="text-slate-500 dark:text-slate-400">{durationPreview.range}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Apex Infotech"
                className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition ${
                  errors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                }`}
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
            </div>

            {/* Job Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Job Role / Designation *
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Senior Software Engineer"
                className={`w-full px-3.5 py-2 rounded-xl text-sm border bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition ${
                  errors.role ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                }`}
              />
              {errors.role && <p className="text-xs text-rose-500 mt-1">{errors.role}</p>}
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
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Bengaluru / Hybrid"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
              />
            </div>

            {/* Employment Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Employment Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    status: val,
                    leavingDate: val === 'Current' ? '' : prev.leavingDate,
                  }));
                }}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
              >
                <option value="Current">Current Company</option>
                <option value="Left">Previous / Left Company</option>
              </select>
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Joining Date *
              </label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
              />
              {errors.joiningDate && <p className="text-xs text-rose-500 mt-1">{errors.joiningDate}</p>}
            </div>

            {/* Leaving Date (if Left) */}
            {formData.status === 'Left' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Leaving Date *
                </label>
                <input
                  type="date"
                  value={formData.leavingDate}
                  onChange={(e) => setFormData({ ...formData, leavingDate: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
                />
                {errors.leavingDate && <p className="text-xs text-rose-500 mt-1">{errors.leavingDate}</p>}
              </div>
            )}

            {/* Monthly Salary */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Salary (₹) *
              </label>
              <input
                type="number"
                value={formData.monthlySalary}
                onChange={(e) => handleSalaryChange(e.target.value)}
                placeholder="e.g. 75000"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
              />
            </div>

            {/* Scheduled Working Days */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Scheduled Working Days Per Month
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

            {/* Standard Working Hours */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Standard Working Hours / Day
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

            {/* Daily Salary Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Daily Salary Rate (₹)
              </label>
              <input
                type="number"
                value={formData.dailySalaryRate}
                onChange={(e) => setFormData({ ...formData, dailySalaryRate: e.target.value })}
                placeholder="e.g. 2885"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
              />
            </div>

            {/* Overtime Rate Per Hour */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Overtime Rate Per Hour (₹)
              </label>
              <input
                type="number"
                value={formData.overtimeRate}
                onChange={(e) => setFormData({ ...formData, overtimeRate: e.target.value })}
                placeholder="e.g. 360"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
              />
            </div>

            {/* Salary Payment Date of month */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Salary Payment Date (Day of Month)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.salaryPaymentDate}
                onChange={(e) => setFormData({ ...formData, salaryPaymentDate: e.target.value })}
                placeholder="e.g. 5 (5th of every month)"
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes / Appraisal Details
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Full-time role, notice period 60 days, annual appraisal cycle..."
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
            />
          </div>

          {/* Form Actions */}
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
              {companyToEdit ? 'Save Changes' : 'Add Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
