import React, { useState } from 'react';
import {
  X,
  Save,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive,
  ExternalLink,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  Copy,
  Check,
  Unlink,
} from 'lucide-react';
import { useWorkTrack } from '../../context/WorkTrackContext';
import { formatDate } from '../../utils/workTrackCalculations';

export function SaveAndSyncModal({ isOpen, onClose }) {
  const {
    syncConfig,
    pendingQueue,
    localFileName,
    isLocalFileLinked,
    isFileSystemSupported,
    manualSaveData,
    downloadExcel,
    downloadBackupJSON,
    connectGoogleSheets,
    disconnectGoogleSheets,
    syncNow,
    retryFailedSync,
    toggleAutoSync,
    linkLocalBackupFile,
    unlinkLocalBackupFile,
  } = useWorkTrack();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'connect' | 'guide'
  const [webAppUrlInput, setWebAppUrlInput] = useState(syncConfig.webAppUrl || '');
  const [spreadsheetIdInput, setSpreadsheetIdInput] = useState(syncConfig.spreadsheetId || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const handleConnectSubmit = async (e) => {
    e.preventDefault();
    setConnectError('');
    setIsConnecting(true);

    try {
      await connectGoogleSheets({
        webAppUrl: webAppUrlInput,
        spreadsheetId: spreadsheetIdInput,
      });
      setIsConnecting(false);
      setActiveTab('overview');
    } catch (err) {
      setIsConnecting(false);
      setConnectError(err.message || 'Failed to connect. Please verify deployment URL.');
    }
  };

  const sampleAppsScriptCode = `// Google Apps Script Web App for My WorkTrack
// 1. Open https://script.google.com -> New project
// 2. Paste code from worktrack-google-sheets-appscript.gs
// 3. Deploy as Web App (Execute as: "Me", Access: "Anyone")
// 4. Copy Web App URL into the Connect form above!`;

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(sampleAppsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-dark-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <RefreshCw size={20} className={syncConfig.syncStatus === 'syncing' ? 'animate-spin' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Save, Export & Google Sheets Sync
                </h3>
                {syncConfig.isConnected ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    ● Connected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    ● Local Only
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage local backups, multi-sheet Excel exports, and live Google Sheets integration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-dark-950/20 px-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Save & Sync Dashboard
          </button>
          <button
            onClick={() => setActiveTab('connect')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'connect'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {syncConfig.isConnected ? 'Configure Connection' : 'Connect Google Sheets'}
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'guide'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Setup Guide
          </button>
        </div>

        {/* Tab 1: Overview & Save Dashboard */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Quick Action Save Buttons Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Save & Export Options
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={manualSaveData}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 font-bold text-xs hover:bg-blue-100 transition shadow-xs"
                >
                  <Save size={16} />
                  <span>Save Data</span>
                </button>

                <button
                  onClick={downloadExcel}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 font-bold text-xs hover:bg-emerald-100 transition shadow-xs"
                >
                  <FileSpreadsheet size={16} />
                  <span>Download Excel (.xlsx)</span>
                </button>

                <button
                  onClick={downloadBackupJSON}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs hover:bg-slate-200 transition shadow-xs"
                >
                  <Download size={16} />
                  <span>Download Backup (JSON)</span>
                </button>
              </div>
            </div>

            {/* Google Sheets Sync Status Card */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-950/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Google Sheets Auto-Sync Status
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {syncConfig.isConnected
                      ? `Destination: ${syncConfig.spreadsheetName}`
                      : 'Not connected to Google Sheets'}
                  </p>
                </div>

                {/* Auto-Sync Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Auto-Sync
                  </span>
                  <button
                    onClick={() => toggleAutoSync(!syncConfig.autoSyncEnabled)}
                    className="text-blue-600 transition"
                    title={syncConfig.autoSyncEnabled ? 'Turn Auto-Sync OFF' : 'Turn Auto-Sync ON'}
                  >
                    {syncConfig.autoSyncEnabled ? (
                      <ToggleRight size={32} className="text-blue-600" />
                    ) : (
                      <ToggleLeft size={32} className="text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Status details strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center">
                <div className="p-2.5 rounded-xl bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">State</span>
                  <span
                    className={`font-black mt-0.5 block ${
                      syncConfig.syncStatus === 'synced'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : syncConfig.syncStatus === 'syncing'
                        ? 'text-blue-600 animate-pulse'
                        : syncConfig.syncStatus === 'failed'
                        ? 'text-rose-600'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {syncConfig.syncStatus.toUpperCase()}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Last Synced</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                    {syncConfig.lastSyncTime ? formatDate(syncConfig.lastSyncTime, 'DD MMM, HH:mm') : 'Never'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Pending Queue</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {pendingQueue.length} Changes
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Errors</span>
                  <span
                    className={`font-bold mt-0.5 block ${
                      syncConfig.lastError ? 'text-rose-600' : 'text-slate-400'
                    }`}
                  >
                    {syncConfig.lastError ? '1 Failed' : '0'}
                  </span>
                </div>
              </div>

              {/* Error message alert if failed */}
              {syncConfig.lastError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold">Sync Failure Notice:</p>
                    <p className="mt-0.5 leading-relaxed">{syncConfig.lastError}</p>
                  </div>
                  <button
                    onClick={retryFailedSync}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold shrink-0 hover:bg-rose-700 transition"
                  >
                    Retry Sync
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {syncConfig.isConnected ? (
                    <>
                      <button
                        onClick={syncNow}
                        disabled={syncConfig.syncStatus === 'syncing'}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition disabled:opacity-50"
                      >
                        <RefreshCw size={14} className={syncConfig.syncStatus === 'syncing' ? 'animate-spin' : ''} />
                        <span>Sync Now</span>
                      </button>

                      {syncConfig.spreadsheetUrl && (
                        <a
                          href={syncConfig.spreadsheetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-800"
                        >
                          <ExternalLink size={14} />
                          <span>Open Google Sheet</span>
                        </a>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => setActiveTab('connect')}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition"
                    >
                      <span>Connect Google Sheets</span>
                    </button>
                  )}
                </div>

                {syncConfig.isConnected && (
                  <button
                    onClick={disconnectGoogleSheets}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>

            {/* Local PC File Linking (File System Access API) */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-950/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <HardDrive size={18} className="text-slate-500" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Link Local PC Backup File (Optional)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Auto-updates a local JSON file directly on your computer via File System Access API
                    </p>
                  </div>
                </div>
              </div>

              {isFileSystemSupported ? (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  {isLocalFileLinked ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 size={15} />
                      <span>Linked: {localFileName}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">No local file currently linked</span>
                  )}

                  <div className="flex items-center gap-2">
                    {isLocalFileLinked ? (
                      <button
                        onClick={unlinkLocalBackupFile}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                      >
                        <Unlink size={13} />
                        <span>Unlink File</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => linkLocalBackupFile(false)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition"
                        >
                          Select Existing JSON File
                        </button>
                        <button
                          onClick={() => linkLocalBackupFile(true)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 transition"
                        >
                          + Create New Linked File
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  File System Access API is not supported in this browser. Please use the "Download Backup" button.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Connect Form */}
        {activeTab === 'connect' && (
          <form onSubmit={handleConnectSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {connectError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle size={16} className="shrink-0" />
                <span>{connectError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Google Apps Script Web App URL *
              </label>
              <input
                type="url"
                value={webAppUrlInput}
                onChange={(e) => setWebAppUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 outline-hidden transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Obtained from Google Apps Script → Deploy → New deployment → Web app.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Destination Spreadsheet ID (Optional)
              </label>
              <input
                type="text"
                value={spreadsheetIdInput}
                onChange={(e) => setSpreadsheetIdInput(e.target.value)}
                placeholder="e.g. 1ZnbGK9DTsMzD0nz2mWyGMtXHCUnb1AGM_LTrXSxF110"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 outline-hidden transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Leave empty to automatically use the default spreadsheet configured in your script.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/50 text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
              <span className="font-bold block mb-1">🔒 Secure Frontend Integration:</span>
              Your Google Apps Script runs under your own Google Account. No Google client secrets or private tokens are stored in the frontend. Connecting will immediately perform a full sync of all 7 tabs.
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isConnecting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition disabled:opacity-50"
              >
                {isConnecting && <RefreshCw size={14} className="animate-spin" />}
                <span>{isConnecting ? 'Testing & Connecting...' : 'Connect & Initial Sync'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Setup Guide */}
        {activeTab === 'guide' && (
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm leading-relaxed">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              Step-by-Step Google Sheets Setup Guide
            </h4>

            <ol className="space-y-3 list-decimal list-inside text-slate-600 dark:text-slate-300">
              <li>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  Open Google Apps Script:
                </span>{' '}
                Visit{' '}
                <a
                  href="https://script.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline font-bold"
                >
                  script.google.com
                </a>{' '}
                and create a <strong>New project</strong>.
              </li>
              <li>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  Paste the Code:
                </span>{' '}
                Copy the complete script from the project file{' '}
                <code className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-dark-800 font-mono text-xs">
                  worktrack-google-sheets-appscript.gs
                </code>{' '}
                into <code className="font-mono text-xs">Code.gs</code>.
              </li>
              <li>
                <span className="font-bold text-slate-800 dark:text-slate-100">Deploy as Web App:</span>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-slate-500">
                  <li>Click <strong>Deploy</strong> → <strong>New deployment</strong>.</li>
                  <li>Click gear icon next to "Select type" and choose <strong>Web app</strong>.</li>
                  <li>Set <strong>Execute as:</strong> "Me".</li>
                  <li>Set <strong>Who has access:</strong> "Anyone".</li>
                  <li>Click <strong>Deploy</strong> and grant required permissions.</li>
                </ul>
              </li>
              <li>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  Copy Web App URL:
                </span>{' '}
                Copy the generated Web App URL and paste it into the <strong>Connect Google Sheets</strong> tab above.
              </li>
            </ol>

            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Script Location in your workspace:
                </span>
                <span className="text-xs font-mono text-blue-600 font-bold">
                  worktrack-google-sheets-appscript.gs
                </span>
              </div>
              <p className="text-xs text-slate-500">
                A ready-to-use Google Apps Script file has already been saved into your project root directory. You can view or copy it directly into your Google project.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveTab('connect')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                Go to Connect Form →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
