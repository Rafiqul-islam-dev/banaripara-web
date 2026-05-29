'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

import AutoPushPermission from '@/components/AutoPushPermission';
import PushNotificationButton from '@/components/PushNotificationButton';
import { db } from '@/lib/firebase';
import { getUser } from '@/lib/auth';

const APP_DOWNLOAD_LINK = 'https://banaripara-zeta.vercel.app/banaripara.apk';
const READ_STORAGE_KEY = 'banaripara_read_notifications';

const mainMenus = [
  {
    title: 'হোম',
    href: '/dashboard',
    icon: '🏠',
  },
  {
    title: 'আমাদের বানারীপাড়া',
    href: '/about',
    icon: '💚',
  },
  {
    title: 'নোটিফিকেশন',
    href: '/notifications',
    icon: '🔔',
    notification: true,
  },
  {
    title: 'ডেভেলপার',
    href: '/developer',
    icon: '💻',
  },
];

const socialMenus = [
  {
    title: 'ফেসবুক পেইজ',
    href: 'https://www.facebook.com/',
    icon: '📘',
    external: true,
  },
  {
    title: 'ফেসবুক গ্রুপ',
    href: 'https://www.facebook.com/groups/',
    icon: '👥',
    external: true,
  },
  {
    title: 'ইনস্টাগ্রাম',
    href: 'https://www.instagram.com/',
    icon: '📷',
    external: true,
  },
  {
    title: 'ইউটিউব',
    href: 'https://www.youtube.com/',
    icon: '▶️',
    external: true,
  },
];

function goTo(url) {
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
}

