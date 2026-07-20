import { useEffect, useState } from 'react';

const SPLASH_KEY = 'revel_splash_seen';
const VISIBLE_DURATION = 2500;
const FADE_DURATION = 600;

export default function SplashScreen() {
  const [visible, setVisible] = useState(() => !sessionStorage.getItem(SPLASH_KEY));
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (!visible) return;

    // ✅ Hide the landing page content behind splash
    document.body.style.overflow = 'hidden';
    
    // Hide main app content
    const mainContent = document.querySelector('#root > div:not(.splash-overlay)');
    if (mainContent) {
      (mainContent as HTMLElement).style.display = 'none';
    }

    sessionStorage.setItem(SPLASH_KEY, '1');

    const fadeTimer = setTimeout(() => setFadingOut(true), VISIBLE_DURATION);
    const removeTimer = setTimeout(() => {
      setVisible(false);
      
      // ✅ Show the landing page again after splash is done
      document.body.style.overflow = '';
      const mainContent = document.querySelector('#root > div:not(.splash-overlay)');
      if (mainContent) {
        (mainContent as HTMLElement).style.display = '';
      }
    }, VISIBLE_DURATION + FADE_DURATION);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      // ✅ Cleanup in case component unmounts
      document.body.style.overflow = '';
      const mainContent = document.querySelector('#root > div:not(.splash-overlay)');
      if (mainContent) {
        (mainContent as HTMLElement).style.display = '';
      }
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="splash-overlay fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-[600ms]"
      style={{
        opacity: fadingOut ? 0 : 1,
        background:
          'radial-gradient(circle at center, rgba(225,29,72,0.12) 0%, #0A0A0A 45%, #050505 100%)',
      }}
    >
      <img
        src="/revel_logo.jpeg"
        alt="Revel"
        className="w-36 h-36 rounded-xl object-cover animate-splash-pulse relative z-20"
        style={{
          boxShadow:
            "0 0 20px rgba(225,29,72,.35),0 0 60px rgba(225,29,72,.18)"
        }}
      />
      <h1 className="mt-8 font-orbitron text-5xl font-black tracking-[0.35em] uppercase">
        <span className="text-danger">R</span>
        <span className="text-white">EVEL</span>
      </h1>
      <p className="mt-3 text-gray-400 tracking-[0.25em] uppercase text-sm">
        Reveal the Risk. Close the Hole.
      </p>

      {/* Glowing red scan line — sweeps top to bottom over 2.5s */}
      <div
        className="absolute left-0 right-0 h-10 animate-splash-scan pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(225,29,72,.25), rgba(225,29,72,.8), rgba(225,29,72,.25), transparent)",
          filter: "blur(2px)"
        }}
      />
      
      <div className="absolute bottom-20 flex items-center gap-3 text-gray-500 font-mono text-sm">
        <div className="w-2 h-2 rounded-full bg-danger animate-ping"></div>
        Initializing Security Engine...
      </div>
    </div>
  );
}