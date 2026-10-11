import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

/**
 * Export all WorkTrack data into a multi-sheet Excel Workbook (.xlsx)
 */
export function exportWorkTrackExcel(data) {
  const wb = XLSX.utils.book_new();

  // 1. Companies Sheet
  const companiesData = (data.companies || []).map((c) => ({
    'Company ID': c.id,
    'Company Name': c.name,
    'Job Role': c.role,
    'Department': c.department || '',
    'Location': c.location || '',
    'Employment Status': c.status,
    'Joining Date': c.joiningDate,
    'Leaving Date': c.leavingDate || 'Present',
    'Monthly Salary (₹)': Number(c.monthlySalary) || 0,
    'Scheduled Days / Month': Number(c.scheduledWorkingDays) || 26,
    'Standard Hours / Day': Number(c.standardWorkingHours) || 8,
    'Daily Rate (₹)': Number(c.dailySalaryRate) || 0,
    'Overtime Rate (₹/hr)': Number(c.overtimeRate) || 0,
    'Payment Day of Month': c.salaryPaymentDate || '5',
    'Notes': c.notes || '',
  }));
  const wsCompanies = XLSX.utils.json_to_sheet(companiesData);
  XLSX.utils.book_append_sheet(wb, wsCompanies, 'Companies');

  // 2. Attendance Sheet
  const attendanceData = (data.attendance || []).map((a) => ({
    'Record ID': a.id,
    'Date': a.date,
    'Company Name': a.companyName || '',
    'Day of Week': a.dayOfWeek,
    'Attendance Status': a.status,
    'Planned Shift': a.plannedShift || '',
    'Actual Shift': a.actualShift || '',
    'Check-In': a.checkIn || '',
    'Check-Out': a.checkOut || '',
    'Break Duration (mins)': Number(a.breakDuration) || 0,
    'Net Working Hours': Number(a.totalWorkingHours) || 0,
    'Overtime Hours': Number(a.overtimeHours) || 0,
    'Daily Salary (₹)': Number(a.dailySalary) || 0,
    'Overtime Earnings (₹)': Number(a.overtimeEarnings) || 0,
    'Total Daily Earnings (₹)': Number(a.totalDailyEarnings) || 0,
    'Notes': a.notes || '',
  }));
  const wsAttendance = XLSX.utils.json_to_sheet(attendanceData);
  XLSX.utils.book_append_sheet(wb, wsAttendance, 'Attendance');

  // 3. Shifts Sheet
  const shiftsData = [
    {
      'Shift Type': 'Day Shift',
      'Start Time': data.shifts?.dayShift?.startTime || '09:00',
      'End Time': data.shifts?.dayShift?.endTime || '18:00',
      'Break (mins)': data.shifts?.dayShift?.breakMinutes || 60,
      'Standard Hours': data.shifts?.dayShift?.standardHours || 8,
      'Schedule Days': 'Mon - Sat (Regular)',
    },
    {
      'Shift Type': 'Night Shift (Overnight)',
      'Start Time': data.shifts?.nightShift?.startTime || '20:00',
      'End Time': data.shifts?.nightShift?.endTime || '05:00',
      'Break (mins)': data.shifts?.nightShift?.breakMinutes || 60,
      'Standard Hours': data.shifts?.nightShift?.standardHours || 8,
      'Schedule Days': 'Next-day checkout supported',
    },
    ...Object.entries(data.shifts?.rotationalSchedule || {}).map(([day, shift]) => ({
      'Shift Type': `Rotational Schedule - ${day}`,
      'Start Time': '—',
      'End Time': '—',
      'Break (mins)': 60,
      'Standard Hours': 8,
      'Schedule Days': `Assigned to: ${shift}`,
    })),
  ];
  const wsShifts = XLSX.utils.json_to_sheet(shiftsData);
  XLSX.utils.book_append_sheet(wb, wsShifts, 'Shifts');

  // 4. Overtime Sheet
  const overtimeData = (data.overtime || []).map((o) => ({
    'Overtime ID': o.id,
    'Date': o.date,
    'Company Name': o.companyName || '',
    'Total Day Hours': Number(o.workingHours) || 0,
    'Overtime Hours': Number(o.overtimeHours) || 0,
    'Overtime Rate (₹/hr)': Number(o.overtimeRate) || 0,
    'Rate Multiplier': Number(o.overtimeMultiplier) || 1.5,
    'Overtime Amount (₹)': Number(o.overtimeAmount) || 0,
    'Source': o.source || 'manual',
    'Notes': o.notes || '',
  }));
  const wsOvertime = XLSX.utils.json_to_sheet(overtimeData);
  XLSX.utils.book_append_sheet(wb, wsOvertime, 'Overtime');

  // 5. Payments Sheet
  const paymentsData = (data.payments || []).map((p) => {
    const pending = Math.max(0, (Number(p.netExpectedSalary) || 0) - (Number(p.amountReceived) || 0));
    return {
      'Payment ID': p.id,
      'Salary Month': p.salaryMonth,
      'Company Name': p.companyName || '',
      'Base Expected Salary (₹)': Number(p.expectedSalary) || 0,
      'Overtime Earnings (₹)': Number(p.overtimeEarnings) || 0,
      'Bonuses (₹)': Number(p.bonuses) || 0,
      'Deductions (₹)': Number(p.deductions) || 0,
      'Net Expected Salary (₹)': Number(p.netExpectedSalary) || 0,
      'Amount Received (₹)': Number(p.amountReceived) || 0,
      'Pending Balance (₹)': pending,
      'Payment Status': p.paymentStatus,
      'Payment Date': p.paymentDate || '',
      'Payment Method': p.paymentMethod || 'Bank Transfer',
      'Installment Count': p.paymentHistory?.length || 0,
      'Notes': p.notes || '',
    };
  });
  const wsPayments = XLSX.utils.json_to_sheet(paymentsData);
  XLSX.utils.book_append_sheet(wb, wsPayments, 'Payments');

  // 6. Settings & Policy Sheet
  const settingsData = [
    { 'Setting Name': 'Calculation Method', 'Value': data.settings?.calculationMethod || 'monthly_divided_by_scheduled' },
    { 'Setting Name': 'Paid Leave Pay %', 'Value': `${data.settings?.paidLeavePayPercent ?? 100}%` },
    { 'Setting Name': 'Weekly Off Pay %', 'Value': `${data.settings?.weeklyOffPayPercent ?? 100}%` },
    { 'Setting Name': 'Holiday Pay %', 'Value': `${data.settings?.holidayPayPercent ?? 100}%` },
    { 'Setting Name': 'Half Day Pay %', 'Value': `${data.settings?.halfDayPayPercent ?? 50}%` },
    { 'Setting Name': 'Default Overtime Multiplier', 'Value': `${data.settings?.defaultOvertimeMultiplier || 1.5}x` },
    { 'Setting Name': 'Default Standard Hours', 'Value': `${data.settings?.defaultStandardHours || 8} hrs` },
    { 'Setting Name': 'Currency Symbol', 'Value': '₹ (INR)' },
    { 'Setting Name': 'Active Company ID', 'Value': data.activeCompanyId || '' },
    { 'Setting Name': 'Export Date & Time', 'Value': dayjs().format('YYYY-MM-DD HH:mm:ss') },
  ];
  const wsSettings = XLSX.utils.json_to_sheet(settingsData);
  XLSX.utils.book_append_sheet(wb, wsSettings, 'Settings');

  // Trigger browser download
  const filename = `My-WorkTrack-Export-${dayjs().format('YYYY-MM-DD')}.xlsx`;
  XLSX.writeFile(wb, filename);
}
