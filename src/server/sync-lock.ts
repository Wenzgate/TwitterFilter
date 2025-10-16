let isRunning = false;

export async function withSyncLock<T>(fn: () => Promise<T>): Promise<T> {
  if (isRunning) {
    throw new Error('Sync already running');
  }

  isRunning = true;
  try {
    return await fn();
  } finally {
    isRunning = false;
  }
}
