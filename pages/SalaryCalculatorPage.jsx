import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Building2,
  DollarSign,
  TrendingUp,
  Download,
  Percent,
  Sliders,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useWorkTrack } from '../context/WorkTrackContext';
import {
  formatINR,
  calculateDailySalaryRate,
  calculateAttendanceDailyEarnings,
  calculateOvertimeAmount,
} from '../utils/workTrackCalculations';
import dayjs from 'dayjs';

export function SalaryCalculatorPage() {
  const {
    companies,
    activeCompany,
    activeCompanyId,
    setActiveCompanyId,
    attendance,
    settings,
    setSettings,
  } = useWorkTrack();

  const [selectedMonth, setSelectedMonth] = useState(() => dayjs().format('YYYY-MM'));
  const [calculationMethod, setCalculationMethod] = useState(
    settings?.calculationMethod || 'monthly_divided_by_scheduled'
  );
  const [customDailyRate, setCustomDailyRate] = useState('');

  // Selected company object
  const company = activeCompany || companies[0];

  const monthlySalary = company?.monthlySalary || 0;
  const scheduledDays = company?.scheduledWorkingDays || 26;
  const overtimeRate = company?.overtimeRate || 360;

  // Active Daily Rate calculation
  const computedDailyRate = useMemo(() => {
    return calculateDailySalaryRate({
      monthlySalary,
      scheduledWorkingDays: scheduledDays,
      date: selectedMonth + '-01',
      method: calculationMethod,
      customRate: customDailyRate,
    });
  }, [monthlySalary, scheduledDays, selectedMonth, calculationMethod, customDailyRate]);

  // Attendance records for the selected month & company
  const monthRecords = useMemo(() => {
    return attendance.filter((a) => {
      const matchComp = !company || a.companyId === company.id;
      const matchMonth = a.date.startsWith(selectedMonth);
      return matchComp && matchMonth;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [attendance, company, selectedMonth]);

  // Calculations for each record using active settings
  const processedRecords = useMemo(() => {
    return monthRecords.map((rec) => {
      const baseEarned = calculateAttendanceDailyEarnings({
        status: rec.status,
        dailyRate: computedDailyRate,
        settings,
      });

      const otEarned = calculateOvertimeAmount(
        rec.overtimeHours,
        overtimeRate,
        settings?.defaultOvertimeMultiplier || 1.5
      );

      return {
        ...rec,
        computedBaseEarned: baseEarned,
        computedOtEarned: otEarned,
        computedTotalEarned: baseEarned + otEarned,
      };
    });
  }, [monthRecords, computedDailyRate, settings, overtimeRate]);

  // Totals
  const totalBaseEarnings = processedRecords.reduce((s, r) => s + r.computedBaseEarned, 0);
  const totalOtEarnings = processedRecords.reduce((s, r) => s + r.computedOtEarned, 0);
  const totalGrossEarnings = totalBaseEarnings + totalOtEarnings;

  const presentDaysCount = processedRecords.filter((r) => r.status === 'Present').length;
  const halfDaysCount = processedRecords.filter((r) => r.status === 'Half Day').length;
  const absentDaysCount = processedRecords.filter((r) => r.status === 'Absent').length;
  const paidLeaveCount = processedRecords.filter((r) => r.status === 'Paid Leave').length;
  const weeklyOffCount = processedRecords.filter((r) => r.status === 'Weekly Off').length;
  const totalOtHours = processedRecords.reduce((s, r) => s + (Number(r.overtimeHours) || 0), 0);

  // Policy update handlers
  const handlePolicyChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: Number(value),
    }));
  };

  // Export Daily Salary Breakdown CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Day', 'Status', 'Working Hours', 'OT Hours', 'Base Salary (INR)', 'OT Earnings (INR)', 'Total Daily Earnings (INR)', 'Notes'];
    const rows = processedRecords.map((r) => [
      r.date,
      r.dayOfWeek,
      r.status,
      r.totalWorkingHours || 0,
      r.overtimeHours || 0,
      r.computedBaseEarned,
      r.computedOtEarned,
      r.computedTotalEarned,
      `"${r.notes || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Salary-Breakdown-${company?.name || 'Company'}-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Dynamic Salary Calculator & Rules
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Calculates base pay, paid leave policies, half-day reductions, and overtime earnings
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition shadow-xs"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Inputs & Settings Controls Bar */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Company Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Selected Company
            </label>
            <select
              value={activeCompanyId}
              onChange={(e) => setActiveCompanyId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({formatINR(c.monthlySalary)}/mo)
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Salary Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          {/* Calculation Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Calculation Method Formula
            </label>
            <select
              value={calculationMethod}
              onChange={(e) => setCalculationMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="monthly_divided_by_scheduled">
                Monthly Salary ÷ Scheduled Days ({scheduledDays} days)
              </option>
              <option value="monthly_divided_by_calendar">
                Monthly Salary ÷ Calendar Days ({dayjs(selectedMonth + '-01').daysInMonth()} days)
              </option>
              <option value="custom">Custom Daily Rate</option>
            </select>
          </div>

          {/* Applied Daily Rate */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Applied Daily Salary Rate
            </label>
            {calculationMethod === 'custom' ? (
              <input
                type="number"
                value={customDailyRate}
                onChange={(e) => setCustomDailyRate(e.target.value)}
                placeholder="Enter custom rate..."
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white font-bold"
              />
            ) : (
              <div className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-dark-950 font-bold text-blue-600 dark:text-blue-400">
                {formatINR(computedDailyRate)} / day
              </div>
            )}
          </div>
        </div>

        {/* Policy Configuration Accordion / Strip */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950/40 border border-slate-200/80 dark:border-slate-800">
            <span className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Paid Leave Pay:
            </span>
            <select
              value={settings?.paidLeavePayPercent ?? 100}
              onChange={(e) => handlePolicyChange('paidLeavePayPercent', e.target.value)}
              className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-dark-900 font-bold text-slate-800 dark:text-slate-100"
            >
              <option value="100">100% (Full Pay)</option>
              <option value="50">50% (Half Pay)</option>
              <option value="0">0% (Unpaid)</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950/40 border border-slate-200/80 dark:border-slate-800">
            <span className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Weekly Off Pay:
            </span>
            <select
              value={settings?.weeklyOffPayPercent ?? 100}
              onChange={(e) => handlePolicyChange('weeklyOffPayPercent', e.target.value)}
              className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-dark-900 font-bold text-slate-800 dark:text-slate-100"
            >
              <option value="100">100% (Full Pay Included)</option>
              <option value="0">0% (Excluded from Daily Rate)</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950/40 border border-slate-200/80 dark:border-slate-800">
            <span className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Holiday Pay:
            </span>
            <select
              value={settings?.holidayPayPercent ?? 100}
              onChange={(e) => handlePolicyChange('holidayPayPercent', e.target.value)}
              className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-dark-900 font-bold text-slate-800 dark:text-slate-100"
            >
              <option value="100">100% (Full Paid Holiday)</option>
              <option value="0">0% (Unpaid)</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950/40 border border-slate-200/80 dark:border-slate-800">
            <span className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Half Day Pay:
            </span>
            <select
              value={settings?.halfDayPayPercent ?? 50}
              onChange={(e) => handlePolicyChange('halfDayPayPercent', e.target.value)}
              className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-dark-900 font-bold text-slate-800 dark:text-slate-100"
            >
              <option value="50">50% (Half Pay)</option>
              <option value="60">60%</option>
              <option value="40">40%</option>
            </select>
          </div>
        </div>
      </div>

      {/* Monthly Summary Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
            Base Salary Earned
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {formatINR(totalBaseEarnings)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            {presentDaysCount} Present + {halfDaysCount} Half Days + Leaves
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
            Overtime Earnings
          </span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
            {formatINR(totalOtEarnings)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            {totalOtHours} hours @ {formatINR(overtimeRate)}/hr × {settings?.defaultOvertimeMultiplier || 1.5}x
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            Total Gross Earnings
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatINR(totalGrossEarnings)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Base Pay + Overtime Pay
          </span>
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Salary Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Itemized earnings calculated for every day of {dayjs(selectedMonth + '-01').format('MMMM YYYY')}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {processedRecords.length} Days Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-dark-950/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Day</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4 text-center">Working Hours</th>
                <th className="py-3 px-4 text-center">OT Hours</th>
                <th className="py-3 px-4 text-right">Base Earned (₹)</th>
                <th className="py-3 px-4 text-right">OT Earned (₹)</th>
                <th className="py-3 px-4 text-right font-black">Daily Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {processedRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No attendance records for {selectedMonth}. Mark attendance to see the daily salary breakdown.
                  </td>
                </tr>
              ) : (
                processedRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 dark:hover:bg-dark-950/40">
                    <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {rec.date}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">
                      {rec.dayOfWeek}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-semibold">{rec.status}</span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-medium">
                      {rec.totalWorkingHours > 0 ? `${rec.totalWorkingHours}h` : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-center font-medium text-amber-600 dark:text-amber-400">
                      {rec.overtimeHours > 0 ? `${rec.overtimeHours}h` : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-slate-800 dark:text-slate-200">
                      {formatINR(rec.computedBaseEarned)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-amber-600 dark:text-amber-400">
                      {rec.computedOtEarned > 0 ? formatINR(rec.computedOtEarned) : '₹0'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                      {formatINR(rec.computedTotalEarned)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {processedRecords.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100/70 dark:bg-dark-950 font-bold border-t border-slate-200 dark:border-slate-800 text-xs sm:text-sm">
                  <td colSpan="5" className="py-3 px-4 text-slate-700 dark:text-slate-300 font-extrabold">
                    Monthly Grand Total:
                  </td>
                  <td className="py-3 px-4 text-right text-slate-900 dark:text-white">
                    {formatINR(totalBaseEarnings)}
                  </td>
                  <td className="py-3 px-4 text-right text-amber-600 dark:text-amber-400">
                    {formatINR(totalOtEarnings)}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-base">
                    {formatINR(totalGrossEarnings)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
