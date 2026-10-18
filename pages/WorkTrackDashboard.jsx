import React, { useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Building2,
  CalendarCheck,
  Clock,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Plus,
  Briefcase,
  CheckCircle2,
  XCircle,
  Percent,
  Calendar,
  CreditCard,
  ArrowUpRight,
  FileSpreadsheet,
  Cloud,
  Download,
  Save,
  ExternalLink,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useWorkTrack } from '../context/WorkTrackContext';
import { SummaryCard } from '../components/common/SummaryCard';
import { AttendanceBadge } from '../components/common/Badge';
import {
  formatINR,
  formatDate,
  calculateEmploymentDuration,
} from '../utils/workTrackCalculations';
import dayjs from 'dayjs';

export function WorkTrackDashboard() {
  const {
    companies,
    activeCompany,
    attendance,
    overtime,
    payments,
    downloadExcel,
    syncNow,
    syncConfig,
    manualSaveData,
    downloadBackupJSON,
  } = useWorkTrack();

  const {
    onOpenAddCompany,
    onOpenMarkAttendance,
    onOpenAddOvertime,
    onOpenSaveSync,
  } = useOutletContext() || {};

  const navigate = useNavigate();

  // Selected or current month (YYYY-MM)
  const currentMonth = dayjs().format('YYYY-MM');

  // Filter attendance for the current active company & month
  const currentMonthAttendance = useMemo(() => {
    return attendance.filter((a) => {
      const matchComp = !activeCompany || a.companyId === activeCompany.id;
      const matchMonth = a.date.startsWith(currentMonth);
      return matchComp && matchMonth;
    });
  }, [attendance, activeCompany, currentMonth]);

  // Calculations for Summary Cards
  const totalCompaniesCount = companies.length;
  const currentCompanyName = activeCompany ? activeCompany.name : 'None Selected';

  const presentDays = currentMonthAttendance.filter((a) => a.status === 'Present').length;
  const halfDays = currentMonthAttendance.filter((a) => a.status === 'Half Day').length;
  const absentDays = currentMonthAttendance.filter((a) => a.status === 'Absent').length;
  const leaveDays = currentMonthAttendance.filter(
    (a) => a.status === 'Paid Leave' || a.status === 'Unpaid Leave'
  ).length;
  const weeklyOffDays = currentMonthAttendance.filter((a) => a.status === 'Weekly Off').length;

  // Actual working days count (Present + 0.5 * Half Day)
  const totalWorkingDays = presentDays + halfDays * 0.5;

  // Attendance percentage (out of scheduled working days or days elapsed)
  const scheduledDays = activeCompany?.scheduledWorkingDays || 26;
  const attendancePercentage = scheduledDays > 0
    ? Math.min(100, Math.round((presentDays / scheduledDays) * 100))
    : 0;

  // Overtime hours & earnings this month
  const totalOvertimeHours = currentMonthAttendance.reduce(
    (sum, a) => sum + (Number(a.overtimeHours) || 0),
    0
  );

  const overtimeEarnings = currentMonthAttendance.reduce(
    (sum, a) => sum + (Number(a.overtimeEarnings) || 0),
    0
  );

  const baseSalaryEarned = currentMonthAttendance.reduce(
    (sum, a) => sum + (Number(a.dailySalary) || 0),
    0
  );

  const estimatedSalary = activeCompany ? activeCompany.monthlySalary : baseSalaryEarned;
  const totalEarnings = baseSalaryEarned + overtimeEarnings;

  // Payments calculations
  const companyPayments = payments.filter(
    (p) => !activeCompany || p.companyId === activeCompany.id
  );
  const salaryReceived = companyPayments.reduce(
    (sum, p) => sum + (Number(p.amountReceived) || 0),
    0
  );
  const netExpectedAll = companyPayments.reduce(
    (sum, p) => sum + (Number(p.netExpectedSalary) || 0),
    0
  );
  const pendingSalary = Math.max(0, netExpectedAll - salaryReceived);

  // Tenure of current company
  const currentTenure = activeCompany
    ? calculateEmploymentDuration(activeCompany.joiningDate, activeCompany.leavingDate)
    : { formatted: 'N/A', range: 'N/A' };

  // Recent attendance records (latest 6)
  const recentAttendance = useMemo(() => {
    return [...attendance]
      .filter((a) => !activeCompany || a.companyId === activeCompany.id)
      .slice(0, 6);
  }, [attendance, activeCompany]);

  // Monthly Attendance Chart Data (past 6 months)
  const monthlyChartData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const m = dayjs().subtract(i, 'month');
      const mStr = m.format('YYYY-MM');
      const label = m.format('MMM');

      const mRecords = attendance.filter((a) => {
        const compMatch = !activeCompany || a.companyId === activeCompany.id;
        return compMatch && a.date.startsWith(mStr);
      });

      const pCount = mRecords.filter((a) => a.status === 'Present').length;
      const aCount = mRecords.filter((a) => a.status === 'Absent').length;
      const hCount = mRecords.filter((a) => a.status === 'Half Day').length;
      const baseEarn = mRecords.reduce((s, r) => s + (r.dailySalary || 0), 0);
      const otEarn = mRecords.reduce((s, r) => s + (r.overtimeEarnings || 0), 0);

      months.push({
        month: label,
        Present: pCount,
        Absent: aCount,
        HalfDay: hCount,
        BaseSalary: baseEarn,
        Overtime: otEarn,
        TotalEarnings: baseEarn + otEarn,
      });
    }
    return months;
  }, [attendance, activeCompany]);

  // Attendance Status Distribution for Pie Chart
  const statusDistribution = useMemo(() => {
    return [
      { name: 'Present', value: presentDays, color: '#16a34a' },
      { name: 'Absent', value: absentDays, color: '#dc2626' },
      { name: 'Half Day', value: halfDays, color: '#d97706' },
      { name: 'Leaves', value: leaveDays, color: '#0d9488' },
      { name: 'Weekly Off', value: weeklyOffDays, color: '#4f46e5' },
    ].filter((item) => item.value > 0);
  }, [presentDays, absentDays, halfDays, leaveDays, weeklyOffDays]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome Command Center */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-2xl border border-white/10">
        {/* Subtle decorative glow orbs */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-xs">
                <Sparkles size={13} className="text-cyan-400" />
                <span>Career & Attendance Hub</span>
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-slate-300 border border-white/10">
                {dayjs().format('MMMM YYYY')}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mt-3 tracking-tight">
              Welcome to My WorkTrack
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              Track attendance, shifts, daily wage breakdown, overtime hours, and salary disbursements for{' '}
              <span className="text-white font-extrabold underline decoration-cyan-400 decoration-2">
                {currentCompanyName}
              </span>.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenMarkAttendance}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition active:scale-95"
            >
              <CalendarCheck size={16} />
              <span>Mark Attendance</span>
            </button>
            <button
              onClick={onOpenAddOvertime}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25 transition active:scale-95"
            >
              <Clock size={16} />
              <span>Add Overtime</span>
            </button>
            <button
              onClick={onOpenAddCompany}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition active:scale-95"
            >
              <Building2 size={16} />
              <span>Add Company</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard
          title="Current Company"
          value={activeCompany?.name || 'No Company'}
          subtitle={`${currentTenure.formatted} (${currentTenure.range})`}
          icon={Building2}
          variant="blue"
          onClick={() => navigate('/worktrack/companies')}
        />

        <SummaryCard
          title="Total Companies"
          value={totalCompaniesCount}
          subtitle="Saved in history"
          icon={Briefcase}
          variant="slate"
          onClick={() => navigate('/worktrack/companies')}
        />

        <SummaryCard
          title="Present Days"
          value={`${presentDays} Days`}
          subtitle={`${attendancePercentage}% of scheduled`}
          icon={CheckCircle2}
          variant="green"
          onClick={() => navigate('/worktrack/attendance')}
        />

        <SummaryCard
          title="Absent Days"
          value={`${absentDays} Days`}
          subtitle={absentDays > 0 ? 'Deduction applied' : 'Zero absence'}
          icon={XCircle}
          variant="red"
          onClick={() => navigate('/worktrack/attendance')}
        />

        <SummaryCard
          title="Total Working Days"
          value={`${totalWorkingDays} Days`}
          subtitle={`Present + Half-days`}
          icon={CalendarCheck}
          variant="blue"
          onClick={() => navigate('/worktrack/attendance')}
        />

        <SummaryCard
          title="Total Overtime"
          value={`${totalOvertimeHours} Hours`}
          subtitle={`Earned: ${formatINR(overtimeEarnings)}`}
          icon={Clock}
          variant="amber"
          onClick={() => navigate('/worktrack/overtime')}
        />

        <SummaryCard
          title="Overtime Earnings"
          value={formatINR(overtimeEarnings)}
          subtitle="This month"
          icon={TrendingUp}
          variant="amber"
          onClick={() => navigate('/worktrack/overtime')}
        />

        <SummaryCard
          title="Estimated Base Salary"
          value={formatINR(estimatedSalary)}
          subtitle={activeCompany ? `Rate: ${formatINR(activeCompany.dailySalaryRate)}/day` : 'N/A'}
          icon={DollarSign}
          variant="indigo"
          onClick={() => navigate('/worktrack/salary')}
        />

        <SummaryCard
          title="Total Earnings (Gross)"
          value={formatINR(totalEarnings)}
          subtitle={`Base + OT (${dayjs().format('MMMM')})`}
          icon={TrendingUp}
          variant="green"
          onClick={() => navigate('/worktrack/salary')}
        />

        <SummaryCard
          title="Salary Received"
          value={formatINR(salaryReceived)}
          subtitle="Total credited"
          icon={CreditCard}
          variant="blue"
          onClick={() => navigate('/worktrack/payments')}
        />

        <SummaryCard
          title="Pending Salary"
          value={formatINR(pendingSalary)}
          subtitle={pendingSalary > 0 ? 'Due for credit' : 'All cleared'}
          icon={AlertCircle}
          variant={pendingSalary > 0 ? 'amber' : 'green'}
          onClick={() => navigate('/worktrack/payments')}
        />

        <SummaryCard
          title="Attendance Rate"
          value={`${attendancePercentage}%`}
          subtitle={`Target: 100%`}
          icon={Percent}
          variant="indigo"
        />
      </div>

      {/* Charts Section: Monthly Attendance & Monthly Earnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends Bar Chart */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Attendance Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Present days, Absent days, and Half-days over past 6 months
              </p>
            </div>
            <button
              onClick={() => navigate('/worktrack/attendance')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View Attendance</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="Present" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Absent" fill="#dc2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="HalfDay" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Earnings Trend Chart */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Earnings Overview
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Base salary + Overtime earnings trends in ₹
              </p>
            </div>
            <button
              onClick={() => navigate('/worktrack/salary')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Salary Calculator</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [formatINR(val), 'Earnings']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="TotalEarnings"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Current Month Salary Summary + Recent Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Month Salary Breakdown Card */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Current Month Salary
              </h3>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                {dayjs().format('MMMM YYYY')}
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Base Salary Earned</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatINR(baseSalaryEarned)}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Overtime Earnings ({totalOvertimeHours}h)</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{formatINR(overtimeEarnings)}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Gross Total Expected</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400">{formatINR(totalEarnings)}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Payment Due Date</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {activeCompany?.salaryPaymentDate || '5'}th of next month
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/worktrack/salary')}
            className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold text-center bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 transition"
          >
            Open Salary Calculator →
          </button>
        </div>

        {/* Recent Attendance Table */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent Daily Attendance
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Latest recorded shifts and working hours
                </p>
              </div>
              <button
                onClick={() => navigate('/worktrack/attendance')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View Full Calendar</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Shift</th>
                    <th className="py-2.5 px-3 text-center">Hours</th>
                    <th className="py-2.5 px-3 text-right">Daily Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {recentAttendance.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-slate-400">
                        No recent attendance records found.
                      </td>
                    </tr>
                  ) : (
                    recentAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/60 dark:hover:bg-dark-950/40">
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {formatDate(rec.date, 'DD MMM')}
                          </span>
                          <span className="text-[10px] text-slate-400 block">{rec.dayOfWeek}</span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <AttendanceBadge status={rec.status} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                          {rec.actualShift || rec.plannedShift}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap font-semibold text-slate-800 dark:text-slate-200">
                          {rec.totalWorkingHours}h
                          {rec.overtimeHours > 0 && (
                            <span className="text-[10px] text-amber-500 block">+{rec.overtimeHours}h OT</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-slate-900 dark:text-white">
                          {formatINR(rec.totalDailyEarnings)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Showing latest {recentAttendance.length} records</span>
            <button
              onClick={() => navigate('/worktrack/attendance')}
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              All Records →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
