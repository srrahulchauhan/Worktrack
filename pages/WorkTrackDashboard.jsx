import dayjs from "dayjs";
import {
  AlertCircle,
  Briefcase,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Percent,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SummaryCard } from "../components/common/SummaryCard";
import { useWorkTrack } from "../context/WorkTrackContext";
import {
  calculateEmploymentDuration,
  formatDate,
  formatINR,
} from "../utils/workTrackCalculations";

export function WorkTrackDashboard() {
  const [attendanceRange, setAttendanceRange] = useState("7d");

  const { companies, activeCompany, attendance, overtime, payments } =
    useWorkTrack();

  const { onOpenAddCompany, onOpenMarkAttendance, onOpenAddOvertime } =
    useOutletContext() || {};

  const navigate = useNavigate();

  // Selected or current month (YYYY-MM)
  const currentMonth = dayjs().format("YYYY-MM");

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
  const currentCompanyName = activeCompany
    ? activeCompany.name
    : "None Selected";

  const presentDays = currentMonthAttendance.filter(
    (a) => a.status === "Present",
  ).length;
  const halfDays = currentMonthAttendance.filter(
    (a) => a.status === "Half Day",
  ).length;
  const absentDays = currentMonthAttendance.filter(
    (a) => a.status === "Absent",
  ).length;
  const leaveDays = currentMonthAttendance.filter(
    (a) => a.status === "Paid Leave" || a.status === "Unpaid Leave",
  ).length;
  const weeklyOffDays = currentMonthAttendance.filter(
    (a) => a.status === "Weekly Off",
  ).length;

  // Actual working days count (Present + 0.5 * Half Day)
  const totalWorkingDays = presentDays + halfDays * 0.5;

  // Attendance percentage (out of scheduled working days or days elapsed)
  const scheduledDays = activeCompany?.scheduledWorkingDays || 26;
  const attendancePercentage =
    scheduledDays > 0
      ? Math.min(100, Math.round((presentDays / scheduledDays) * 100))
      : 0;

  // Overtime hours & earnings this month
  const totalOvertimeHours = currentMonthAttendance.reduce(
    (sum, a) => sum + (Number(a.overtimeHours) || 0),
    0,
  );

  const overtimeEarnings = currentMonthAttendance.reduce(
    (sum, a) => sum + (Number(a.overtimeEarnings) || 0),
    0,
  );

  const baseSalaryEarned = currentMonthAttendance.reduce(
    (sum, a) => sum + (Number(a.dailySalary) || 0),
    0,
  );

  const estimatedSalary = activeCompany
    ? activeCompany.monthlySalary
    : baseSalaryEarned;
  const totalEarnings = baseSalaryEarned + overtimeEarnings;

  // Payments calculations
  const companyPayments = payments.filter(
    (p) => !activeCompany || p.companyId === activeCompany.id,
  );
  const salaryReceived = companyPayments.reduce(
    (sum, p) => sum + (Number(p.amountReceived) || 0),
    0,
  );
  const netExpectedAll = companyPayments.reduce(
    (sum, p) => sum + (Number(p.netExpectedSalary) || 0),
    0,
  );
  const pendingSalary = Math.max(0, netExpectedAll - salaryReceived);

  // Tenure of current company
  const currentTenure = activeCompany
    ? calculateEmploymentDuration(
        activeCompany.joiningDate,
        activeCompany.leavingDate,
      )
    : { formatted: "N/A", range: "N/A" };

  // Recent attendance records (latest 6)
  const recentAttendance = useMemo(() => {
    return [...attendance]
      .filter((a) => !activeCompany || a.companyId === activeCompany.id)
      .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
      .slice(0, 6);
  }, [attendance, activeCompany]);

  const dailyChartData = useMemo(() => {
    const today = dayjs();
    const start =
      attendanceRange === "month"
        ? today.startOf("month")
        : today.subtract(attendanceRange === "7d" ? 6 : 29, "day");
    const days = [];

    for (
      let date = start;
      !date.isAfter(today, "day");
      date = date.add(1, "day")
    ) {
      const dateKey = date.format("YYYY-MM-DD");
      const records = attendance.filter((record) => {
        const matchesCompany =
          !activeCompany || record.companyId === activeCompany.id;
        return matchesCompany && record.date === dateKey;
      });
      const present = records.filter(
        (record) => record.status === "Present",
      ).length;
      const absent = records.filter(
        (record) => record.status === "Absent",
      ).length;
      const halfDay = records.filter(
        (record) => record.status === "Half Day",
      ).length;
      const scheduled = present + absent + halfDay;

      days.push({
        date: date.format("DD MMM"),
        day: date.format("ddd"),
        Present: present + halfDay * 0.5,
        Absent: absent,
        Rate: scheduled
          ? Math.round(((present + halfDay * 0.5) / scheduled) * 100)
          : 0,
      });
    }

    return days;
  }, [attendanceRange, attendance, activeCompany]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Welcome Command Center */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#06234d] via-[#07346e] to-[#082752] text-white p-5 sm:p-6 shadow-lg border border-blue-900/20">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-xs">
                <Sparkles size={13} className="text-cyan-400" />
                <span>Career & Attendance Hub</span>
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-slate-300 border border-white/10">
                {dayjs().format("MMMM YYYY")}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black mt-3">
              Welcome to My WorkTrack
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              Track attendance, shifts, daily wage breakdown, overtime hours,
              and salary disbursements for{" "}
              <span className="text-white font-extrabold underline decoration-cyan-400 decoration-2">
                {currentCompanyName}
              </span>
              .
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          title="Current Company"
          value={activeCompany?.name || "No Company"}
          subtitle={`${currentTenure.formatted} (${currentTenure.range})`}
          icon={Building2}
          variant="blue"
          onClick={() => navigate("/worktrack/companies")}
        />

        <SummaryCard
          title="Total Companies"
          value={totalCompaniesCount}
          subtitle="Saved in history"
          icon={Briefcase}
          variant="slate"
          onClick={() => navigate("/worktrack/companies")}
        />

        <SummaryCard
          title="Present Days"
          value={`${presentDays} Days`}
          subtitle={`${attendancePercentage}% of scheduled`}
          icon={CheckCircle2}
          variant="green"
          onClick={() => navigate("/worktrack/attendance")}
        />

        <SummaryCard
          title="Absent Days"
          value={`${absentDays} Days`}
          subtitle={absentDays > 0 ? "Deduction applied" : "Zero absence"}
          icon={XCircle}
          variant="red"
          onClick={() => navigate("/worktrack/attendance")}
        />

        <SummaryCard
          title="Total Working Days"
          value={`${totalWorkingDays} Days`}
          subtitle={`Present + Half-days`}
          icon={CalendarCheck}
          variant="blue"
          onClick={() => navigate("/worktrack/attendance")}
        />

        <SummaryCard
          title="Total Overtime"
          value={`${totalOvertimeHours} Hours`}
          subtitle={`Earned: ${formatINR(overtimeEarnings)}`}
          icon={Clock}
          variant="amber"
          onClick={() => navigate("/worktrack/overtime")}
        />

        <SummaryCard
          title="Overtime Earnings"
          value={formatINR(overtimeEarnings)}
          subtitle="This month"
          icon={TrendingUp}
          variant="amber"
          onClick={() => navigate("/worktrack/overtime")}
        />

        <SummaryCard
          title="Estimated Base Salary"
          value={formatINR(estimatedSalary)}
          subtitle={
            activeCompany
              ? `Rate: ${formatINR(activeCompany.dailySalaryRate)}/day`
              : "N/A"
          }
          icon={DollarSign}
          variant="indigo"
          onClick={() => navigate("/worktrack/salary")}
        />

        <SummaryCard
          title="Total Earnings (Gross)"
          value={formatINR(totalEarnings)}
          subtitle={`Base + OT (${dayjs().format("MMMM")})`}
          icon={TrendingUp}
          variant="green"
          onClick={() => navigate("/worktrack/salary")}
        />

        <SummaryCard
          title="Salary Received"
          value={formatINR(salaryReceived)}
          subtitle="Total credited"
          icon={CreditCard}
          variant="blue"
          onClick={() => navigate("/worktrack/payments")}
        />

        <SummaryCard
          title="Pending Salary"
          value={formatINR(pendingSalary)}
          subtitle={pendingSalary > 0 ? "Due for credit" : "All cleared"}
          icon={AlertCircle}
          variant={pendingSalary > 0 ? "amber" : "green"}
          onClick={() => navigate("/worktrack/payments")}
        />

        <SummaryCard
          title="Attendance Rate"
          value={`${attendancePercentage}%`}
          subtitle={`Target: 100%`}
          icon={Percent}
          variant="indigo"
        />
      </div>

      {/* Attendance trend and recent activity */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
        <section className="xl:col-span-3 min-w-0 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Attendance Trend
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Present and absent days
              </p>
            </div>
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5">
              {[
                ["7d", "7 Days"],
                ["30d", "30 Days"],
                ["month", "This Month"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setAttendanceRange(value)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${attendanceRange === value ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_88px] gap-3 items-center">
            <div className="h-40 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={dailyChartData}
                  margin={{ top: 8, right: 4, left: -25, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#dbeafe"
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 9 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    yAxisId="days"
                    domain={[0, 2]}
                    ticks={[0, 1, 2]}
                    tick={{ fontSize: 9 }}
                  />
                  <YAxis
                    yAxisId="rate"
                    orientation="right"
                    domain={[0, 100]}
                    hide
                  />
                  <Tooltip
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.date || ""
                    }
                  />
                  <Bar
                    yAxisId="days"
                    dataKey="Present"
                    fill="#10b981"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={22}
                  />
                  <Bar
                    yAxisId="days"
                    dataKey="Absent"
                    fill="#fb7185"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={22}
                  />
                  <Line
                    yAxisId="rate"
                    type="monotone"
                    dataKey="Rate"
                    stroke="#1685f8"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-3">
              <div
                className="w-16 h-16 rounded-full grid place-items-center"
                style={{
                  background: `conic-gradient(#10b981 ${attendancePercentage}%, #e2e8f0 0)`,
                }}
              >
                <div className="w-[54px] h-[54px] rounded-full bg-white dark:bg-dark-900 grid place-items-center">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {attendancePercentage}%
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-center text-slate-500 dark:text-slate-400">
                Attendance
                <br />
                Rate
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <i className="w-2 h-2 rounded-full bg-emerald-500" />
              Present
            </span>
            <span className="flex items-center gap-1">
              <i className="w-2 h-2 rounded-full bg-rose-400" />
              Absent
            </span>
            <span className="flex items-center gap-1">
              <i className="w-3 h-0.5 bg-blue-500" />
              Attendance %
            </span>
          </div>
        </section>

        <section className="xl:col-span-2 min-w-0 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Recent Attendance Activity
            </h3>
            <button
              onClick={() => navigate("/worktrack/attendance")}
              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentAttendance.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                No recent attendance records.
              </p>
            ) : (
              recentAttendance.map((rec) => {
                const isAbsent = rec.status === "Absent";
                return (
                  <div key={rec.id} className="flex items-center gap-2.5 py-2">
                    <span
                      className={`w-6 h-6 rounded-full grid place-items-center shrink-0 ${isAbsent ? "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300"}`}
                    >
                      {isAbsent ? (
                        <XCircle size={14} />
                      ) : (
                        <CheckCircle2 size={14} />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">
                        {formatDate(rec.date, "DD MMM YYYY")} ·{" "}
                        {rec.actualShift || rec.plannedShift || "Attendance"}
                      </p>
                      <p className="text-[9px] text-slate-500">
                        Marked {rec.status}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isAbsent ? "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"}`}
                    >
                      {rec.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
