'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { saveUser } from '@/lib/auth';

function RegisterContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const name = form.name.trim();
    const phone = form.phone.trim();
    const password = form.password.trim();

    if (!name || !phone || !password) {
      setError('সব ঘর পূরণ করুন।');
      return;
    }

    if (password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের দিন।');
      return;
    }

    setLoading(true);

    try {
      const ref = doc(db, 'users', phone);
      const old = await getDoc(ref);

      if (old.exists()) {
        setError('এই নাম্বার দিয়ে আগে registration করা হয়েছে।');
        return;
      }

      const user = {
        name,
        phone,
        password,
        created_at: serverTimestamp(),
      };

      await setDoc(ref, user);

      saveUser({
        id: phone,
        name,
        phone,
      });

      window.dispatchEvent(new Event('banaripara-user-changed'));
      window.location.href = next;
    } catch (err) {
      console.error(err);
      setError('Registration করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-bg flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl rounded-[36px] bg-white p-8 shadow-soft md:p-12">
        <div className="text-center">
          <img
            src="/images/logoBana.png"
            alt="Banaripara"
            className="mx-auto h-24 w-24 rounded-3xl bg-emerald-50 object-contain p-2"
          />

          <p className="mt-6 text-sm font-black uppercase tracking-[0.3em] text-emerald-600">
            Register
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-900">
            নতুন অ্যাকাউন্ট তৈরি করুন
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            তথ্য add করতে account দরকার। Account করলে পরবর্তীতে সহজে তথ্য জমা দিতে পারবেন।
          </p>
        </div>

        <form onSubmit={handleRegister} className="mt-8 space-y-4">
          <input
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="আপনার নাম"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />

          <input
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="মোবাইল নাম্বার"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />

          <input
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            type="password"
            placeholder="পাসওয়ার্ড"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />

          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-600 px-5 py-4 text-lg font-black text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? 'Registration হচ্ছে...' : 'Registration করুন'}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-500">
          আগে থেকেই অ্যাকাউন্ট আছে?{' '}
          <a
            href={`/login?next=${encodeURIComponent(next)}`}
            className="font-black text-emerald-700"
          >
            লগইন করুন
          </a>
        </p>

        <p className="mt-3 text-center">
          <a
            href="/dashboard"
            className="text-sm font-black text-slate-500 hover:text-emerald-700"
          >
            Login ছাড়া তথ্য দেখুন
          </a>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="page-bg flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}