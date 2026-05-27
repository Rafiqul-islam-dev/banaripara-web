'use client';

import { useEffect, useState } from 'react';

function isStandaloneMode() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

export default function PWAInstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (isStandaloneMode()) {
      setShowButton(false);
      return;
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setShowButton(true);
    };

    const handleInstalled = () => {
      setInstallPrompt(null);
      setShowButton(false);
      setShowHelp(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    const timer = setTimeout(() => {
      if (!isStandaloneMode()) setShowButton(true);
    }, 2500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      setShowHelp(true);
      return;
    }

    installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      setShowButton(false);
    }

    setInstallPrompt(null);
  };

  if (!showButton) return null;

  return (
    <>
      <button
        type="button"
        onClick={handleInstall}
        className="fixed bottom-24 right-4 z-[70] rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-2xl shadow-emerald-200 transition hover:bg-emerald-700 lg:bottom-6"
      >
        📲 APP
      </button>

      {showHelp && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">Install Guide</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Banaripara Home Screen-এ যোগ করুন</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="rounded-full bg-red-50 px-4 py-2 text-lg font-black text-red-600"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm font-semibold leading-7 text-slate-700">
              <p>Android Chrome হলে browser menu <b>⋮</b> চাপুন, তারপর <b>Add to Home screen</b> বা <b>Install app</b> চাপুন।</p>
              <p>iPhone Safari হলে <b>Share</b> button চাপুন, তারপর <b>Add to Home Screen</b> চাপুন।</p>
              <p>এরপর mobile screen-এ <b>Banaripara</b> icon চলে আসবে। Icon click করলে app-এর মতো open হবে।</p>
            </div>

            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}
    </>
  );
}
