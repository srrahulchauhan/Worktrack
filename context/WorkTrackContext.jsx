import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  loadWorkTrackData,
  saveCompanies,
  saveAttendance,
  saveShifts,
  saveOvertime,
  savePayments,
  saveSettings,
  saveActiveCompanyId,
  exportWorkTrackJSON,
  importWorkTrackJSON,
  resetWorkTrackToDemo,
  clearAllWorkTrackData,
} from '../utils/workTrackStorage';
import {
  calculateDailySalaryRate,
  calculateAttendanceDailyEarnings,
  calculateOvertimeAmount,
  calculateWorkingHours,
} from '../utils/workTrackCalculations';
import { exportWorkTrackExcel } from '../utils/excelExport';
import {
  loadSyncConfig,
  saveSyncConfig,
  loadPendingQueue,
  savePendingQueue,
  executeFullSync,
  testGoogleSheetsConnection,
} from '../utils/googleSheetsSync';
import {
  linkLocalBackupFile,
  createAndLinkNewLocalFile,
  writeToLinkedLocalFile,
  isFileSystemAccessSupported,
} from '../utils/fileSystemSync';
import dayjs from 'dayjs';

const WorkTrackContext = createContext(null);

export function WorkTrackProvider({ children }) {
  const [data, setData] = useState(() => loadWorkTrackData());
  const [toasts, setToasts] = useState([]);

  // Sync and Cloud Integration State
  const [syncConfig, setSyncConfig] = useState(() => loadSyncConfig());
  const [pendingQueue, setPendingQueue] = useState(() => loadPendingQueue());
  const [localFileHandle, setLocalFileHandle] = useState(null);
  const [localFileName, setLocalFileName] = useState(null);

  const autoSyncTimerRef = useRef(null);
  const isInitialMount = useRef(true);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Update sync config state and persist
  const updateSyncConfig = useCallback((updates) => {
    setSyncConfig((prev) => {
      const next = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      saveSyncConfig(next);
      return next;
    });
  }, []);

  // Add change to sync queue and persist
  const enqueueChange = useCallback((change) => {
    setPendingQueue((prev) => {
      const updated = [...prev, { ...change, timestamp: new Date().toISOString() }];
      savePendingQueue(updated);
      return updated;
    });
  }, []);

  // Sync state to LocalStorage
  const setCompanies = useCallback((newCompanies) => {
    setData((prev) => {
      const updated = typeof newCompanies === 'function' ? newCompanies(prev.companies) : newCompanies;
      saveCompanies(updated);
      return { ...prev, companies: updated };
    });
  }, []);

  const setAttendance = useCallback((newAttendance) => {
    setData((prev) => {
      const updated = typeof newAttendance === 'function' ? newAttendance(prev.attendance) : newAttendance;
      saveAttendance(updated);
      return { ...prev, attendance: updated };
    });
  }, []);

  const setShifts = useCallback((newShifts) => {
    setData((prev) => {
      const updated = typeof newShifts === 'function' ? newShifts(prev.shifts) : newShifts;
      saveShifts(updated);
      return { ...prev, shifts: updated };
    });
  }, []);

  const setOvertime = useCallback((newOvertime) => {
    setData((prev) => {
      const updated = typeof newOvertime === 'function' ? newOvertime(prev.overtime) : newOvertime;
      saveOvertime(updated);
      return { ...prev, overtime: updated };
    });
  }, []);

  const setPayments = useCallback((newPayments) => {
    setData((prev) => {
      const updated = typeof newPayments === 'function' ? newPayments(prev.payments) : newPayments;
      savePayments(updated);
      return { ...prev, payments: updated };
    });
  }, []);

  const setSettings = useCallback((newSettings) => {
    setData((prev) => {
      const updated = typeof newSettings === 'function' ? newSettings(prev.settings) : newSettings;
      saveSettings(updated);
      return { ...prev, settings: updated };
    });
  }, []);

  const setActiveCompanyId = useCallback((id) => {
    saveActiveCompanyId(id);
    setData((prev) => ({ ...prev, activeCompanyId: id }));
  }, []);

  // Current Active Company computation
  const activeCompany = useMemo(() => {
    if (!data.companies || data.companies.length === 0) return null;
    const found = data.companies.find((c) => c.id === data.activeCompanyId);
    if (found) return found;
    const current = data.companies.find((c) => c.status === 'Active' || c.status === 'Current');
    return current || data.companies[0] || null;
  }, [data.companies, data.activeCompanyId]);

  // Google Sheets Full Sync function
  const triggerGoogleSheetsSync = useCallback(async (isManual = false) => {
    if (!syncConfig.webAppUrl) {
      if (isManual) {
        showToast('Please connect your Google Apps Script Web App first.', 'info');
      }
      return;
    }

    updateSyncConfig({ syncStatus: 'syncing', lastError: null });

    try {
      const result = await executeFullSync(syncConfig, data);
      const syncedAt = new Date().toISOString();

      updateSyncConfig({
        syncStatus: 'synced',
        lastSyncTime: syncedAt,
        spreadsheetName: result.spreadsheetName || syncConfig.spreadsheetName,
        spreadsheetUrl: result.spreadsheetUrl || syncConfig.spreadsheetUrl,
        lastError: null,
      });

      // Clear pending queue on successful sync
      setPendingQueue([]);
      savePendingQueue([]);

      if (isManual) {
        showToast(result.message || 'Google Sheets synchronized successfully!');
      }
    } catch (err) {
      console.error('Google Sheets Sync Failed:', err);
      updateSyncConfig({
        syncStatus: 'failed',
        lastError: err.message,
      });
      if (isManual) {
        showToast(`Sync Failed: ${err.message}`, 'error');
      }
    }
  }, [syncConfig, data, updateSyncConfig, showToast]);

  // Debounced Auto-sync Effect on Data Changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Write to linked local PC file if active
    if (localFileHandle) {
      writeToLinkedLocalFile(localFileHandle, data).catch((err) => {
        console.warn('Local file auto-update error:', err);
      });
    }

    // Auto-sync to Google Sheets if connected and enabled
    if (syncConfig.isConnected && syncConfig.autoSyncEnabled && syncConfig.webAppUrl) {
      updateSyncConfig({ syncStatus: 'pending' });

      if (autoSyncTimerRef.current) {
        clearTimeout(autoSyncTimerRef.current);
      }

      autoSyncTimerRef.current = setTimeout(() => {
        triggerGoogleSheetsSync(false);
      }, 1500); // Debounce 1.5s
    }

    return () => {
      if (autoSyncTimerRef.current) {
        clearTimeout(autoSyncTimerRef.current);
      }
    };
  }, [data, syncConfig.isConnected, syncConfig.autoSyncEnabled, syncConfig.webAppUrl, localFileHandle, triggerGoogleSheetsSync, updateSyncConfig]);

  // Network Online Recovery Listener: retry pending queue when coming back online
  useEffect(() => {
    const handleOnline = () => {
      if (syncConfig.isConnected && syncConfig.autoSyncEnabled && syncConfig.webAppUrl) {
        triggerGoogleSheetsSync(false);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncConfig, triggerGoogleSheetsSync]);

  // --- Actions ---

  // Save Data Button: Explicit manual save confirmation
  const manualSaveData = useCallback(() => {
    saveCompanies(data.companies);
    saveAttendance(data.attendance);
    saveShifts(data.shifts);
    saveOvertime(data.overtime);
    savePayments(data.payments);
    saveSettings(data.settings);
    saveActiveCompanyId(data.activeCompanyId);

    if (localFileHandle) {
      writeToLinkedLocalFile(localFileHandle, data)
        .then(() => {
          showToast('Data saved to LocalStorage and linked PC file!');
        })
        .catch((err) => {
          showToast(`Saved to LocalStorage. PC file error: ${err.message}`, 'info');
        });
    } else {
      showToast('All WorkTrack data saved to LocalStorage successfully!');
    }
  }, [data, localFileHandle, showToast]);

  // Download Excel (.xlsx)
  const downloadExcel = useCallback(() => {
    try {
      exportWorkTrackExcel(data);
      showToast('Excel workbook (.xlsx) downloaded successfully!');
    } catch (err) {
      showToast(`Excel export failed: ${err.message}`, 'error');
    }
  }, [data, showToast]);

  // Download Backup JSON
  const downloadBackupJSON = useCallback(() => {
    exportWorkTrackJSON();
    showToast('Complete JSON backup downloaded!');
  }, [showToast]);

  // Connect Google Sheets
  const connectGoogleSheets = useCallback(async ({ webAppUrl, spreadsheetId, spreadsheetName }) => {
    if (!webAppUrl) {
      throw new Error('Please provide the Google Apps Script Web App URL.');
    }

    showToast('Testing Google Sheets connection...', 'info');
    await testGoogleSheetsConnection(webAppUrl);

    const newConfig = {
      ...syncConfig,
      isConnected: true,
      webAppUrl: webAppUrl.trim(),
      spreadsheetId: (spreadsheetId || '').trim(),
      spreadsheetName: spreadsheetName || 'My WorkTrack Google Sheet',
      syncStatus: 'syncing',
      lastError: null,
    };
    updateSyncConfig(newConfig);

    // Immediately trigger initial full sync
    try {
      const res = await executeFullSync(newConfig, data);
      updateSyncConfig({
        syncStatus: 'synced',
        lastSyncTime: new Date().toISOString(),
        spreadsheetUrl: res.spreadsheetUrl || '',
      });
      showToast('Connected and initial full sync completed successfully!');
    } catch (syncErr) {
      updateSyncConfig({ syncStatus: 'failed', lastError: syncErr.message });
      showToast(`Connected, but initial sync failed: ${syncErr.message}. You can Retry Sync.`, 'error');
    }
  }, [syncConfig, data, updateSyncConfig, showToast]);

  // Disconnect Google Sheets
  const disconnectGoogleSheets = useCallback(() => {
    updateSyncConfig({
      isConnected: false,
      syncStatus: 'idle',
      lastError: null,
    });
    showToast('Google Sheets disconnected.', 'info');
  }, [updateSyncConfig, showToast]);

  // Sync Now Button
  const syncNow = useCallback(() => {
    triggerGoogleSheetsSync(true);
  }, [triggerGoogleSheetsSync]);

  // Retry Failed Sync Button
  const retryFailedSync = useCallback(() => {
    triggerGoogleSheetsSync(true);
  }, [triggerGoogleSheetsSync]);

  // Toggle Auto-Sync
  const toggleAutoSync = useCallback((enabled) => {
    updateSyncConfig({ autoSyncEnabled: enabled });
    showToast(`Auto-Sync turned ${enabled ? 'ON' : 'OFF'}.`);
  }, [updateSyncConfig, showToast]);

  // Link Local PC File
  const linkLocalFileHandler = useCallback(async (createMode = false) => {
    try {
      const res = createMode ? await createAndLinkNewLocalFile() : await linkLocalBackupFile();
      if (res.cancelled) return;

      setLocalFileHandle(res.fileHandle);
      setLocalFileName(res.fileName);

      // Write current data immediately
      await writeToLinkedLocalFile(res.fileHandle, data);
      showToast(`Linked local PC file: "${res.fileName}"`);
    } catch (err) {
      showToast(`Local File Link error: ${err.message}`, 'error');
    }
  }, [data, showToast]);

  const unlinkLocalFileHandler = useCallback(() => {
    setLocalFileHandle(null);
    setLocalFileName(null);
    showToast('Unlinked local PC backup file.', 'info');
  }, [showToast]);

  // Company Actions
  const addCompany = useCallback((companyData) => {
    const id = `comp_${Date.now()}`;
    const monthlySalary = Number(companyData.monthlySalary) || 0;
    const scheduledDays = Number(companyData.scheduledWorkingDays) || 26;
    const standardHours = Number(companyData.standardWorkingHours) || 8;
    const autoDailyRate = Math.round(monthlySalary / (scheduledDays || 1));
    const dailySalaryRate = Number(companyData.dailySalaryRate) || autoDailyRate;
    const overtimeRate = Number(companyData.overtimeRate) || Math.round(dailySalaryRate / (standardHours || 8));

    const newCompany = {
      ...companyData,
      id,
      monthlySalary,
      scheduledWorkingDays: scheduledDays,
      standardWorkingHours: standardHours,
      dailySalaryRate,
      overtimeRate,
      salaryPaymentDate: companyData.salaryPaymentDate || '5',
      status: companyData.status || 'Current',
      createdAt: new Date().toISOString(),
    };

    setCompanies((prev) => [newCompany, ...prev]);
    setActiveCompanyId(id);
    enqueueChange({ action: 'upsert', tabName: 'Companies', record: newCompany });
    showToast(`Company "${newCompany.name}" added successfully.`);
    return newCompany;
  }, [setCompanies, setActiveCompanyId, enqueueChange, showToast]);

  const updateCompany = useCallback((id, updates) => {
    let updatedRecord = null;
    setCompanies((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const monthlySalary = updates.monthlySalary !== undefined ? Number(updates.monthlySalary) : c.monthlySalary;
        const scheduledDays = updates.scheduledWorkingDays !== undefined ? Number(updates.scheduledWorkingDays) : c.scheduledWorkingDays;
        const standardHours = updates.standardWorkingHours !== undefined ? Number(updates.standardWorkingHours) : c.standardWorkingHours;
        const autoDailyRate = Math.round(monthlySalary / (scheduledDays || 1));
        const dailySalaryRate = updates.dailySalaryRate !== undefined ? Number(updates.dailySalaryRate) : (c.dailySalaryRate || autoDailyRate);
        const overtimeRate = updates.overtimeRate !== undefined ? Number(updates.overtimeRate) : (c.overtimeRate || Math.round(dailySalaryRate / standardHours));

        updatedRecord = {
          ...c,
          ...updates,
          monthlySalary,
          scheduledWorkingDays: scheduledDays,
          standardWorkingHours: standardHours,
          dailySalaryRate,
          overtimeRate,
        };
        return updatedRecord;
      })
    );
    if (updatedRecord) {
      enqueueChange({ action: 'upsert', tabName: 'Companies', record: updatedRecord });
    }
    showToast('Company details updated.');
  }, [setCompanies, enqueueChange, showToast]);

  const deleteCompany = useCallback((id) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id));
    setAttendance((prev) => prev.filter((a) => a.companyId !== id));
    setOvertime((prev) => prev.filter((o) => o.companyId !== id));
    setPayments((prev) => prev.filter((p) => p.companyId !== id));
    if (data.activeCompanyId === id) {
      const remaining = data.companies.filter((c) => c.id !== id);
      setActiveCompanyId(remaining[0]?.id || '');
    }
    enqueueChange({ action: 'delete', tabName: 'Companies', id });
    showToast('Company and associated records deleted.', 'info');
  }, [setCompanies, setAttendance, setOvertime, setPayments, data.activeCompanyId, data.companies, setActiveCompanyId, enqueueChange, showToast]);

  // Attendance Actions
  const addAttendance = useCallback((record) => {
    const existing = data.attendance.find(
      (a) => a.date === record.date && a.companyId === record.companyId
    );
    if (existing) {
      throw new Error(`An attendance record already exists for ${record.date} for this company. Please edit that record instead.`);
    }

    const company = data.companies.find((c) => c.id === record.companyId) || activeCompany;
    const dailyRate = company?.dailySalaryRate || calculateDailySalaryRate({
      monthlySalary: company?.monthlySalary || 0,
      scheduledWorkingDays: company?.scheduledWorkingDays || 26,
      date: record.date,
      method: data.settings.calculationMethod,
    });

    const hoursData = calculateWorkingHours(record.checkIn, record.checkOut, record.breakDuration);
    const standardHours = company?.standardWorkingHours || data.settings.defaultStandardHours || 8;
    const totalWorkingHours = hoursData.netHours;

    let overtimeHours = Number(record.overtimeHours) || 0;
    if (record.status === 'Present' && !record.overtimeHours && totalWorkingHours > standardHours) {
      overtimeHours = Math.round((totalWorkingHours - standardHours) * 100) / 100;
    }

    const dailySalary = calculateAttendanceDailyEarnings({
      status: record.status,
      dailyRate,
      settings: data.settings,
    });

    const otRate = Number(record.overtimeRate) || company?.overtimeRate || 200;
    const overtimeEarnings = record.overtimeEarnings !== undefined
      ? Number(record.overtimeEarnings)
      : Math.round(overtimeHours * otRate);
    const totalDailyEarnings = dailySalary + overtimeEarnings;

    const newRecord = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      dayOfWeek: dayjs(record.date).format('dddd'),
      ...record,
      companyName: company?.name || 'Company',
      totalWorkingHours,
      overtimeHours,
      dailySalary,
      overtimeEarnings,
      totalDailyEarnings,
    };

    setAttendance((prev) => [newRecord, ...prev].sort((a, b) => dayjs(b.date).diff(dayjs(a.date))));
    enqueueChange({ action: 'upsert', tabName: 'Attendance', record: newRecord });

    // Sync to overtime if applicable
    if (overtimeHours > 0) {
      const otRecord = {
        id: `ot_sync_${newRecord.id}`,
        date: record.date,
        companyId: record.companyId,
        companyName: company?.name || 'Company',
        workingHours: totalWorkingHours,
        overtimeHours,
        overtimeRate: otRate,
        overtimeMultiplier: Number(record.overtimeMultiplier) || 1,
        overtimeAmount: overtimeEarnings,
        notes: `Attendance: ${record.notes || record.actualShift || 'Overtime'}`,
        source: 'attendance',
      };
      setOvertime((prev) => {
        const filtered = prev.filter((o) => !(o.date === record.date && o.companyId === record.companyId));
        return [otRecord, ...filtered];
      });
      enqueueChange({ action: 'upsert', tabName: 'Overtime', record: otRecord });
    }

    showToast(`Attendance marked for ${record.date}.`);
    return newRecord;
  }, [data.attendance, data.companies, data.settings, activeCompany, setAttendance, setOvertime, enqueueChange, showToast]);

  const updateAttendance = useCallback((id, updates) => {
    let updatedRecord = null;
    setAttendance((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const merged = { ...item, ...updates };
        const company = data.companies.find((c) => c.id === merged.companyId) || activeCompany;
        const dailyRate = company?.dailySalaryRate || calculateDailySalaryRate({
          monthlySalary: company?.monthlySalary || 0,
          scheduledWorkingDays: company?.scheduledWorkingDays || 26,
          date: merged.date,
          method: data.settings.calculationMethod,
        });

        const hoursData = calculateWorkingHours(merged.checkIn, merged.checkOut, merged.breakDuration);
        const standardHours = company?.standardWorkingHours || 8;
        const totalWorkingHours = hoursData.netHours;

        let overtimeHours = Number(merged.overtimeHours) || 0;
        if (merged.status === 'Present' && merged.overtimeHours === undefined && totalWorkingHours > standardHours) {
          overtimeHours = Math.round((totalWorkingHours - standardHours) * 100) / 100;
        }

        const dailySalary = calculateAttendanceDailyEarnings({
          status: merged.status,
          dailyRate,
          settings: data.settings,
        });

        const otRate = Number(merged.overtimeRate) || company?.overtimeRate || 200;
        const overtimeEarnings = merged.overtimeEarnings !== undefined
          ? Number(merged.overtimeEarnings)
          : Math.round(overtimeHours * otRate);
        const totalDailyEarnings = dailySalary + overtimeEarnings;

        updatedRecord = {
          ...merged,
          dayOfWeek: dayjs(merged.date).format('dddd'),
          totalWorkingHours,
          overtimeHours,
          overtimeRate: otRate,
          dailySalary,
          overtimeEarnings,
          totalDailyEarnings,
        };
        return updatedRecord;
      })
    );
    if (updatedRecord) {
      enqueueChange({ action: 'upsert', tabName: 'Attendance', record: updatedRecord });
      if (updatedRecord.overtimeHours > 0) {
        const company = data.companies.find((c) => c.id === updatedRecord.companyId) || activeCompany;
        const otRecord = {
          id: `ot_sync_${id}`,
          date: updatedRecord.date,
          companyId: updatedRecord.companyId,
          companyName: company?.name || 'Company',
          workingHours: updatedRecord.totalWorkingHours,
          overtimeHours: updatedRecord.overtimeHours,
          overtimeRate: updatedRecord.overtimeRate || 200,
          overtimeMultiplier: 1,
          overtimeAmount: updatedRecord.overtimeEarnings,
          notes: `Attendance: ${updatedRecord.notes || updatedRecord.actualShift || 'Overtime'}`,
          source: 'attendance',
        };
        setOvertime((prev) => [otRecord, ...prev.filter((o) => o.id !== `ot_sync_${id}`)]);
      } else {
        setOvertime((prev) => prev.filter((o) => o.id !== `ot_sync_${id}`));
      }
    }
    showToast('Attendance record updated.');
  }, [data.companies, data.settings, activeCompany, setAttendance, setOvertime, enqueueChange, showToast]);

  const deleteAttendance = useCallback((id) => {
    setAttendance((prev) => prev.filter((a) => a.id !== id));
    setOvertime((prev) => prev.filter((o) => o.id !== `ot_sync_${id}`));
    enqueueChange({ action: 'delete', tabName: 'Attendance', id });
    showToast('Attendance record deleted.', 'info');
  }, [setAttendance, setOvertime, enqueueChange, showToast]);

  // Overtime Actions
  const addOvertime = useCallback((record) => {
    const id = `ot_${Date.now()}`;
    const company = data.companies.find((c) => c.id === record.companyId) || activeCompany;
    const hours = Number(record.overtimeHours) || 0;
    const rate = Number(record.overtimeRate) || company?.overtimeRate || 250;
    const mult = Number(record.overtimeMultiplier) || data.settings.defaultOvertimeMultiplier || 1.5;
    const overtimeAmount = calculateOvertimeAmount(hours, rate, mult);

    const newRecord = {
      ...record,
      id,
      companyName: company?.name || 'Company',
      overtimeHours: hours,
      overtimeRate: rate,
      overtimeMultiplier: mult,
      overtimeAmount,
      source: 'manual',
    };

    setOvertime((prev) => [newRecord, ...prev].sort((a, b) => dayjs(b.date).diff(dayjs(a.date))));
    enqueueChange({ action: 'upsert', tabName: 'Overtime', record: newRecord });
    showToast(`Added ${hours}h overtime for ${record.date}.`);
    return newRecord;
  }, [data.companies, data.settings, activeCompany, setOvertime, enqueueChange, showToast]);

  const updateOvertime = useCallback((id, updates) => {
    let updatedRecord = null;
    setOvertime((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const merged = { ...item, ...updates };
        const hours = Number(merged.overtimeHours) || 0;
        const rate = Number(merged.overtimeRate) || 250;
        const mult = Number(merged.overtimeMultiplier) || 1.5;
        const overtimeAmount = calculateOvertimeAmount(hours, rate, mult);
        updatedRecord = {
          ...merged,
          overtimeHours: hours,
          overtimeRate: rate,
          overtimeMultiplier: mult,
          overtimeAmount,
        };
        return updatedRecord;
      })
    );
    if (updatedRecord) {
      enqueueChange({ action: 'upsert', tabName: 'Overtime', record: updatedRecord });
    }
    showToast('Overtime record updated.');
  }, [setOvertime, enqueueChange, showToast]);

  const deleteOvertime = useCallback((id) => {
    setOvertime((prev) => prev.filter((o) => o.id !== id));
    enqueueChange({ action: 'delete', tabName: 'Overtime', id });
    showToast('Overtime record removed.', 'info');
  }, [setOvertime, enqueueChange, showToast]);

  // Salary Payment Actions
  const addPayment = useCallback((record) => {
    const id = `pay_${Date.now()}`;
    const company = data.companies.find((c) => c.id === record.companyId) || activeCompany;
    const expected = Number(record.expectedSalary) || 0;
    const ot = Number(record.overtimeEarnings) || 0;
    const bonus = Number(record.bonuses) || 0;
    const deduct = Number(record.deductions) || 0;
    const net = expected + ot + bonus - deduct;
    const received = Number(record.amountReceived) || 0;

    let paymentStatus = record.paymentStatus || 'Pending';
    if (received >= net && net > 0) {
      paymentStatus = 'Paid';
    } else if (received > 0) {
      paymentStatus = 'Partially Paid';
    }

    const newRecord = {
      ...record,
      id,
      companyName: company?.name || 'Company',
      expectedSalary: expected,
      overtimeEarnings: ot,
      bonuses: bonus,
      deductions: deduct,
      netExpectedSalary: net,
      amountReceived: received,
      paymentStatus,
      paymentHistory: record.paymentHistory || (received > 0 ? [
        {
          id: `ph_${Date.now()}`,
          date: record.paymentDate || dayjs().format('YYYY-MM-DD'),
          amount: received,
          method: record.paymentMethod || 'Bank Transfer',
          notes: 'Initial recorded payment',
        }
      ] : []),
    };

    setPayments((prev) => [newRecord, ...prev]);
    enqueueChange({ action: 'upsert', tabName: 'Payments', record: newRecord });
    showToast(`Salary payment record added for ${record.salaryMonth}.`);
    return newRecord;
  }, [data.companies, activeCompany, setPayments, enqueueChange, showToast]);

  const updatePayment = useCallback((id, updates) => {
    let updatedRecord = null;
    setPayments((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const merged = { ...item, ...updates };
        const expected = Number(merged.expectedSalary) || 0;
        const ot = Number(merged.overtimeEarnings) || 0;
        const bonus = Number(merged.bonuses) || 0;
        const deduct = Number(merged.deductions) || 0;
        const net = expected + ot + bonus - deduct;
        const received = Number(merged.amountReceived) || 0;

        let paymentStatus = merged.paymentStatus;
        if (received >= net && net > 0) {
          paymentStatus = 'Paid';
        } else if (received > 0) {
          paymentStatus = 'Partially Paid';
        } else {
          paymentStatus = 'Pending';
        }

        updatedRecord = {
          ...merged,
          expectedSalary: expected,
          overtimeEarnings: ot,
          bonuses: bonus,
          deductions: deduct,
          netExpectedSalary: net,
          amountReceived: received,
          paymentStatus,
        };
        return updatedRecord;
      })
    );
    if (updatedRecord) {
      enqueueChange({ action: 'upsert', tabName: 'Payments', record: updatedRecord });
    }
    showToast('Payment record updated.');
  }, [setPayments, enqueueChange, showToast]);

  const addPartialPayment = useCallback((paymentId, partialData) => {
    const payment = data.payments.find((p) => p.id === paymentId);
    if (!payment) return;

    const amount = Number(partialData.amount) || 0;
    const newReceived = (Number(payment.amountReceived) || 0) + amount;
    const historyEntry = {
      id: `ph_${Date.now()}`,
      date: partialData.date || dayjs().format('YYYY-MM-DD'),
      amount,
      method: partialData.method || 'Bank Transfer',
      notes: partialData.notes || 'Partial payment received',
    };

    const newHistory = [...(payment.paymentHistory || []), historyEntry];
    let newStatus = 'Partially Paid';
    if (newReceived >= payment.netExpectedSalary && payment.netExpectedSalary > 0) {
      newStatus = 'Paid';
    }

    updatePayment(paymentId, {
      amountReceived: newReceived,
      paymentStatus: newStatus,
      paymentHistory: newHistory,
      paymentDate: partialData.date || payment.paymentDate,
    });
    showToast(`Added payment installment of ₹${amount}.`);
  }, [data.payments, updatePayment, showToast]);

  const deletePayment = useCallback((id) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
    enqueueChange({ action: 'delete', tabName: 'Payments', id });
    showToast('Payment record deleted.', 'info');
  }, [setPayments, enqueueChange, showToast]);

  // Shift Actions
  const updateShiftSettings = useCallback((newShifts) => {
    setShifts(newShifts);
    enqueueChange({ action: 'upsert', tabName: 'Shifts', record: newShifts });
    showToast('Shift configurations saved.');
  }, [setShifts, enqueueChange, showToast]);

  // Global Actions
  const handleExport = useCallback(() => {
    exportWorkTrackJSON();
    showToast('Data exported successfully.');
  }, [showToast]);

  const handleImport = useCallback((jsonContent) => {
    try {
      const parsed = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
      const loaded = importWorkTrackJSON(parsed);
      setData(loaded);
      showToast('Data imported successfully!');
    } catch (err) {
      showToast(`Import failed: ${err.message}`, 'error');
      throw err;
    }
  }, [showToast]);

  const handleResetDemo = useCallback(() => {
    const loaded = resetWorkTrackToDemo();
    setData(loaded);
    showToast('Reset to demo data completed.', 'info');
  }, [showToast]);

  const handleClearAll = useCallback(() => {
    const cleared = clearAllWorkTrackData();
    setData(cleared);
    showToast('All WorkTrack data cleared.', 'info');
  }, [showToast]);

  const value = {
    // State
    companies: data.companies,
    attendance: data.attendance,
    shifts: data.shifts,
    overtime: data.overtime,
    payments: data.payments,
    settings: data.settings,
    activeCompanyId: data.activeCompanyId,
    activeCompany,
    toasts,

    // Sync State
    syncConfig,
    pendingQueue,
    localFileName,
    isLocalFileLinked: Boolean(localFileHandle),
    isFileSystemSupported: isFileSystemAccessSupported(),

    // Save & Export Actions
    manualSaveData,
    downloadExcel,
    downloadBackupJSON,

    // Google Sheets Actions
    connectGoogleSheets,
    disconnectGoogleSheets,
    syncNow,
    retryFailedSync,
    toggleAutoSync,

    // Local PC File Actions
    linkLocalBackupFile: linkLocalFileHandler,
    unlinkLocalBackupFile: unlinkLocalFileHandler,

    // Standard Actions
    setActiveCompanyId,
    addCompany,
    updateCompany,
    deleteCompany,
    addAttendance,
    updateAttendance,
    deleteAttendance,
    addOvertime,
    updateOvertime,
    deleteOvertime,
    addPayment,
    updatePayment,
    deletePayment,
    addPartialPayment,
    updateShiftSettings,
    setSettings,
    showToast,
    removeToast,
    handleExport,
    handleImport,
    handleResetDemo,
    handleClearAll,
  };

  return (
    <WorkTrackContext.Provider value={value}>
      {children}
    </WorkTrackContext.Provider>
  );
}

export function useWorkTrack() {
  const context = useContext(WorkTrackContext);
  if (!context) {
    throw new Error('useWorkTrack must be used within a WorkTrackProvider');
  }
  return context;
}
