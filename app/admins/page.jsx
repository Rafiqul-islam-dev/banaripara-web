'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import AppShell from '@/components/AppShell';
import EmptyState from '@/components/EmptyState';
import Header from '@/components/Header';
import { db } from '@/lib/firebase';

const fallback = [
  { name: 'হাসান আহাম্মেদ সোহাগ', image: 'https://styrenebd.com/asset/sohag.jpg', number: '01911014228', designation: 'অ্যাডমিন', details: 'বানারীপাড়া কমিউনিটি কার্যক্রম পরিচালনায় যুক্ত।' },
];

export default function AdminsPage() {
  const [items, setItems] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db, 'admin_profiles'));
        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        if (list.length) setItems(list);
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
        <Header title="অ্যাডমিন পরিচিতি" badge="Community" icon="👥" subtitle="বানারীপাড়ার কমিউনিটি ও তথ্য ব্যবস্থাপনায় যুক্ত দায়িত্বশীল ব্যক্তিদের পরিচিতি।" />
        {loading ? <div className="card flex min-h-[240px] items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" /></div> : items.length === 0 ? <EmptyState /> : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((admin, index) => (
              <article key={admin.id || index} className="card overflow-hidden">
                <img src={admin.image || '/images/admin.png'} alt={admin.name} className="h-64 w-full object-cover" />
                <div className="p-5">
                  <h2 className="text-xl font-black text-slate-900">{admin.name}</h2>
                  <span className="mt-2 inline-block rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700">{admin.designation || 'অ্যাডমিন'}</span>
                  <p className="mt-3 leading-7 text-slate-600">{admin.details}</p>
                  {admin.number && <a href={`tel:${admin.number}`} className="mt-4 inline-block rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white">📞 কল করুন</a>}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </AppShell>
  );
}
