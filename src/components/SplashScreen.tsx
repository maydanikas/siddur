import { useEffect, useState, useRef } from 'react';
export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [hide, setHide] = useState(false);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return; started.current = true;
    const staticEl = document.getElementById('static-splash');
    if (staticEl) { staticEl.remove(); }
    const t1 = setTimeout(() => setHide(true), 2000);
    const t2 = setTimeout(() => onFinish(), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onFinish]);
  return (
    <div style={{
      position:'fixed', inset:0, background:'#0D9488', zIndex:10000,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      opacity: hide?0:1, transition:'opacity 0.6s ease',
    }}>
      <span style={{ color:'white', fontSize:160, lineHeight:1, fontFamily:'serif' }}>ש</span>
      <span style={{ position:'absolute', bottom:64, color:'white', fontSize:32, letterSpacing:6 }}>SHAHARIS</span>
    </div>
  );
}