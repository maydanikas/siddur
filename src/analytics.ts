type Gtag = (...args: unknown[]) => void;

function send() {
  return (window as Window & { gtag?: Gtag }).gtag;
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
