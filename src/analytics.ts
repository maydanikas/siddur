import type { Lang } from './supportCopy';

const MEASUREMENT_ID = 'G-S1FTV53ZJG';

type Gtag = (...args: unknown[]) => void;

export type SupportButton = 'netherlands' | 'world';

function send() {
  return (window as Window & { gtag?: Gtag }).gtag;
}

function readTag(field: string, timeoutMs = 1000): Promise<string> {
  const gtag = send();
  return new Promise((resolve) => {
    if (!gtag) {
      resolve('');
      return;
    }
    let settled = false;
    const finish = (value: unknown) => {
      if (settled) return;
      settled = true;
      resolve(value == null ? '' : String(value));
    };
    gtag('get', MEASUREMENT_ID, field, finish);
    window.setTimeout(() => finish(''), timeoutMs);
  });
}

function collect(eventName: string, fields: Record<string, string>, title: string, timeoutMs = 1000) {
  void (async () => {
    const [cid, sid, sct] = await Promise.all([
      readTag('client_id', timeoutMs),
      readTag('session_id', timeoutMs),
      readTag('session_number', timeoutMs),
    ]);
    if (!cid) return;
    const params = new URLSearchParams({
      v: '2',
      tid: MEASUREMENT_ID,
      cid,
      sid,
      sct: sct || '1',
      seg: '1',
      en: eventName,
      dl: window.location.href,
      dt: title,
      ...fields,
    });
    const url = `https://www.google-analytics.com/g/collect?${params}`;
    if (!navigator.sendBeacon?.(url)) {
      void fetch(url, { method: 'POST', mode: 'no-cors', keepalive: true });
    }
  })();
}

export function trackPageView(title: string, path: string) {
  const gtag = send();
  if (!gtag) return;
  gtag('event', 'page_view', {
    page_title: title,
    page_path: path,
    page_location: `${window.location.origin}${path}`,
  });
}

export function trackAboutPage() {
  trackPageView('About — Shacharis', '/about');
}

export function trackSupportClick(button: SupportButton) {
  const eventName = button === 'netherlands' ? 'support_netherlands' : 'support_world';
  collect(eventName, { 'ep.support_button': button }, 'About');
}

/** Sent only when the reader turns a reminder on, not when the app opens again. */
export function trackReminderOn(time: string) {
  collect('reminder_on', { 'ep.reminder_time': time }, 'About', 5000);
}

/** One event per open, and another when the reader switches language. */
export function trackLanguage(lang: Lang) {
  collect(`language_${lang}`, { 'ep.language': lang }, document.title, 5000);
}

type StandaloneNavigator = Navigator & { standalone?: boolean };

/** Home-screen launch. A browser tab is display-mode: browser. */
export function isInstalledApp(): boolean {
  try {
    const nav = navigator as StandaloneNavigator;
    return nav.standalone === true
      || window.matchMedia('(display-mode: standalone), (display-mode: minimal-ui), (display-mode: fullscreen)').matches;
  } catch {
    return false;
  }
}

/** Browser tab and installed icon each send their own event, once per open. */
export function trackAppOpen(installed = isInstalledApp()) {
  collect(installed ? 'open_installed' : 'open_browser', {
    'ep.display_mode': installed ? 'installed' : 'browser',
  }, document.title, 5000);
}
