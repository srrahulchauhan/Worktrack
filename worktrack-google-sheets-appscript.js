/**
 * =========================================================================
 * WORKTRACK — GOOGLE APPS SCRIPT WEB APP FOR LIVE GOOGLE SHEETS SYNC
 * =========================================================================
 *
 * HOW TO SET UP IN 3 EASY STEPS:
 * 1. Open Google Sheets (https://sheets.new) -> Name it "My WorkTrack".
 * 2. In the top menu, click Extensions -> Apps Script.
 * 3. Delete existing code, paste this entire file, and click Save (💾).
 * 4. Click "Deploy" (top right) -> "New deployment":
 *    - Click the gear icon next to "Select type" -> select "Web app"
 *    - Description: "WorkTrack Sync v1"
 *    - Execute as: "Me (your email)"
 *    - Who has access: "Anyone"
 *    - Click "Deploy" -> Authorize access.
 * 5. Copy the "Web app URL" (e.g., https://script.google.com/macros/s/.../exec)
 *    and paste it into WorkTrack -> "Connect Google Sheets" form.
 * =========================================================================
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: "WorkTrack Google Sheets Web App is active and ready.",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var raw = e.postData ? e.postData.contents : "{}";
    var payload = JSON.parse(raw);
    var action = payload.action || "full_sync";

    // 1. Ping / Test Connection
    if (action === "ping") {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Google Sheets Web App connected successfully!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Open Spreadsheet (specified ID or active)
    var ss;
    if (payload.spreadsheetId && payload.spreadsheetId.trim() !== "") {
      ss = SpreadsheetApp.openById(payload.spreadsheetId.trim());
    } else {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }

    if (!ss) {
      throw new Error("Could not access Google Spreadsheet. Please verify Spreadsheet ID.");
    }

    var data = payload.data || {};

    // 3. Sync all sheets
    syncCompaniesSheet(ss, data.companies || []);
    syncAttendanceSheet(ss, data.attendance || []);
    syncShiftsSheet(ss, data.shifts || {});
    syncOvertimeSheet(ss, data.overtime || []);
    syncPaymentsSheet(ss, data.payments || []);
    syncLogSheet(ss, action, new Date().toISOString());

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Sync completed successfully!",
      spreadsheetUrl: ss.getUrl(),
      spreadsheetName: ss.getName(),
      syncedAt: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString(),
      message: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// -------------------------------------------------------------
// Sheet Sync Helpers
// -------------------------------------------------------------

function getOrCreateSheet(ss, name, headerColor) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function syncCompaniesSheet(ss, companies) {
  var sheet = getOrCreateSheet(ss, "Companies");
  sheet.clear();
  var headers = [
    "Company ID", "Company Name", "Job Role", "Department", "Location",
    "Employment Status", "Joining Date", "Leaving Date", "Monthly Salary (₹)",
    "Scheduled Days/Month", "Standard Hours/Day", "Daily Rate (₹)", "Overtime Rate (₹/hr)", "Payment Day"
  ];
  var rows = [headers];

  companies.forEach(function(c) {
    rows.push([
      c.id || "",
      c.name || "",
      c.role || "",
      c.department || "",
      c.location || "",
      c.status || "Current",
      c.joiningDate || "",
      c.leavingDate || "Present",
      Number(c.monthlySalary) || 0,
      Number(c.scheduledWorkingDays) || 26,
      Number(c.standardWorkingHours) || 8,
      Number(c.dailySalaryRate) || 0,
      Number(c.overtimeRate) || 0,
      c.salaryPaymentDate || "5"
    ]);
  });

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  formatHeaderRow(sheet, headers.length, "#1d4ed8"); // Blue header
}

function syncAttendanceSheet(ss, attendance) {
  var sheet = getOrCreateSheet(ss, "Attendance");
  sheet.clear();
  var headers = [
    "Record ID", "Date", "Company Name", "Day of Week", "Attendance Status",
    "Planned Shift", "Actual Shift", "Check-In", "Check-Out", "Break (mins)",
    "Working Hours", "Overtime Hours", "Daily Base Salary (₹)", "OT Salary (₹)", "Total Earnings (₹)", "Notes"
  ];
  var rows = [headers];

  attendance.forEach(function(a) {
    rows.push([
      a.id || "",
      a.date || "",
      a.companyName || "",
      a.dayOfWeek || "",
      a.status || "Present",
      a.plannedShift || "",
      a.actualShift || "",
      a.checkIn || "",
      a.checkOut || "",
      Number(a.breakDuration) || 0,
      Number(a.totalWorkingHours) || 0,
      Number(a.overtimeHours) || 0,
      Number(a.dailySalary) || 0,
      Number(a.overtimeEarnings) || 0,
      Number(a.totalDailyEarnings) || 0,
      a.notes || ""
    ]);
  });

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  formatHeaderRow(sheet, headers.length, "#059669"); // Emerald header
}

function syncShiftsSheet(ss, shifts) {
  var sheet = getOrCreateSheet(ss, "Shifts");
  sheet.clear();
  var headers = ["Shift Type", "Start Time", "End Time", "Break (mins)", "Standard Hours", "Notes"];
  var rows = [
    headers,
    [
      "Day Shift",
      (shifts.dayShift && shifts.dayShift.startTime) || "09:00",
      (shifts.dayShift && shifts.dayShift.endTime) || "18:00",
      (shifts.dayShift && shifts.dayShift.breakMinutes) || 60,
      (shifts.dayShift && shifts.dayShift.standardHours) || 8,
      "Regular scheduled business day"
    ],
    [
      "Night Shift (Overnight)",
      (shifts.nightShift && shifts.nightShift.startTime) || "20:00",
      (shifts.nightShift && shifts.nightShift.endTime) || "05:00",
      (shifts.nightShift && shifts.nightShift.breakMinutes) || 60,
      (shifts.nightShift && shifts.nightShift.standardHours) || 8,
      "Overnight shift with next-day check-out"
    ]
  ];

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  formatHeaderRow(sheet, headers.length, "#4f46e5"); // Indigo header
}

function syncOvertimeSheet(ss, overtime) {
  var sheet = getOrCreateSheet(ss, "Overtime");
  sheet.clear();
  var headers = ["Overtime ID", "Date", "Company Name", "Total Day Hours", "OT Hours", "OT Rate (₹/hr)", "Multiplier", "OT Amount (₹)", "Notes"];
  var rows = [headers];

  overtime.forEach(function(o) {
    rows.push([
      o.id || "",
      o.date || "",
      o.companyName || "",
      Number(o.workingHours) || 0,
      Number(o.overtimeHours) || 0,
      Number(o.overtimeRate) || 0,
      Number(o.overtimeMultiplier) || 1.5,
      Number(o.overtimeAmount) || 0,
      o.notes || ""
    ]);
  });

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  formatHeaderRow(sheet, headers.length, "#d97706"); // Amber header
}

function syncPaymentsSheet(ss, payments) {
  var sheet = getOrCreateSheet(ss, "Payments");
  sheet.clear();
  var headers = [
    "Payment ID", "Salary Month", "Company Name", "Net Expected (₹)",
    "Amount Received (₹)", "Pending Due (₹)", "Payment Status", "Transaction ID", "Disbursed Date", "Receipt Notes"
  ];
  var rows = [headers];

  payments.forEach(function(p) {
    var expected = Number(p.netExpectedSalary) || 0;
    var received = Number(p.amountReceived) || 0;
    var due = Math.max(0, expected - received);

    rows.push([
      p.id || "",
      p.month || "",
      p.companyName || "",
      expected,
      received,
      due,
      p.paymentStatus || "Pending",
      p.transactionId || "",
      p.paymentDate || "",
      p.notes || ""
    ]);
  });

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  formatHeaderRow(sheet, headers.length, "#2563eb"); // Blue header
}

function syncLogSheet(ss, action, timestamp) {
  var sheet = getOrCreateSheet(ss, "Sync_Log");
  var headers = ["Timestamp", "Action", "Status", "Message"];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    formatHeaderRow(sheet, headers.length, "#475569");
  }

  sheet.appendRow([timestamp, action, "Success", "Live sync executed via WorkTrack App"]);
}

function formatHeaderRow(sheet, colCount, hexColor) {
  var headerRange = sheet.getRange(1, 1, 1, colCount);
  headerRange.setBackground(hexColor);
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  sheet.setFrozenRows(1);
}
