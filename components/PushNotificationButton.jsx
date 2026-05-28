'use client';

import { useEffect, useState } from 'react';

import {
  getWebPushLastError,
  isWebPushEnabledLocally,
  registerWebPushToken,
  saveWebPushError,
} from '@/lib/webPush';

export default function PushNotificationButton() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setEnabled(isWebPushEnabledLocally());

    const lastError = getWebPushLastError();
    if (lastError) {
      console.warn('Last web push error:', lastError);
    }
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    setMessage('');

    try {
      await registerWebPushToken();
      setEnabled(true);
      setMessage('নোটিফিকেশন চালু হয়েছে।');
    } catch (error) {
      console.error('Web push enable failed:', error);
      saveWebPushError(error);
      setMessage(error?.message || 'নোটিফিকেশন চালু করা যায়নি।');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 7000);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleEnable}
        disabled={loading}
        className={`rounded-2xl px-4 py-2 text-sm font-black shadow-lg transition ${
          enabled
            ? 'bg-emerald-50 text-emerald-700 shadow-emerald-50'
            : 'bg-amber-500 text-white shadow-amber-100 hover:bg-amber-600'
        } disabled:cursor-not-allowed disabled:opacity-80`}
        title={enabled ? 'Web/PWA notification চালু আছে' : 'PWA notification চালু করুন'}
      >
        {loading ? 'চালু হচ্ছে...' : enabled ? '🔔 চালু আছে' : '🔔 Notification'}
      </button>

      {message ? (
        <div className="absolute right-0 top-full z-[90] mt-2 w-80 rounded-2xl border border-emerald-100 bg-white p-3 text-xs font-bold text-slate-700 shadow-2xl">
          {message}
        </div>
      ) : null}
    </div>
  );
}
