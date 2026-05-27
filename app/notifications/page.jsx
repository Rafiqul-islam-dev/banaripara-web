'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import AppShell from '@/components/AppShell';
import EmptyState from '@/components/EmptyState';
import Header from '@/components/Header';
import { db } from '@/lib/firebase';

function monthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

function formatDate(value) {
  if (!value) return 'সময় পাওয়া যায়নি';
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return 'সময় পাওয়া যায়নি';
  return date.toLocaleString('bn-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { start, end } = monthRange();
        const snap = await getDocs(collection(db, 'notifications'));
        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((item) => {
          const date = item.created_at?.toDate ? item.created_at.toDate() : null;
          if (!date) return false;
          return date >= start && date < end;
        }).sort((a, b) => (b.created_at?.toDate?.()?.getTime() || 0) - (a.created_at?.toDate?.()?.getTime() || 0));
        setItems(list);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <Header title="নোটিফিকেশন" badge="Current Month" icon="🔔" subtitle="শুধু বর্তমান মাসে অ্যাডমিন থেকে দেওয়া নোটিফিকেশনগুলো এখানে দেখা যাবে।" />
        {loading ? (
          <div className="card flex min-h-[240px] items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" /></div>
        ) : items.length === 0 ? (
          <EmptyState title="এই মাসে কোনো নোটিফিকেশন নেই" message="নতুন আপডেট এলে এখানে দেখা যাবে।" />
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <article key={item.id} className="card p-5">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">🔔</div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{item.title || 'নোটিফিকেশন'}</h2>
                    <p className="mt-2 leading-7 text-slate-600">{item.body || item.message || ''}</p>
                    <p className="mt-3 text-sm font-bold text-slate-400">{formatDate(item.created_at)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