function isMenuActive(pathname, href) {
  if (!pathname) return false;

  if (href === '/dashboard') {
    return pathname === '/' || pathname === '/dashboard' || pathname.startsWith('/services');
  }

  if (href === '/about') {
    return pathname === '/about' || pathname.startsWith('/about/');
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function timestampToDate(value) {
  if (!value) return null;

  if (value?.toDate) {
    return value.toDate();
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function isCurrentMonthNotification(item) {
  if (!item) return false;

  const currentMonthKey = getMonthKey();

  if (item.month_key) {
    return item.month_key === currentMonthKey;
  }

  const createdDate = timestampToDate(item.created_at || item.createdAt);

  if (!createdDate) return false;

  return getMonthKey(createdDate) === currentMonthKey;
}

function getReadIds() {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    const parsed = JSON.parse(raw || '[]');

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function Badge({ count }) {
  if (!count || count <= 0) return null;

  return (
    <span className="ml-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-black leading-none text-white shadow-md">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function AppShell({ children }) {
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState([]);

  useEffect(() => {
    const loadUser = () => {
      setUser(getUser());
    };

    loadUser();

    window.addEventListener('banaripara-user-changed', loadUser);
    window.addEventListener('storage', loadUser);

    return () => {
      window.removeEventListener('banaripara-user-changed', loadUser);
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  useEffect(() => {
    const loadReadIds = () => {
      setReadIds(getReadIds());
    };

    loadReadIds();

    window.addEventListener('storage', loadReadIds);
    window.addEventListener('banaripara-notification-read-changed', loadReadIds);

    return () => {
      window.removeEventListener('storage', loadReadIds);
      window.removeEventListener('banaripara-notification-read-changed', loadReadIds);
    };
  }, []);

  useEffect(() => {
    const notificationQuery = query(
      collection(db, 'notifications'),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(
      notificationQuery,
      (snapshot) => {
        const list = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setNotifications(list.filter(isCurrentMonthNotification));
      },
      (error) => {
        console.error('Notification count load error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const unreadCount = useMemo(() => {
    if (!notifications.length) return 0;

    return notifications.filter((item) => !readIds.includes(item.id)).length;
  }, [notifications, readIds]);

  const handleLogout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('banaripara_user');
    localStorage.removeItem('user');
    localStorage.removeItem('currentUser');

    window.dispatchEvent(new Event('banaripara-user-changed'));
    window.location.href = '/dashboard';
  }

  setUser(null);
};

  return (
    <>
      <div className="min-h-screen bg-slate-50 pb-20 lg:pb-0">
        <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/90 shadow-sm backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
            <button
              type="button"
              onClick={() => goTo('/dashboard')}
              className="flex items-center gap-3 text-left"
            >
              <img
                src="/images/logoBana.png"
                alt="Banaripara"
                className="h-12 w-12 rounded-2xl bg-emerald-50 object-contain p-1 shadow-sm"
              />

              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600">
                  Our Banaripara
                </p>
                <h1 className="text-lg font-black leading-5 text-slate-900 md:text-xl">
                  আমাদের বানারীপাড়া
                </h1>
              </div>
            </button>

            <nav className="hidden items-center gap-2 lg:flex">
              {mainMenus.map((menu) => {
                const active = isMenuActive(pathname, menu.href);

                return (
                  <a
                    key={menu.href}
                    href={menu.href}
                    className={`relative rounded-2xl px-4 py-2 text-sm font-black transition ${
                      active
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                        : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <span className="mr-1">{menu.icon}</span>
                    {menu.title}
                    {menu.notification && <Badge count={unreadCount} />}
                  </a>
                );
              })}
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              <PushNotificationButton />

              {/* <a
                href={APP_DOWNLOAD_LINK}
                className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700"
              >
                📲 অ্যাপ ডাউনলোড
              </a> */}

              {user ? (
                <div className="flex items-center gap-2">
                  <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">
                    {user.name || user.phone}
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-2xl bg-red-50 px-3 py-2 text-sm font-black text-red-600 transition hover:bg-red-100"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <a
                  href="/login"
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-700"
                >
                  Login
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((value) => !value)}
              className="rounded-2xl bg-emerald-50 px-4 py-3 text-xl font-black text-emerald-700 lg:hidden"
            >
              ☰
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="border-t border-emerald-100 bg-white px-4 pb-4 lg:hidden">
              <div className="mx-auto max-w-7xl space-y-3 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  {mainMenus.map((menu) => {
                    const active = isMenuActive(pathname, menu.href);

                    return (
                      <a
                        key={menu.href}
                        href={menu.href}
                        className={`relative rounded-2xl px-4 py-3 text-sm font-black ${
                          active
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        <span className="mr-1">{menu.icon}</span>
                        {menu.title}
                        {menu.notification && <Badge count={unreadCount} />}
                      </a>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {socialMenus.map((menu) => (
                    <a
                      key={menu.title}
                      href={menu.href}
                      target={menu.external ? '_blank' : undefined}
                      rel={menu.external ? 'noreferrer' : undefined}
                      className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700"
                    >
                      <span className="mr-1">{menu.icon}</span>
                      {menu.title}
                    </a>
                  ))}
                </div>

                <div className="grid gap-3">
                  <PushNotificationButton />

                  <a
                    href={APP_DOWNLOAD_LINK}
                    className="rounded-2xl bg-emerald-600 px-4 py-3 text-center text-sm font-black text-white shadow-lg shadow-emerald-100"
                  >
                    📲 অ্যাপ ডাউনলোড
                  </a>

                  {user ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-600"
                    >
                      Logout
                    </button>
                  ) : (
                    <a
                      href="/login"
                      className="rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-black text-white"
                    >
                      Login
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>

        <footer className="mt-8 border-t border-emerald-100 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-center text-sm font-semibold text-slate-500 md:flex-row md:items-center md:justify-between md:px-6 md:text-left">
            <p>© {new Date().getFullYear()} আমাদের বানারীপাড়া</p>
            <p>Banaripara digital information platform</p>
          </div>
        </footer>

        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-emerald-100 bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
          <div className="mx-auto grid max-w-md grid-cols-4 px-2 py-2">
            {mainMenus.slice(0, 4).map((menu) => {
              const active = isMenuActive(pathname, menu.href);

              return (
                <a
                  key={menu.href}
                  href={menu.href}
                  className={`relative flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-xs font-black transition ${
                    active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <span className={`text-xl ${active ? 'scale-110' : ''}`}>
                    {menu.icon}
                  </span>

                  {menu.notification && unreadCount > 0 && (
                    <span className="absolute right-3 top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black leading-none text-white shadow-md">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}

                  <span className="mt-1 line-clamp-1">{menu.title}</span>
                </a>
              );
            })}
          </div>
        </nav>
      </div>

      <AutoPushPermission />
    </>
  );
}