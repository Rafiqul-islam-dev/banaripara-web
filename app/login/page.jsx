'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { saveUser } from '@/lib/auth';

function LoginContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.trim();
    const cleanPassword = password.trim();

    if (!cleanPhone || !cleanPassword) {
      setError('মোবাইল নাম্বার ও পাসওয়ার্ড দিন।');
      return;
    }

    setLoading(true);

    try {
      const ref = doc(db, 'users', cleanPhone);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setError('এই নাম্বারে কোনো অ্যাকাউন্ট পাওয়া যায়নি।');
        return;
      }

      const data = snap.data();

      if ((data.password || '') !== cleanPassword) {
        setError('পাসওয়ার্ড সঠিক নয়।');
        return;
      }

      saveUser({
        id: snap.id,
        name: data.name || '',
        phone: data.phone || snap.id,
      });

      window.dispatchEvent(new Event('banaripara-user-changed'));
      window.location.href = next;
    } catch (err) {
      console.error(err);
      setError('লগইন করতে সমস্যা হয়েছে। Firebase config check করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-bg flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[36px] bg-white shadow-soft md:grid-cols-2">
        <div className="green-gradient p-8 text-white md:p-12">
          <img
            src="/images/logoBana.png"
            alt="Banaripara"
            className="h-24 w-24 rounded-3xl bg-white/15 object-contain p-2"
          />

          <h1 className="mt-8 text-4xl font-black leading-tight">
            প্রাণের বানারীপাড়া
          </h1>

          <p className="mt-4 leading-8 text-emerald-50">
            তথ্য দেখতে login লাগবে না। তবে নতুন তথ্য যোগ করতে হলে আপনার account দিয়ে login করতে হবে।
          </p>

          <a
            href="/dashboard"
            className="mt-6 inline-block rounded-2xl bg-white/15 px-5 py-3 font-black text-white ring-1 ring-white/20 transition hover:bg-white/25"
          >
            ← হোমে ফিরে যান
          </a>
        </div>

        <form onSubmit={handleLogin} className="p-8 md:p-12">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-emerald-600">
            Login
          </p>

          <h2 className="mt-2 text-3xl font-black text-slate-900">
            আপনার অ্যাকাউন্টে প্রবেশ করুন
          </h2>

          <div className="mt-8 space-y-4">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="মোবাইল নাম্বার"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="পাসওয়ার্ড"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          {error && (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-emerald-600 px-5 py-4 text-lg font-black text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
          </button>

          <p className="mt-6 text-center text-slate-500">
            অ্যাকাউন্ট নেই?{' '}
            <a
              href={`/register?next=${encodeURIComponent(next)}`}
              className="font-black text-emerald-700"
            >
              রেজিস্ট্রেশন করুন
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="page-bg flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}