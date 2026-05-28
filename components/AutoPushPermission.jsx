'use client';

import { useEffect, useState } from 'react';
import { enableWebPushNotification } from '@/lib/webPush';

const STORAGE_KEY = 'banaripara_push_permission_popup_seen';

export default function AutoPushPermission() {
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('Notification' in window)) return;

    const alreadySeen = localStorage.getItem(STORAGE_KEY);
    const permission = Notification.permission;

    if (permission === 'granted' || permission === 'denied' || alreadySeen === 'yes') {
      return;
    }

    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleAllow = async () => {
    setLoading(true);

    try {
      await enableWebPushNotification();
      localStorage.setItem(STORAGE_KEY, 'yes');
      setShowPopup(false);
    } catch (error) {
      console.error('Push permission error:', error);
      localStorage.setItem(STORAGE_KEY, 'yes');
      setShowPopup(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLater = () => {
    localStorage.setItem(STORAGE_KEY, 'yes');
    setShowPopup(false);
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">
          🔔
        </div>

        <h2 className="mt-4 text-center text-2xl font-black text-slate-900">
          নোটিফিকেশন চালু করবেন?
        </h2>

        <p className="mt-3 text-center text-sm font-semibold leading-7 text-slate-600">
          নতুন তথ্য, জরুরি আপডেট এবং গুরুত্বপূর্ণ ঘোষণা পেতে নোটিফিকেশন allow করুন।
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleLater}
            disabled={loading}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            পরে
          </button>

          <button
            type="button"
            onClick={handleAllow}
            disabled={loading}
            className="rounded-2xl bg-emerald-600 px-4 py-3 font-black text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? 'চালু হচ্ছে...' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
}