import dayjs from 'dayjs';

export const INITIAL_SETTINGS = {
  calculationMethod: 'monthly_divided_by_scheduled', // 'monthly_divided_by_scheduled' | 'monthly_divided_by_calendar' | 'custom'
  paidLeavePayPercent: 100,
  weeklyOffPayPercent: 100,
  holidayPayPercent: 100,
  halfDayPayPercent: 50,
  defaultOvertimeMultiplier: 1.5,
  defaultStandardHours: 8,
  currencySymbol: '₹',
  theme: 'system', // 'light' | 'dark' | 'system'
};

export const INITIAL_COMPANIES = [
  {
    id: 'comp_1',
    name: 'Apex Infotech Solutions',
    role: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'Bengaluru / Hybrid',
    joiningDate: '2024-03-01',
    leavingDate: '', // Current company
    monthlySalary: 75000,
    scheduledWorkingDays: 26,
    standardWorkingHours: 8,
    dailySalaryRate: 2885, // 75000 / 26
    overtimeRate: 360, // per hour
    salaryPaymentDate: '5', // 5th of every month
    status: 'Current',
    notes: 'Primary full-time tech role. Performance appraisal in March.',
    createdAt: '2024-03-01T09:00:00.000Z',
  },
  {
    id: 'comp_2',
    name: 'Zenith Global Systems',
    role: 'Full Stack Developer',
    department: 'Product Development',
    location: 'Pune / On-site',
    joiningDate: '2022-06-15',
    leavingDate: '2024-02-28',
    monthlySalary: 52000,
    scheduledWorkingDays: 24,
    standardWorkingHours: 9,
    dailySalaryRate: 2167,
    overtimeRate: 240,
    salaryPaymentDate: '1',
    status: 'Left',
    notes: 'Completed 1 year 8 months tenure. Relieving letter & PF settled.',
    createdAt: '2022-06-15T09:00:00.000Z',
  },
];

export const INITIAL_SHIFTS = {
  dayShift: {
    id: 'shift_day',
    name: 'Day Shift',
    startTime: '09:00',
    endTime: '18:00',
    breakMinutes: 60,
    standardHours: 8,
    color: '#3b82f6',
  },
  nightShift: {
    id: 'shift_night',
    name: 'Night Shift',
    startTime: '20:00',
    endTime: '05:00', // Overnight
    breakMinutes: 60,
    standardHours: 8,
    color: '#6366f1',
  },
  rotationalSchedule: {
    Monday: 'Day Shift',
    Tuesday: 'Day Shift',
    Wednesday: 'Night Shift',
    Thursday: 'Night Shift',
    Friday: 'Day Shift',
    Saturday: 'Day Shift',
    Sunday: 'Weekly Off',
  },
};

/**
 * Generate rich attendance records for the past 28-30 days up to today
 */
export function generateDemoAttendance(companyId = 'comp_1') {
  const records = [];
  const today = dayjs();
  const daysInCurrentMonth = today.date();

  // Generate records for the current month so far, plus previous month end
  const startDate = today.subtract(Math.min(25, daysInCurrentMonth + 5), 'day');

  let currentDate = startDate;
  let counter = 1;

  while (currentDate.isBefore(today) || currentDate.isSame(today, 'day')) {
    const dateStr = currentDate.format('YYYY-MM-DD');
    const dayName = currentDate.format('dddd');
    const isSunday = dayName === 'Sunday';
    const isSaturday = dayName === 'Saturday';

    let status = 'Present';
    let checkIn = '09:00';
    let checkOut = '18:00';
    let breakDuration = 60;
    let plannedShift = 'Day Shift';
    let actualShift = 'Day Shift';
    let notes = 'Regular working day';
    let overtimeHours = 0;

    if (isSunday) {
      status = 'Weekly Off';
      checkIn = '';
      checkOut = '';
      breakDuration = 0;
      notes = 'Scheduled Weekly Off';
    } else if (counter === 7) {
      status = 'Paid Leave';
      checkIn = '';
      checkOut = '';
      breakDuration = 0;
      notes = 'Planned personal leave approved';
    } else if (counter === 14) {
      status = 'Half Day';
      checkIn = '09:00';
      checkOut = '13:30';
      breakDuration = 30;
      notes = 'Doctor appointment in the afternoon';
    } else if (counter === 19) {
      status = 'Absent';
      checkIn = '';
      checkOut = '';
      breakDuration = 0;
      notes = 'Unplanned absence (fever)';
    } else if (counter % 5 === 0) {
      // Overtime day
      checkIn = '09:00';
      checkOut = '20:30'; // 11.5 gross hrs - 1 hr break = 10.5 hrs => 2.5 hrs OT
      breakDuration = 60;
      overtimeHours = 2.5;
      notes = 'Release sprint deployment overtime';
    } else if (counter % 6 === 0) {
      // Night shift day demo
      plannedShift = 'Night Shift';
      actualShift = 'Night Shift';
      checkIn = '20:00';
      checkOut = '05:30'; // Overnight: 9.5 gross - 1 break = 8.5 net => 0.5 OT
      breakDuration = 60;
      overtimeHours = 0.5;
      notes = 'Client patch release monitoring (overnight)';
    }

    let totalWorkingHours = 0;
    if (checkIn && checkOut) {
      const [inH, inM] = checkIn.split(':').map(Number);
      let [outH, outM] = checkOut.split(':').map(Number);
      if (outH < inH) outH += 24; // overnight
      const grossMins = outH * 60 + outM - (inH * 60 + inM);
      totalWorkingHours = Math.round(((grossMins - breakDuration) / 60) * 100) / 100;
    }

    // Daily rate for Apex is 2885
    let dailySalary = 0;
    if (status === 'Present') dailySalary = 2885;
    else if (status === 'Half Day') dailySalary = 1443;
    else if (status === 'Paid Leave' || status === 'Weekly Off') dailySalary = 2885;
    else dailySalary = 0;

    const otRate = 360;
    const overtimeEarnings = Math.round(overtimeHours * otRate * 1.5);
    const totalDailyEarnings = dailySalary + overtimeEarnings;

    records.push({
      id: `att_${dateStr}`,
      date: dateStr,
      companyId: 'comp_1',
      companyName: 'Apex Infotech Solutions',
      dayOfWeek: dayName,
      status,
      plannedShift,
      actualShift,
      checkIn,
      checkOut,
      breakDuration,
      totalWorkingHours: Math.max(0, totalWorkingHours),
      overtimeHours,
      dailySalary,
      overtimeEarnings,
      totalDailyEarnings,
      notes,
    });

    currentDate = currentDate.add(1, 'day');
    counter++;
  }

  return records;
}

