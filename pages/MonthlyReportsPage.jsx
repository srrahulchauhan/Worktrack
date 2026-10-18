import React, { useState, useMemo } from 'react';
import {
  FileBarChart2,
  Calendar,
  Building2,
  Download,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useWorkTrack } from '../context/WorkTrackContext';
import { formatINR, formatDate } from '../utils/workTrackCalculations';
import dayjs from 'dayjs';

export function MonthlyReportsPage() {
  const {
    attendance,
    companies,
    activeCompany,
    activeCompanyId,
    setActiveCompanyId,
    payments,
    downloadExcel,
  } = useWorkTrack();

  const [selectedMonth, setSelectedMonth] = useState(() => dayjs().format('YYYY-MM'));

  // Company selected
  const company = activeCompany || companies[0];

  // Records for this month and company
  const filteredAttendance = useMemo(() => {
    return attendance.filter((a) => {
      const matchComp = !activeCompanyId || a.companyId === activeCompanyId;
      const matchMonth = a.date.startsWith(selectedMonth);
      return matchComp && matchMonth;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [attendance, activeCompanyId, selectedMonth]);

  // Aggregate metrics
  const presentDays = filteredAttendance.filter((a) => a.status === 'Present').length;
  const absentDays = filteredAttendance.filter((a) => a.status === 'Absent').length;
  const halfDays = filteredAttendance.filter((a) => a.status === 'Half Day').length;
  const paidLeaves = filteredAttendance.filter((a) => a.status === 'Paid Leave').length;
  const unpaidLeaves = filteredAttendance.filter((a) => a.status === 'Unpaid Leave').length;
  const holidays = filteredAttendance.filter((a) => a.status === 'Holiday').length;
  const weeklyOffs = filteredAttendance.filter((a) => a.status === 'Weekly Off').length;

  const totalWorkingHours = filteredAttendance.reduce(
    (s, a) => s + (Number(a.totalWorkingHours) || 0),
    0
  );
  const totalOvertimeHours = filteredAttendance.reduce(
    (s, a) => s + (Number(a.overtimeHours) || 0),
    0
  );

  const baseEarnings = filteredAttendance.reduce(
    (s, a) => s + (Number(a.dailySalary) || 0),
    0
  );
  const overtimeEarnings = filteredAttendance.reduce(
    (s, a) => s + (Number(a.overtimeEarnings) || 0),
    0
  );
  const totalExpectedEarnings = baseEarnings + overtimeEarnings;

  // Payments for this month
  const monthPayment = payments.find(
    (p) => (!activeCompanyId || p.companyId === activeCompanyId) && p.salaryMonth === selectedMonth
  );

  const salaryReceived = monthPayment ? Number(monthPayment.amountReceived) || 0 : 0;
  const pendingSalary = Math.max(0, totalExpectedEarnings - salaryReceived);

  // Status breakdown for Pie Chart
  const pieData = [
    { name: 'Present', value: presentDays, color: '#16a34a' },
    { name: 'Absent', value: absentDays, color: '#dc2626' },
    { name: 'Half Day', value: halfDays, color: '#d97706' },
    { name: 'Paid Leave', value: paidLeaves, color: '#0d9488' },
    { name: 'Unpaid Leave', value: unpaidLeaves, color: '#64748b' },
    { name: 'Weekly Off', value: weeklyOffs, color: '#4f46e5' },
    { name: 'Holiday', value: holidays, color: '#9333ea' },
  ].filter((item) => item.value > 0);

  // Daily hours bar data (sampled over the month)
  const dailyHoursData = filteredAttendance.map((rec) => ({
    date: rec.date.slice(8), // day number
    hours: rec.totalWorkingHours,
    ot: rec.overtimeHours,
  }));

  // CSV Export handler
  const handleExportReportCSV = () => {
    const titleRows = [
      `My WorkTrack - Monthly Comprehensive Report`,
      `Company: ${company?.name || 'All Companies'}`,
      `Month: ${selectedMonth}`,
      `Generated On: ${new Date().toLocaleString()}`,
      '',
      `Summary Key Metrics:`,
      `Present Days,${presentDays}`,
      `Absent Days,${absentDays}`,
      `Half Days,${halfDays}`,
      `Weekly Offs,${weeklyOffs}`,
      `Paid Leaves,${paidLeaves}`,
      `Unpaid Leaves,${unpaidLeaves}`,
      `Holidays,${holidays}`,
      `Total Working Hours,${totalWorkingHours}h`,
      `Total Overtime Hours,${totalOvertimeHours}h`,
      `Base Salary Earned (INR),${baseEarnings}`,
      `Overtime Earned (INR),${overtimeEarnings}`,
      `Total Expected Earnings (INR),${totalExpectedEarnings}`,
      `Salary Received (INR),${salaryReceived}`,
      `Pending Salary (INR),${pendingSalary}`,
      '',
      `Itemized Daily Attendance & Salary Breakdown:`,
      `Date,Day,Status,Planned Shift,Actual Shift,Check-In,Check-Out,Hours,OT Hours,Daily Salary (INR),OT Earnings (INR),Total Daily Earnings (INR),Notes`,
    ];

    const dataRows = filteredAttendance.map((r) => [
      r.date,
      r.dayOfWeek,
      r.status,
      r.plannedShift || '',
      r.actualShift || '',
      r.checkIn || '',
      r.checkOut || '',
      r.totalWorkingHours || 0,
      r.overtimeHours || 0,
      r.dailySalary || 0,
      r.overtimeEarnings || 0,
      r.totalDailyEarnings || 0,
      `"${r.notes || ''}"`,
    ]);

    const csvContent = [...titleRows, ...dataRows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `WorkTrack-Report-${company?.name || 'Company'}-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Monthly Reports & Attendance Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete monthly audit of hours worked, attendance status counts, earnings, and payout status
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={downloadExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60 shadow-xs active:scale-95"
            title="Download complete Monthly Report in Excel (.xlsx)"
          >
            <FileSpreadsheet size={15} className="text-emerald-600 dark:text-emerald-400" />
            <span>Export Excel (.xlsx)</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition shadow-xs"
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportReportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition active:scale-95"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Report Month:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Company:</span>
            <select
              value={activeCompanyId}
              onChange={(e) => setActiveCompanyId(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white font-medium"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full">
          Report for {dayjs(selectedMonth + '-01').format('MMMM YYYY')}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40">
          <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">
            Present Days
          </span>
          <span className="text-2xl font-black text-emerald-800 dark:text-emerald-200 mt-1 block">
            {presentDays}
          </span>
          <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 block">
            + {halfDays} Half Days
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/40">
          <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300 block">
            Absent Days
          </span>
          <span className="text-2xl font-black text-rose-800 dark:text-rose-200 mt-1 block">
            {absentDays}
          </span>
          <span className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5 block">
            Unpaid absence
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/40">
          <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 block">
            Offs & Leaves
          </span>
          <span className="text-2xl font-black text-indigo-800 dark:text-indigo-200 mt-1 block">
            {weeklyOffs + paidLeaves + unpaidLeaves}
          </span>
          <span className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80 mt-0.5 block">
            {weeklyOffs} Offs, {paidLeaves} Paid
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/40">
          <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 block">
            Total Working Hours
          </span>
          <span className="text-2xl font-black text-blue-800 dark:text-blue-200 mt-1 block">
            {Math.round(totalWorkingHours)}h
          </span>
          <span className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-0.5 block">
            {totalOvertimeHours}h Overtime
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40">
          <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 block">
            Overtime Earned
          </span>
          <span className="text-2xl font-black text-amber-800 dark:text-amber-200 mt-1 block truncate">
            {formatINR(overtimeEarnings)}
          </span>
          <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5 block">
            1.5x Multiplier
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40">
          <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">
            Total Earnings
          </span>
          <span className="text-2xl font-black text-emerald-800 dark:text-emerald-200 mt-1 block truncate">
            {formatINR(totalExpectedEarnings)}
          </span>
          <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 block">
            Base: {formatINR(baseEarnings)}
          </span>
        </div>
      </div>

      {/* Executive Financial Salary Breakdown: Basic vs OT vs Total */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 text-white border border-white/10 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-base font-black tracking-tight text-white">
                Monthly Salary Summary
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Breakdown of Base Salary, Overtime Earnings, and Total Payout for {dayjs(selectedMonth + '-01').format('MMMM YYYY')}
            </p>
          </div>
          <span className="text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
            {company?.name || 'Active Company'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              1. Basic Salary
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {formatINR(baseEarnings)}
            </div>
            <span className="text-xs text-slate-400 block mt-0.5">
              {presentDays} Days Full + {halfDays} Half Days
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
              2. Overtime Salary
            </span>
            <div className="text-2xl font-black text-amber-300 mt-1">
              +{formatINR(overtimeEarnings)}
            </div>
            <span className="text-xs text-amber-400/90 block mt-0.5 font-medium">
              {totalOvertimeHours} hrs total OT @ ₹{company?.overtimeRate || 200}/hr
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">
              3. Total Salary
            </span>
            <div className="text-2xl font-black text-emerald-300 mt-1">
              {formatINR(totalExpectedEarnings)}
            </div>
            <span className="text-xs text-emerald-400/90 block mt-0.5 font-medium">
              Basic ({formatINR(baseEarnings)}) + OT (+{formatINR(overtimeEarnings)})
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Distribution Pie */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Status Breakdown Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">Percentage of days in {selectedMonth}</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} Days`, name]}
                  contentStyle={{ borderRadius: '10px' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Working Hours Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Daily Working Hours Progression
          </h3>
          <p className="text-xs text-slate-500 mb-4">Hours logged each calendar day this month</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '10px' }}
                  formatter={(val, name) => [`${val}h`, name === 'hours' ? 'Work Hours' : 'Overtime']}
                />
                <Bar dataKey="hours" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="ot" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Salary & Payout Reconciliation Card */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Monthly Financial Reconciliation
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Comparison between expected earned compensation and actual payout received
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-bold block">
              Total Expected Earnings
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
              {formatINR(totalExpectedEarnings)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 uppercase font-bold block">
              Disbursed / Received
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {formatINR(salaryReceived)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
            <span className="text-[11px] text-rose-700 dark:text-rose-300 uppercase font-bold block">
              Outstanding Balance (Pending)
            </span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
              {formatINR(pendingSalary)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
