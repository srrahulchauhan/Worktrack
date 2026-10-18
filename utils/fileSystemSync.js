import { generateWorkTrackExcelBuffer } from './excelExport';

/**
 * File System Access API helper for live local PC file linking (Excel .xlsx and JSON)
 */
export function isFileSystemAccessSupported() {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;
}

let activeFileHandle = null;

export async function linkLocalBackupFile() {
  if (!isFileSystemAccessSupported()) {
    throw new Error(
      'File System Access API is not supported by your current browser. Please use the Download Excel button.'
    );
  }

  try {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: 'Excel Workbook (.xlsx)',
          accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
          },
        },
        {
          description: 'JSON Backup Files (.json)',
          accept: {
            'application/json': ['.json'],
          },
        },
      ],
      multiple: false,
    });

    const permission = await fileHandle.requestPermission({ mode: 'readwrite' });
    if (permission !== 'granted') {
      throw new Error('Read/Write permission was not granted for the chosen file.');
    }

    activeFileHandle = fileHandle;
    return {
      success: true,
      fileName: fileHandle.name,
      fileHandle,
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { cancelled: true };
    }
    throw err;
  }
}

export async function createAndLinkNewLocalFile(type = 'xlsx') {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API is not supported by your browser.');
  }

  try {
    const isExcel = type === 'xlsx';
    const suggestedName = isExcel
      ? `My-WorkTrack-Live-${new Date().toISOString().slice(0, 10)}.xlsx`
      : `my-worktrack-backup-${new Date().toISOString().slice(0, 10)}.json`;

    const types = isExcel
      ? [
          {
            description: 'Excel Workbook (.xlsx)',
            accept: {
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            },
          },
        ]
      : [
          {
            description: 'JSON Backup Files (.json)',
            accept: { 'application/json': ['.json'] },
          },
        ];

    const fileHandle = await window.showSaveFilePicker({
      suggestedName,
      types,
    });

    const permission = await fileHandle.requestPermission({ mode: 'readwrite' });
    if (permission !== 'granted') {
      throw new Error('Permission not granted to write to the chosen file.');
    }

    activeFileHandle = fileHandle;
    return {
      success: true,
      fileName: fileHandle.name,
      fileHandle,
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { cancelled: true };
    }
    throw err;
  }
}

export async function writeToLinkedLocalFile(fileHandle, data) {
  const handle = fileHandle || activeFileHandle;
  if (!handle) {
    throw new Error('No local file is currently linked.');
  }

  try {
    const fileName = handle.name || '';
    const isExcel = fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls');

    const writable = await handle.createWritable();

    if (isExcel) {
      const buffer = generateWorkTrackExcelBuffer(data);
      await writable.write(buffer);
    } else {
      const jsonStr = JSON.stringify(data, null, 2);
      await writable.write(jsonStr);
    }

    await writable.close();
    return { success: true };
  } catch (err) {
    console.error('Failed to write to linked local file:', err);
    throw new Error(`Failed to update linked file: ${err.message}`);
  }
}
