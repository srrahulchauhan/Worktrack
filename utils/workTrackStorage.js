import {
  INITIAL_COMPANIES,
  INITIAL_SETTINGS,
  INITIAL_SHIFTS,
  INITIAL_OVERTIME,
  INITIAL_PAYMENTS,
  generateDemoAttendance,
} from './demoData';

const STORAGE_KEYS = {
  COMPANIES: 'worktrack_companies_v1',
  ATTENDANCE: 'worktrack_attendance_v1',
  SHIFTS: 'worktrack_shifts_v1',
  OVERTIME: 'worktrack_overtime_v1',
  PAYMENTS: 'worktrack_payments_v1',
  SETTINGS: 'worktrack_settings_v1',
  ACTIVE_COMPANY: 'worktrack_active_company_id_v1',
};

/**
 * Safely parse JSON from localStorage
 */
function safeGet(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error loading ${key} from localStorage:`, err);
    return fallback;
  }
}

/**
 * Safely write JSON to localStorage
 */
function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

/**
 * Initialize storage with demo data if empty
 */
export function initializeWorkTrackStorage() {
  const existingCompanies = localStorage.getItem(STORAGE_KEYS.COMPANIES);
  if (!existingCompanies) {
    safeSet(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
    safeSet(STORAGE_KEYS.ATTENDANCE, generateDemoAttendance('comp_1'));
    safeSet(STORAGE_KEYS.SHIFTS, INITIAL_SHIFTS);
    safeSet(STORAGE_KEYS.OVERTIME, INITIAL_OVERTIME);
    safeSet(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    safeSet(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    safeSet(STORAGE_KEYS.ACTIVE_COMPANY, 'comp_1');
  }
}

export function loadWorkTrackData() {
  initializeWorkTrackStorage();
  return {
    companies: safeGet(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES),
    attendance: safeGet(STORAGE_KEYS.ATTENDANCE, []),
    shifts: safeGet(STORAGE_KEYS.SHIFTS, INITIAL_SHIFTS),
    overtime: safeGet(STORAGE_KEYS.OVERTIME, INITIAL_OVERTIME),
    payments: safeGet(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS),
    settings: safeGet(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS),
    activeCompanyId: safeGet(STORAGE_KEYS.ACTIVE_COMPANY, 'comp_1'),
  };
}

export function saveCompanies(companies) {
  safeSet(STORAGE_KEYS.COMPANIES, companies);
}

export function saveAttendance(attendance) {
  safeSet(STORAGE_KEYS.ATTENDANCE, attendance);
}

export function saveShifts(shifts) {
  safeSet(STORAGE_KEYS.SHIFTS, shifts);
}

export function saveOvertime(overtime) {
  safeSet(STORAGE_KEYS.OVERTIME, overtime);
}

export function savePayments(payments) {
  safeSet(STORAGE_KEYS.PAYMENTS, payments);
}

export function saveSettings(settings) {
  safeSet(STORAGE_KEYS.SETTINGS, settings);
}

export function saveActiveCompanyId(id) {
  safeSet(STORAGE_KEYS.ACTIVE_COMPANY, id);
}

/**
 * Reset all WorkTrack data to default demo data
 */
export function resetWorkTrackToDemo() {
  safeSet(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
  safeSet(STORAGE_KEYS.ATTENDANCE, generateDemoAttendance('comp_1'));
  safeSet(STORAGE_KEYS.SHIFTS, INITIAL_SHIFTS);
  safeSet(STORAGE_KEYS.OVERTIME, INITIAL_OVERTIME);
  safeSet(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  safeSet(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  safeSet(STORAGE_KEYS.ACTIVE_COMPANY, 'comp_1');
  return loadWorkTrackData();
}

/**
 * Clear all WorkTrack data from localStorage completely
 */
export function clearAllWorkTrackData() {
  safeSet(STORAGE_KEYS.COMPANIES, []);
  safeSet(STORAGE_KEYS.ATTENDANCE, []);
  safeSet(STORAGE_KEYS.SHIFTS, INITIAL_SHIFTS);
  safeSet(STORAGE_KEYS.OVERTIME, []);
  safeSet(STORAGE_KEYS.PAYMENTS, []);
  safeSet(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  safeSet(STORAGE_KEYS.ACTIVE_COMPANY, '');
  return {
    companies: [],
    attendance: [],
    shifts: INITIAL_SHIFTS,
    overtime: [],
    payments: [],
    settings: INITIAL_SETTINGS,
    activeCompanyId: '',
  };
}

/**
 * Export all WorkTrack data to a JSON download
 */
export function exportWorkTrackJSON() {
  const data = loadWorkTrackData();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `my-worktrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import WorkTrack data from a JSON object
 */
export function importWorkTrackJSON(imported) {
  if (!imported || typeof imported !== 'object') {
    throw new Error('Invalid JSON format');
  }

  if (Array.isArray(imported.companies)) {
    saveCompanies(imported.companies);
  }
  if (Array.isArray(imported.attendance)) {
    saveAttendance(imported.attendance);
  }
  if (imported.shifts && typeof imported.shifts === 'object') {
    saveShifts(imported.shifts);
  }
  if (Array.isArray(imported.overtime)) {
    saveOvertime(imported.overtime);
  }
  if (Array.isArray(imported.payments)) {
    savePayments(imported.payments);
  }
  if (imported.settings && typeof imported.settings === 'object') {
    saveSettings(imported.settings);
  }
  if (imported.activeCompanyId) {
    saveActiveCompanyId(imported.activeCompanyId);
  }

  return loadWorkTrackData();
}
