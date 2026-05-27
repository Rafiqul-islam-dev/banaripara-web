'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUser, logoutUser } from '@/lib/auth';

const mainNavItems = [
  { href: '/dashboard', label: 'হোম', icon: '🏠' },
  { href: '/notifications', label: 'নোটিফিকেশন', icon: '🔔' },
  { href: '/admins', label: 'অ্যাডমিন', icon: '👥' },
  { href: '/about', label: 'বানারীপাড়া', icon: '🌿' },
];

const APK_DOWNLOAD_LINK = 'https://banaripara-zeta.vercel.app/banaripara.apk';

const moreMenuItems = [
  { href: APK_DOWNLOAD_LINK, label: 'অ্যাপ ডাউনলোড', icon: '⬇️' },
  { href: '/developer', label: 'অ্যাপ ডেভেলপার সম্পর্কে', icon: '💻', internal: true },
  { href: 'https://www.facebook.com/groups/1475251976059265', label: 'ফেসবুক পেইজ', icon: '👍' },
  { href: 'https://www.facebook.com/groups/1475251976059265', label: 'ফেসবুক গ্রুপ', icon: '👥' },
  { href: 'https://www.instagram.com/', label: 'ইনস্টাগ্রাম', icon: '📸' },
  { href: 'https://www.youtube.com/', label: 'ইউটিউব', icon: '▶️' },
  { href: 'tel:', label: 'কল করুন', icon: '📞' },
  { href: 'sms:', label: 'ম্যাসেজ করুন', icon: '💬' },
  { href: 'mailto:', label: 'ইমেইল করুন', icon: '✉️' },
  { href: '/privacy', label: 'গোপনীয়তা', icon: '🛡️', internal: true },
];

function isExternalHref(href = '') {
  return href.startsWith('http') || href.startsWith('tel:') || href.startsWith('sms:') || href.startsWith('mailto:');
}

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getUser());

    const syncUser = () => setUser(getUser());
    window.addEventListener('storage', syncUser);
    window.addEventListener('banaripara-user-changed', syncUser);

    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('banaripara-user-changed', syncUser);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    window.dispatchEvent(new Event('banaripara-user-changed'));
    window.location.href = '/dashboard';
  };

  const isActive = (href) => pathname === href || (href === '/dashboard' && pathname === '/');

  return (
    <div className="page-bg min-h-screen pb-24 lg:pb-8">
      <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <a href="/dashboard" className="flex items-center gap-3">
            <img src="/images/logoBana.png" alt="প্রাণের বানারীপাড়া" className="h-16 w-16 rounded-2xl object-contain shadow-sm" />
            <div>
              <h1 className="text-xl font-black leading-5 text-slate-900 md:text-2xl">প্রাণের বানারীপাড়া</h1>
            </div>
          </a>

          <nav className="hidden items-center gap-2 lg:flex">
            {mainNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`rounded-2xl px-4 py-2 text-sm font-black transition ${isActive(item.href) ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
              >
                <span className="mr-1">{item.icon}</span>{item.label}
              </a>
            ))}

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="rounded-2xl px-4 py-2 text-sm font-black text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
              >
                ☰ আরও
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-3xl border border-slate-100 bg-white p-2 shadow-2xl">
                  {moreMenuItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target={isExternalHref(item.href) && item.href.startsWith('http') ? '_blank' : undefined}
                      rel={isExternalHref(item.href) && item.href.startsWith('http') ? 'noreferrer' : undefined}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <span>{item.icon}</span>{item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={APK_DOWNLOAD_LINK}
              className="hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:scale-105 md:inline-flex"
            >
              ⬇️ অ্যাপ ডাউনলোড
            </a>
            {mounted && user ? (
              <div className="hidden items-center gap-3 rounded-2xl bg-emerald-50 px-3 py-2 md:flex">
                <div className="text-right">
                  <p className="text-xs text-slate-400">Logged in</p>
                  <p className="text-sm font-black text-slate-900">{user.name || 'User'}</p>
                </div>
                <button type="button" onClick={handleLogout} className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 hover:bg-red-100">Logout</button>
              </div>
            ) : (
              <div className="hidden gap-2 md:flex">
                <a href="/login" className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-black text-white">Login</a>
                <a href="/register" className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">Register</a>
              </div>
            )}

            <button type="button" onClick={() => setMenuOpen((value) => !value)} className="rounded-2xl bg-emerald-50 px-3 py-2 text-xl font-black text-emerald-700 lg:hidden">
              ☰
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-emerald-100 bg-white px-4 py-3 lg:hidden">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 sm:grid-cols-3">
              {[...mainNavItems, ...moreMenuItems].map((item) => (
                <a
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  target={isExternalHref(item.href) && item.href.startsWith('http') ? '_blank' : undefined}
                  rel={isExternalHref(item.href) && item.href.startsWith('http') ? 'noreferrer' : undefined}
                  className="rounded-2xl bg-slate-50 px-3 py-3 text-sm font-bold text-slate-600"
                >
                  <span className="mr-1">{item.icon}</span>{item.label}
                </a>
              ))}
              <a href={APK_DOWNLOAD_LINK} className="rounded-2xl bg-emerald-600 px-3 py-3 text-center text-sm font-black text-white">⬇️ অ্যাপ ডাউনলোড</a>
              {mounted && user ? (
                <button type="button" onClick={handleLogout} className="rounded-2xl bg-red-50 px-3 py-3 text-left text-sm font-black text-red-600">Logout</button>
              ) : (
                <>
                  <a href="/login" className="rounded-2xl bg-emerald-600 px-3 py-3 text-center text-sm font-black text-white">Login</a>
                  <a href="/register" className="rounded-2xl bg-emerald-50 px-3 py-3 text-center text-sm font-black text-emerald-700">Register</a>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">{children}</main>

      <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-emerald-100 bg-white/95 px-2 py-2 shadow-[0_-10px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-1">
          {mainNavItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`rounded-2xl px-2 py-2 text-center text-xs font-bold transition ${isActive(item.href) ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}
            >
              <div className="text-xl leading-5">{item.icon}</div>
              <div className="mt-1 truncate">{item.label}</div>
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
