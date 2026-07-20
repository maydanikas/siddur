import { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [hide, setHide] = useState(false);
  useEffect(() => {
    setTimeout(() => setHide(true), 2000);
    setTimeout(onFinish, 2600);
  }, [onFinish]);
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0D9488', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: hide? 0 : 1, transition: 'opacity 0.6s ease'
    }}>
      <span style={{ color: 'white', fontSize: 160 }}>ש</span>
      <span style={{ position: 'absolute', bottom: 64, color: 'white', fontSize: 28, letterSpacing: 6 }}>
        SHAHARIS
      </span>
    </div>
  );
}