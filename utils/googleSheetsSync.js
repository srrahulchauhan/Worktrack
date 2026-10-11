import dayjs from 'dayjs';

const SYNC_CONFIG_KEY = 'worktrack_google_sync_config_v1';
const PENDING_QUEUE_KEY = 'worktrack_sync_pending_queue_v1';

export const DEFAULT_SYNC_CONFIG = {
  isConnected: false,
  webAppUrl: '',
  spreadsheetId: '',
  spreadsheetName: 'My WorkTrack Google Sheet',
  spreadsheetUrl: '',
  autoSyncEnabled: true,
  lastSyncTime: null,
  syncStatus: 'idle', // 'idle' | 'syncing' | 'synced' | 'pending' | 'failed'
  lastError: null,
};

export function loadSyncConfig() {
  try {
    const raw = localStorage.getItem(SYNC_CONFIG_KEY);
    return raw ? { ...DEFAULT_SYNC_CONFIG, ...JSON.parse(raw) } : DEFAULT_SYNC_CONFIG;
  } catch (err) {
    return DEFAULT_SYNC_CONFIG;
  }
}

export function saveSyncConfig(config) {
  try {
    localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save sync config:', err);
  }
}

export function loadPendingQueue() {
  try {
    const raw = localStorage.getItem(PENDING_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function savePendingQueue(queue) {
  try {
    localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to save pending queue:', err);
  }
}

/**
 * Send request to Google Apps Script Web App
 */
export async function sendToGoogleSheets(webAppUrl, payload) {
  if (!webAppUrl || !webAppUrl.trim()) {
    throw new Error('Google Apps Script Web App URL is not configured.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

  try {
    // Send as text/plain to avoid pre-flight CORS preflight restrictions on Google Apps Script
    const response = await fetch(webAppUrl.trim(), {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Google Sheets responded with HTTP status ${response.status}`);
    }

    const data = await response.json();
    if (!data.success && data.error) {
      throw new Error(data.message || data.error);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Google Sheets sync request timed out (20s). Please check your internet connection.');
    }
    throw err;
  }
}

/**
 * Ping / Test Google Sheets Web App Connection
 */
export async function testGoogleSheetsConnection(webAppUrl) {
  if (!webAppUrl) {
    throw new Error('Please enter your Google Apps Script Web App URL.');
  }

  try {
    const testPayload = {
      action: 'ping',
      timestamp: new Date().toISOString(),
    };
    const res = await sendToGoogleSheets(webAppUrl, testPayload);
    return res;
  } catch (err) {
    // If POST ping returns or gives CORS, try a GET healthcheck
    try {
      const getRes = await fetch(webAppUrl.trim(), { method: 'GET' });
      if (getRes.ok) {
        return { success: true, message: 'Google Apps Script Web App is accessible.' };
      }
    } catch (getErr) {
      // ignore
    }
    throw new Error(`Connection test failed: ${err.message}. Ensure deployment is set to Execute as: "Me" and Who has access: "Anyone".`);
  }
}

/**
 * Perform a complete full sync of all 7 tabs
 */
export async function executeFullSync(config, allData) {
  const payload = {
    action: 'full_sync',
    spreadsheetId: config.spreadsheetId,
    data: allData,
    syncedAt: new Date().toISOString(),
  };

  const result = await sendToGoogleSheets(config.webAppUrl, payload);
  return result;
}
