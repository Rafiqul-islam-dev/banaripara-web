'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import AppShell from '@/components/AppShell';
import EmptyState from '@/components/EmptyState';
import Header from '@/components/Header';
import { db } from '@/lib/firebase';
import {
  getNotificationDate,
  isCurrentMonthNotification,
  isNotificationRead,
  markNotificationAsRead,
} from '@/lib/notificationRead';

function formatDate(value) {
  if (!value) return 'সময় পাওয়া যায়নি';
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return 'সময় পাওয়া যায়নি';
  return date.toLocaleString('bn-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getBody(item) {
  return item.body || item.message || item.description || '';
}

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [readVersion, setReadVersion] = useState(0);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => {
        const list = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((item) => isCurrentMonthNotification(item))
          .sort((a, b) => {
            const aTime = getNotificationDate(a)?.getTime() || 0;
            const bTime = getNotificationDate(b)?.getTime() || 0;

            return bTime - aTime;
          });

        setItems(list);
        setLoading(false);
      },
      (error) => {
        console.error('Notifications load error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleOpenNotification = (item) => {
    markNotificationAsRead(item.id);
    setReadVersion((value) => value + 1);
    setSelectedNotification(item);
  };

  const unreadCount = items.filter((item) => !isNotificationRead(item.id)).length;

  return (
    <AppShell>
      <div className="space-y-6">
        <Header title="নোটিফিকেশন" badge="Current Month" icon="🔔" subtitle="শুধু বর্তমান মাসে অ্যাডমিন থেকে দেওয়া নোটিফিকেশনগুলো এখানে দেখা যাবে।" />

        {!loading && items.length > 0 && (
          <section className="card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">এই মাসের নোটিফিকেশন</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  পড়তে notification card-এ click করুন।
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
                Unread: {unreadCount}
              </div>
            </div>
          </section>
        )}

        {loading ? (
          <div className="card flex min-h-[240px] items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" /></div>
        ) : items.length === 0 ? (
          <EmptyState title="এই মাসে কোনো নোটিফিকেশন নেই" message="নতুন আপডেট এলে এখানে দেখা যাবে।" />
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const read = isNotificationRead(item.id);
              const body = getBody(item);

              return (
                <button
                  type="button"
                  key={`${item.id}-${readVersion}`}
                  onClick={() => handleOpenNotification(item)}
                  className={`card w-full p-5 text-left transition hover:-translate-y-0.5 hover:shadow-xl ${
                    read ? 'bg-white' : 'border-2 border-emerald-200 bg-emerald-50/70'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${read ? 'bg-slate-100' : 'bg-emerald-600 text-white'}`}>
                      🔔
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className={`text-xl font-black ${read ? 'text-slate-900' : 'text-emerald-900'}`}>{item.title || 'নোটিফিকেশন'}</h2>
                        {!read && <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-black text-white">নতুন</span>}
                      </div>
                      <p className="mt-2 line-clamp-2 leading-7 text-slate-600">{body}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-slate-400">{formatDate(item.created_at)}</p>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                          {read ? 'Read' : 'Unread'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {selectedNotification && (
          <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 p-4 sm:items-center">
            <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">Notification</p>
                  <h2 className="mt-2 text-2xl font-black leading-9 text-slate-900">
                    {selectedNotification.title || 'নোটিফিকেশন'}
                  </h2>
                  <p className="mt-2 text-sm font-bold text-slate-400">
                    {formatDate(selectedNotification.created_at)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="rounded-full bg-red-50 px-4 py-2 text-xl font-black text-red-600 hover:bg-red-100"
                >
                  ×
                </button>
              </div>

              <div className="rounded-[24px] bg-slate-50 p-5">
                <p className="whitespace-pre-line text-base font-semibold leading-8 text-slate-700">
                  {getBody(selectedNotification) || 'মেসেজ পাওয়া যায়নি।'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="mt-5 w-full rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white transition hover:bg-emerald-700"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
