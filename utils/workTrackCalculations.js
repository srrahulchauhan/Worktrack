import dayjs from 'dayjs';

/**
 * Format currency in Indian Rupees (₹)
 * @param {number|string} amount
 * @param {boolean} includeDecimals
 * @returns {string}
 */
export function formatINR(amount, includeDecimals = false) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  }).format(num);
}

/**
 * Format date nicely (e.g., "12 Oct 2026" or "Oct 2026")
 */
export function formatDate(dateStr, format = 'DD MMM YYYY') {
  if (!dateStr) return '—';
  return dayjs(dateStr).format(format);
}

/**
 * Calculate employment duration between two dates
 * If leavingDate is empty, calculates up to today
 */
export function calculateEmploymentDuration(joiningDate, leavingDate) {
  if (!joiningDate) return 'N/A';
  const start = dayjs(joiningDate);
  const end = leavingDate ? dayjs(leavingDate) : dayjs();

  if (!start.isValid()) return 'N/A';
  if (end.isBefore(start)) return 'Invalid date range';

  const totalMonths = end.diff(start, 'month');
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const days = end.diff(start.add(years, 'year').add(months, 'month'), 'day');

  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mo' : 'mos'}`);
  if (parts.length === 0 || (years === 0 && months === 0)) {
    parts.push(`${Math.max(1, days)} ${days === 1 ? 'day' : 'days'}`);
  }

  const durationStr = parts.join(' ');
  const rangeStr = `${start.format('MMM YYYY')} – ${leavingDate ? dayjs(leavingDate).format('MMM YYYY') : 'Present'}`;

  return {
    formatted: durationStr,
    range: rangeStr,
    totalMonths,
    isCurrent: !leavingDate,
  };
}

/**
 * Calculate working hours accurately, accounting for overnight checkout (e.g. 20:00 to 05:00)
 * @param {string} checkIn 'HH:mm'
 * @param {string} checkOut 'HH:mm'
 * @param {number} breakMinutes break time in minutes
 * @returns {{ grossHours: number, netHours: number, isOvernight: boolean }}
 */
export function calculateWorkingHours(checkIn, checkOut, breakMinutes = 0) {
  if (!checkIn || !checkOut) {
    return { grossHours: 0, netHours: 0, isOvernight: false };
  }

  const [inH, inM] = checkIn.split(':').map(Number);
  const [outH, outM] = checkOut.split(':').map(Number);

  if (isNaN(inH) || isNaN(inM) || isNaN(outH) || isNaN(outM)) {
    return { grossHours: 0, netHours: 0, isOvernight: false };
  }

  let inMinutes = inH * 60 + inM;
  let outMinutes = outH * 60 + outM;
  let isOvernight = false;

  if (outMinutes < inMinutes) {
    // Checkout happened on the next day!
    outMinutes += 24 * 60;
    isOvernight = true;
  }

  const grossMinutes = Math.max(0, outMinutes - inMinutes);
  const breakMins = Math.max(0, Number(breakMinutes) || 0);
  const netMinutes = Math.max(0, grossMinutes - breakMins);

  const grossHours = Math.round((grossMinutes / 60) * 100) / 100;
  const netHours = Math.round((netMinutes / 60) * 100) / 100;

  return { grossHours, netHours, isOvernight };
}

/**
 * Calculate daily salary rate based on method
 * 1. monthly_divided_by_scheduled: Monthly Salary / Scheduled Working Days
 * 2. monthly_divided_by_calendar: Monthly Salary / Total Calendar Days in Month
 * 3. custom: User specified rate
 */
export function calculateDailySalaryRate({
  monthlySalary = 0,
  scheduledWorkingDays = 26,
  date = new Date(),
  method = 'monthly_divided_by_scheduled',
  customRate = 0,
}) {
  const salary = Number(monthlySalary) || 0;
  const scheduledDays = Number(scheduledWorkingDays) || 26;

  if (method === 'custom') {
    return Math.round(Number(customRate) || 0);
  }

  if (method === 'monthly_divided_by_calendar') {
    const calendarDays = dayjs(date).daysInMonth() || 30;
    return Math.round(salary / calendarDays);
  }

  // Default: monthly_divided_by_scheduled
  return scheduledDays > 0 ? Math.round(salary / scheduledDays) : 0;
}

/**
 * Calculate base earnings for an attendance record based on status and policies
 */
export function calculateAttendanceDailyEarnings({
  status,
  dailyRate,
  settings = {},
}) {
  const rate = Number(dailyRate) || 0;
  const paidLeavePercent = Number(settings.paidLeavePayPercent ?? 100);
  const weeklyOffPercent = Number(settings.weeklyOffPayPercent ?? 100);
  const holidayPercent = Number(settings.holidayPayPercent ?? 100);
  const halfDayPercent = Number(settings.halfDayPayPercent ?? 50);

  switch (status) {
    case 'Present':
      return rate;
    case 'Half Day':
      return Math.round((rate * halfDayPercent) / 100);
    case 'Paid Leave':
      return Math.round((rate * paidLeavePercent) / 100);
    case 'Weekly Off':
      return Math.round((rate * weeklyOffPercent) / 100);
    case 'Holiday':
      return Math.round((rate * holidayPercent) / 100);
    case 'Absent':
    case 'Unpaid Leave':
    default:
      return 0;
  }
}

/**
 * Calculate overtime amount
 */
export function calculateOvertimeAmount(hours, rate, multiplier = 1) {
  const h = Math.max(0, Number(hours) || 0);
  const r = Math.max(0, Number(rate) || 0);
  const m = Math.max(0.5, Number(multiplier) || 1);
  return Math.round(h * r * m);
}
