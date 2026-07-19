import { useEffect, useState } from 'react';

const SPLASH_KEY = 'revel_splash_seen';
const VISIBLE_DURATION = 2500;
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
      style={{
        background: 'linear-gradient(135deg, #E11D48 0%, #E11D48 48%, #0A0A0A 52%, #0A0A0A 100%)',
      }}
    >
      <img
        src="/revel_logo.jpeg"
        alt="Revel"
        className="w-32 sm:w-36 h-auto rounded-lg select-none animate-splash-pulse relative z-20"
        style={{
          boxShadow:
            '0 0 25px rgba(225, 29, 72, 0.6), 0 0 60px rgba(225, 29, 72, 0.3), 0 0 100px rgba(225, 29, 72, 0.15)',
        }}
      />

      {/* Glowing red scan line — sweeps top to bottom over 2.5s, above the logo */}
      <div
        className="absolute left-0 right-0 h-[3px] animate-splash-scan z-30 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(225, 29, 72, 0.9), #FF3B5C, rgba(225, 29, 72, 0.9), transparent)',
          boxShadow: '0 0 12px rgba(225, 29, 72, 0.8), 0 0 30px rgba(225, 29, 72, 0.5)',
        }}
      />
    </div>
  );
}
