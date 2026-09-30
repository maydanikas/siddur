const MEASUREMENT_ID = 'G-S1FTV53ZJG';

type Gtag = (...args: unknown[]) => void;

export type SupportButton = 'netherlands' | 'world';

function send() {
  return (window as Window & { gtag?: Gtag }).gtag;
}

function readTag(field: string): Promise<string> {
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
    window.setTimeout(() => finish(''), 1000);
  });
}

export function trackAboutPage() {
  const gtag = send();
  if (!gtag) return;
  gtag('event', 'page_view', {
    page_title: 'About',
    page_path: '/about',
    page_location: `${window.location.origin}/about`,
  });
}

export function trackSupportClick(button: SupportButton) {
  const eventName = button === 'netherlands' ? 'support_netherlands' : 'support_world';
  void (async () => {
    const [cid, sid, sct] = await Promise.all([
      readTag('client_id'),
      readTag('session_id'),
      readTag('session_number'),
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
      dt: 'About',
      'ep.support_button': button,
    });
    const url = `https://www.google-analytics.com/g/collect?${params}`;
    if (!navigator.sendBeacon?.(url)) {
      void fetch(url, { method: 'POST', mode: 'no-cors', keepalive: true });
    }
  })();
}
