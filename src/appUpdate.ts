export type AppUpdateRegistration = {
  installing: unknown;
  update(): Promise<void>;
};

type UpdateResponse = {
  status: number;
  cancel(): Promise<void>;
};

export type AppUpdateHost = {
  online(): boolean;
  fetch(url: string): Promise<UpdateResponse>;
  listen(onReturn: () => void): () => void;
};

const browserHost: AppUpdateHost = {
  online: () => navigator.onLine,
  async fetch(url) {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        cache: 'no-store',
        'cache-control': 'no-cache',
      },
    });
    return {
      status: response.status,
      cancel: async () => {
        await response.body?.cancel();
      },
    };
  },
  listen(onReturn) {
    const onVisible = () => {
      if (document.visibilityState === 'visible') onReturn();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', onReturn);
    window.addEventListener('focus', onReturn);
    window.addEventListener('online', onReturn);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pageshow', onReturn);
      window.removeEventListener('focus', onReturn);
      window.removeEventListener('online', onReturn);
    };
  },
};

/** Ask the browser whether sw.js changed. A new worker then reloads the page itself. */
export async function checkForAppUpdate(
  swUrl: string,
  registration: AppUpdateRegistration,
  host: AppUpdateHost,
): Promise<boolean> {
  if (registration.installing) return false;
  if (!host.online()) return false;
  try {
    const response = await host.fetch(swUrl);
    await response.cancel();
    if (response.status !== 200) return false;
    await registration.update();
    return true;
  } catch {
    return false;
  }
}

/**
 * Check when the reader comes back to an app that was left open.
 * One check at a time: opening fires visibility, focus and pageshow together.
 */
export function watchAppUpdate(
  swUrl: string,
  registration: AppUpdateRegistration,
  host: AppUpdateHost = browserHost,
): () => void {
  let checking = false;
  const onReturn = () => {
    if (checking) return;
    checking = true;
    void checkForAppUpdate(swUrl, registration, host).finally(() => {
      checking = false;
    });
  };
  return host.listen(onReturn);
}
