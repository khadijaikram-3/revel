import { useEffect, useState } from 'react';

const SPLASH_KEY = 'revel_splash_seen';
const VISIBLE_DURATION = 3000;
const FADE_DURATION = 600;

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SPLASH_KEY)) return;
    sessionStorage.setItem(SPLASH_KEY, '1');
    setVisible(true);

    const fadeTimer = setTimeout(() => setFadingOut(true), VISIBLE_DURATION);
    const removeTimer = setTimeout(() => setVisible(false), VISIBLE_DURATION + FADE_DURATION);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden transition-opacity duration-[600ms] ${
        fadingOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ background: '#0A0A0A' }}
    >
      <img
        src="/revel_logo.jpeg"
        alt="Revel"
        className="h-24 w-auto sm:h-28 md:h-32 rounded-lg select-none animate-splash-pulse"
        style={{
          boxShadow: '0 0 25px rgba(225, 29, 72, 0.4), 0 0 60px rgba(225, 29, 72, 0.2)',
        }}
      />
    </div>
  );
}
