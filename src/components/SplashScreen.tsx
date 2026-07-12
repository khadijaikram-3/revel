import { useEffect, useState } from 'react';

const SPLASH_KEY = 'revel_splash_seen';
const PULSE_DURATION = 2000;
const FADE_DELAY = 2500;
const FADE_DURATION = 600;

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SPLASH_KEY)) return;
    sessionStorage.setItem(SPLASH_KEY, '1');
    setVisible(true);

    const fadeTimer = setTimeout(() => setFadingOut(true), FADE_DELAY);
    const removeTimer = setTimeout(() => setVisible(false), FADE_DELAY + FADE_DURATION);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden transition-opacity duration-500 ${
        fadingOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, #E11D48 0%, #E11D48 45%, #0A0A0A 55%, #0A0A0A 100%)',
      }}
    >
      <h1
        className="font-orbitron font-extrabold text-5xl sm:text-7xl md:text-8xl tracking-[0.2em] text-white select-none animate-splash-pulse"
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
