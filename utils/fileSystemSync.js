/**
 * File System Access API helper for optional local PC file linking
 */

export function isFileSystemAccessSupported() {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;
}

let activeFileHandle = null;

export async function linkLocalBackupFile() {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API is not supported by your current browser. Please use the Download Backup button.');
  }

  try {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: 'JSON Backup Files',
          accept: {
            'application/json': ['.json'],
          },
        },
      ],
      multiple: false,
    });

    // Verify permission
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

export async function createAndLinkNewLocalFile() {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API is not supported by your browser.');
  }

  try {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: `my-worktrack-local-backup-${new Date().toISOString().slice(0, 10)}.json`,
      types: [
        {
          description: 'JSON Backup Files',
          accept: { 'application/json': ['.json'] },
        },
      ],
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
    const writable = await handle.createWritable();
    const jsonStr = JSON.stringify(data, null, 2);
    await writable.write(jsonStr);
    await writable.close();
    return { success: true };
  } catch (err) {
    console.error('Failed to write to linked local file:', err);
    throw new Error(`Failed to update linked file: ${err.message}`);
  }
}
