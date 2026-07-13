import { useEffect, useState } from 'react';

const SPLASH_KEY = 'revel_splash_seen';
const VISIBLE_DURATION = 3000;
const FADE_DURATION = 600;

export default function SplashScreen() {
  const [visible, setVisible] = useState(() => !sessionStorage.getItem(SPLASH_KEY));
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (!visible) return;
    sessionStorage.setItem(SPLASH_KEY, '1');

    const fadeTimer = setTimeout(() => setFadingOut(true), VISIBLE_DURATION);
    const removeTimer = setTimeout(() => setVisible(false), VISIBLE_DURATION + FADE_DURATION);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-[600ms] ${
        fadingOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ background: '#0A0A0A' }}
    >
      <img
        src="/revel_logo.jpeg"
        alt="Revel"
        className="h-24 w-auto sm:h-28 md:h-32 rounded-lg select-none animate-splash-pulse mb-6"
        style={{
          boxShadow: '0 0 25px rgba(225, 29, 72, 0.4), 0 0 60px rgba(225, 29, 72, 0.2)',
        }}
      />
      <h1
        className="font-orbitron font-extrabold text-5xl sm:text-7xl tracking-[0.2em] text-white select-none animate-splash-pulse"
        style={{
          textShadow:
            '0 0 10px rgba(225, 29, 72, 0.8), 0 0 25px rgba(225, 29, 72, 0.6), 0 0 50px rgba(225, 29, 72, 0.4)',
        }}
      >
        REVEL
      </h1>
    </div>
  );
}
