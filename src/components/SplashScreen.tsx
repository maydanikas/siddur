import { useEffect, useState, useRef } from 'react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const started = useRef(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    document.getElementById('static-splash')?.remove();

    const fadeTimer = setTimeout(() => setIsExiting(true), 2000);
    const finishTimer = setTimeout(() => onFinishRef.current(), 2600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0D9488',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isExiting ? 0 : 1,
        transition: 'opacity 0.6s ease',
      }}
    >
      <span style={{ color: 'white', fontSize: 160, lineHeight: 1, fontFamily: 'serif' }}>ש</span>
      <span
        style={{
          position: 'absolute',
          bottom: 64,
          color: 'white',
          fontSize: 32,
          letterSpacing: 6,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        SHAHARIS
      </span>
    </div>
  );
}
