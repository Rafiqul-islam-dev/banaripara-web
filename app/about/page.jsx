'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import AppShell from '@/components/AppShell';
import BannerSlider from '@/components/BannerSlider';
import { db } from '@/lib/firebase';
import { aboutMenuItems } from '@/lib/aboutMenu';

const fallbackBanners = [
  '/images/banaripara1.jpg',
  '/images/banaripara2.jpg',
  '/images/banaripara3.jpg',
];

export default function AboutPage() {
  const [banners, setBanners] = useState(fallbackBanners);

  useEffect(() => {
    async function loadBanners() {
      try {
        const snap = await getDocs(
          query(collection(db, 'app_banners'), orderBy('created_at', 'desc'), limit(8))
        );
        const urls = snap.docs
          .map((d) => d.data().image || d.data().image_url || d.data().url)
          .filter(Boolean);
        if (urls.length) setBanners(urls);
      } catch (error) {
        console.log('Banner fallback used', error);
      }
    }

    loadBanners();
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[32px] bg-white p-3 shadow-soft">
          <BannerSlider images={banners} heightClass="h-52 sm:h-64 md:h-80" roundedClass="rounded-[28px]" />
        </section>

        <section className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-emerald-600">আমাদের বানারীপাড়া</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-black leading-tight text-emerald-600 md:text-5xl">
            এক নজরে দেখে নিন আমার আপনার প্রিয় বানারীপাড়া
          </h1>
        </section>

        <section className="grid grid-cols-3 gap-[6px] sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {aboutMenuItems.map((item) => (
            <Link
              key={item.slug}
              href={`/about/${item.slug}`}
              className="group rounded-[28px] mb-2 h-13 bg-white p-5 text-center shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-soft hover:ring-emerald-100"
            >
             <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl sm:bg-green-50 sm:shadow-sm">
              <img
                src={item.icon}
                alt={item.title}
                className="h-18 w-18 object-contain"
              />
            </div>
              <h2 className="mt-4 sm:min-h-[48px] text-[17px] sm:text-lg font-black leading-6 text-slate-900">
                {item.title}
              </h2>
            </Link>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