export const INITIAL_OVERTIME = [
  {
    id: 'ot_1',
    date: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
    companyId: 'comp_1',
    companyName: 'Apex Infotech Solutions',
    workingHours: 10.5,
    overtimeHours: 2.5,
    overtimeRate: 360,
    overtimeMultiplier: 1.5,
    overtimeAmount: 1350,
    notes: 'Sprint demo deployment support',
    source: 'attendance',
  },
  {
    id: 'ot_2',
    date: dayjs().subtract(11, 'day').format('YYYY-MM-DD'),
    companyId: 'comp_1',
    companyName: 'Apex Infotech Solutions',
    workingHours: 10,
    overtimeHours: 2,
    overtimeRate: 360,
    overtimeMultiplier: 1.5,
    overtimeAmount: 1080,
    notes: 'Urgent production hotfix',
    source: 'attendance',
  },
  {
    id: 'ot_3',
    date: dayjs().subtract(16, 'day').format('YYYY-MM-DD'),
    companyId: 'comp_1',
    companyName: 'Apex Infotech Solutions',
    workingHours: 11,
    overtimeHours: 3,
    overtimeRate: 360,
    overtimeMultiplier: 1.5,
    overtimeAmount: 1620,
    notes: 'Weekend critical database migration',
    source: 'manual',
  },
];

export const INITIAL_PAYMENTS = [
  {
    id: 'pay_1',
    companyId: 'comp_1',
    companyName: 'Apex Infotech Solutions',
    salaryMonth: dayjs().subtract(1, 'month').format('YYYY-MM'),
    expectedSalary: 75000,
    overtimeEarnings: 4050,
    bonuses: 2500,
    deductions: 200,
    netExpectedSalary: 81350,
    amountReceived: 81350,
    paymentDate: dayjs().subtract(1, 'month').date(5).format('YYYY-MM-DD'),
    paymentStatus: 'Paid',
    paymentMethod: 'Bank Transfer (NEFT)',
    notes: 'Full salary credited on scheduled date.',
    paymentHistory: [
      {
        id: 'ph_1',
        date: dayjs().subtract(1, 'month').date(5).format('YYYY-MM-DD'),
        amount: 81350,
        method: 'Bank Transfer (NEFT)',
        notes: 'Direct salary credit via corporate payroll',
      },
    ],
  },
  {
    id: 'pay_2',
    companyId: 'comp_1',
    companyName: 'Apex Infotech Solutions',
    salaryMonth: dayjs().format('YYYY-MM'),
    expectedSalary: 75000,
    overtimeEarnings: 4050,
    bonuses: 0,
    deductions: 0,
    netExpectedSalary: 79050,
    amountReceived: 0,
    paymentDate: dayjs().add(1, 'month').date(5).format('YYYY-MM-DD'),
    paymentStatus: 'Pending',
    paymentMethod: 'Bank Transfer',
    notes: 'Current month salary, expected on the 5th of next month.',
    paymentHistory: [],
  },
];
