import React, { useState, useRef } from 'react';
import {
  Settings,
  Download,
  Upload,
  RefreshCcw,
  Trash2,
  ShieldAlert,
  Database,
  CheckCircle2,
  Sliders,
  DollarSign,
  FileJson,
  FileSpreadsheet,
  Save,
  Cloud,
  RefreshCw,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  HardDrive,
  Unlink,
  AlertCircle,
} from 'lucide-react';
import { useWorkTrack } from '../context/WorkTrackContext';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { SaveAndSyncModal } from '../components/sync/SaveAndSyncModal';
import { formatDate } from '../utils/workTrackCalculations';

export function WorkTrackSettingsPage() {
  const {
    settings,
    setSettings,
    handleExport,
    handleImport,
    handleResetDemo,
    handleClearAll,
    companies,
    attendance,
    overtime,
    payments,
    // Sync context
    syncConfig,
    pendingQueue,
    localFileName,
    isLocalFileLinked,
    isFileSystemSupported,
    manualSaveData,
    downloadExcel,
    downloadBackupJSON,
    disconnectGoogleSheets,
    syncNow,
    retryFailedSync,
    toggleAutoSync,
    linkLocalBackupFile,
    unlinkLocalBackupFile,
  } = useWorkTrack();

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result;
        handleImport(json);
      } catch (err) {
        console.error('Import error:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          WorkTrack Settings & Data Management
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure salary formulas, overtime multipliers, backup data to JSON, and Google Sheets auto-sync
        </p>
      </div>

      {/* DEDICATED SECTION 15: Save, Export & Google Sheets Auto-Sync */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Cloud size={22} className={syncConfig.syncStatus === 'syncing' ? 'animate-pulse' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Save, Export & Google Sheets Auto-Sync
                </h3>
                {syncConfig.isConnected ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    ● Connected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    ● Offline / Local
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct export to Excel, JSON backup, and synchronized spreadsheet tabs
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 transition self-start sm:self-auto"
          >
            <Settings size={14} />
            <span>Open Sync Wizard</span>
          </button>
        </div>

        {/* The 6 Save Options Buttons */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            1. Save & Export Controls
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Button 1: Save Data */}
            <button
              onClick={manualSaveData}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 font-bold text-xs hover:bg-blue-100 transition shadow-xs text-center"
            >
              <Save size={18} />
              <span>Save Data</span>
              <span className="text-[10px] opacity-75 font-normal">LocalStorage</span>
            </button>

            {/* Button 2: Download Excel */}
            <button
              onClick={downloadExcel}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 font-bold text-xs hover:bg-emerald-100 transition shadow-xs text-center"
            >
              <FileSpreadsheet size={18} />
              <span>Download Excel</span>
              <span className="text-[10px] opacity-75 font-normal">.xlsx Workbook</span>
            </button>

            {/* Button 3: Download Backup (JSON) */}
            <button
              onClick={downloadBackupJSON}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs hover:bg-slate-200 transition shadow-xs text-center"
            >
              <Download size={18} />
              <span>Download Backup</span>
              <span className="text-[10px] opacity-75 font-normal">Full JSON</span>
            </button>

            {/* Button 4: Connect Google Sheets */}
            {syncConfig.isConnected ? (
              <button
                onClick={disconnectGoogleSheets}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 font-bold text-xs hover:bg-rose-100 transition shadow-xs text-center"
              >
                <Unlink size={18} />
                <span>Disconnect</span>
                <span className="text-[10px] opacity-75 font-normal">Google Sheets</span>
              </button>
            ) : (
              <button
                onClick={() => setIsSyncModalOpen(true)}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 font-bold text-xs hover:bg-indigo-100 transition shadow-xs text-center"
              >
                <Cloud size={18} />
                <span>Connect Sheets</span>
                <span className="text-[10px] opacity-75 font-normal">Web App URL</span>
              </button>
            )}

            {/* Button 5: Sync Now */}
            <button
              onClick={syncNow}
              disabled={syncConfig.syncStatus === 'syncing' || !syncConfig.isConnected}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-md shadow-blue-600/20 text-center disabled:opacity-40"
            >
              <RefreshCw size={18} className={syncConfig.syncStatus === 'syncing' ? 'animate-spin' : ''} />
              <span>Sync Now</span>
              <span className="text-[10px] opacity-75 font-normal">All 7 Tabs</span>
            </button>

            {/* Button 6: Auto-Sync ON/OFF */}
            <button
              onClick={() => toggleAutoSync(!syncConfig.autoSyncEnabled)}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border font-bold text-xs transition shadow-xs text-center ${
                syncConfig.autoSyncEnabled
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-dark-800 text-slate-500 border-slate-200 dark:border-slate-700'
              }`}
            >
              {syncConfig.autoSyncEnabled ? (
                <ToggleRight size={22} className="text-emerald-600" />
              ) : (
                <ToggleLeft size={22} className="text-slate-400" />
              )}
              <span>Auto-Sync {syncConfig.autoSyncEnabled ? 'ON' : 'OFF'}</span>
              <span className="text-[10px] opacity-75 font-normal">On every edit</span>
            </button>
          </div>
        </div>

        {/* Sync Dashboard Status Ribbon */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            2. Live Sync Dashboard
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Google Account</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                {syncConfig.isConnected ? 'Connected' : 'Not Linked'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Spreadsheet</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block truncate">
                {syncConfig.spreadsheetName || 'Default'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Last Successful Sync</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block truncate">
                {syncConfig.lastSyncTime ? formatDate(syncConfig.lastSyncTime, 'DD MMM, HH:mm') : 'Never'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pending Queue</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                {pendingQueue.length} Changes
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-200/80 dark:border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sync Status</span>
              <span className={`font-black mt-1 block ${
                syncConfig.syncStatus === 'synced'
                  ? 'text-emerald-600'
                  : syncConfig.syncStatus === 'syncing'
                  ? 'text-blue-600'
                  : syncConfig.syncStatus === 'failed'
                  ? 'text-rose-600'
                  : 'text-amber-600'
              }`}>
                {syncConfig.syncStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Sync Failure notice if any */}
        {syncConfig.lastError && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
              <AlertCircle size={16} className="shrink-0" />
              <span><strong>Failed Sync:</strong> {syncConfig.lastError}</span>
            </div>
            <button
              onClick={retryFailedSync}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition shrink-0"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* Local PC File Linking */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-950 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <HardDrive size={18} className="text-slate-500" />
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Linked Local PC Backup File (File System Access API)
              </span>
              <span className="text-[11px] text-slate-500 block">
                {isLocalFileLinked
                  ? `Active File: ${localFileName}`
                  : 'Optionally link a local file to auto-update on your disk'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLocalFileLinked ? (
              <button
                onClick={unlinkLocalBackupFile}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 transition"
              >
                Unlink File
              </button>
            ) : isFileSystemSupported ? (
              <>
                <button
                  onClick={() => linkLocalBackupFile(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition"
                >
                  Link Existing File
                </button>
                <button
                  onClick={() => linkLocalBackupFile(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 transition"
                >
                  + New Local File
                </button>
              </>
            ) : (
              <span className="text-xs text-slate-400 italic">API Not supported in this browser</span>
            )}
          </div>
        </div>
      </div>

      {/* Salary & Attendance Policy Rules */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Sliders size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Default Calculation Policies
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rules governing leave compensations and overtime rate multiplier
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Primary Salary Calculation Method
            </label>
            <select
              value={settings?.calculationMethod || 'monthly_divided_by_scheduled'}
              onChange={(e) => handleSettingChange('calculationMethod', e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white font-medium"
            >
              <option value="monthly_divided_by_scheduled">Monthly Salary ÷ Scheduled Working Days</option>
              <option value="monthly_divided_by_calendar">Monthly Salary ÷ Calendar Days</option>
              <option value="custom">Custom Daily Rate</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Default Overtime Multiplier
            </label>
            <select
              value={settings?.defaultOvertimeMultiplier || 1.5}
              onChange={(e) => handleSettingChange('defaultOvertimeMultiplier', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white font-medium"
            >
              <option value="1.0">1.0x (Normal Pay)</option>
              <option value="1.25">1.25x (125%)</option>
              <option value="1.5">1.5x (150% - Standard)</option>
              <option value="2.0">2.0x (Double Pay)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Default Standard Working Hours / Day
            </label>
            <input
              type="number"
              value={settings?.defaultStandardHours || 8}
              onChange={(e) => handleSettingChange('defaultStandardHours', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Paid Leave Pay Percentage
            </label>
            <select
              value={settings?.paidLeavePayPercent ?? 100}
              onChange={(e) => handleSettingChange('paidLeavePayPercent', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white font-medium"
            >
              <option value="100">100% (Full Pay)</option>
              <option value="50">50% (Half Pay)</option>
              <option value="0">0% (Unpaid)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Half Day Pay Percentage
            </label>
            <select
              value={settings?.halfDayPayPercent ?? 50}
              onChange={(e) => handleSettingChange('halfDayPayPercent', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white font-medium"
            >
              <option value="50">50%</option>
              <option value="60">60%</option>
              <option value="40">40%</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Weekly Off Pay Included
            </label>
            <select
              value={settings?.weeklyOffPayPercent ?? 100}
              onChange={(e) => handleSettingChange('weeklyOffPayPercent', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white font-medium"
            >
              <option value="100">100% (Full Pay Included)</option>
              <option value="0">0% (Unpaid)</option>
            </select>
          </div>
        </div>
      </div>

      {/* LocalStorage Data Status */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Database size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              LocalStorage Data Persistence
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All company, attendance, overtime, shift, and payment data persists across browser refreshes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Companies</span>
            <span className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1 block">
              {companies.length} Saved
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Attendance</span>
            <span className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1 block">
              {attendance.length} Records
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Overtime</span>
            <span className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1 block">
              {overtime.length} Logs
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Payments</span>
            <span className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1 block">
              {payments.length} Months
            </span>
          </div>
        </div>
      </div>

      {/* Backup & Restore Controls */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Backup, Export & Import Data
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Download your complete WorkTrack dataset as a standalone JSON file, or restore from a previous backup
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition active:scale-95"
          >
            <Download size={16} />
            <span>Export Backup (JSON)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <Upload size={16} />
            <span>Import Backup (JSON)</span>
          </button>

          <button
            onClick={() => setConfirmResetOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 transition"
          >
            <RefreshCcw size={16} />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={() => setConfirmClearOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition ml-auto"
          >
            <Trash2 size={16} />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={() => {
          handleClearAll();
          setConfirmClearOpen(false);
        }}
        title="Clear All WorkTrack Data?"
        message="This will permanently delete all companies, daily attendance, overtime, and salary payment records from your LocalStorage. Make sure to export a backup JSON file first."
        confirmText="Yes, Clear Everything"
      />

      <ConfirmModal
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={() => {
          handleResetDemo();
          setConfirmResetOpen(false);
        }}
        title="Reset to Demo Data?"
        message="This will overwrite current records with pre-configured sample companies, attendance, overtime, and salary records."
        confirmText="Reset to Demo"
        isDanger={false}
      />

      {/* Save & Sync Wizard Modal */}
      <SaveAndSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
}
