'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import AppShell from '@/components/AppShell';
import BannerSlider from '@/components/BannerSlider';
import Header from '@/components/Header';
import { db } from '@/lib/firebase';
import { services } from '@/lib/serviceConfig';

const fallbackBanners = [
  '/images/banaripara1.jpg',
  '/images/banaripara2.jpg',
  '/images/banaripara3.jpg',
];

export default function DashboardPage() {
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
      <div className="space-y-6">
        <Header
          title="আমাদের বানারীপাড়া"
          badge="Welcome"
          icon="🌿"
          subtitle="বানারীপাড়ার প্রয়োজনীয় তথ্য, সেবা, প্রতিষ্ঠান, জরুরি নাম্বার এবং কমিউনিটি আপডেট এক জায়গায়।"
        />

        <section className="mx-auto max-w-6xl space-y-4">
          <BannerSlider images={banners} heightClass="h-52 sm:h-64 md:h-80" />

          <div className="grid gap-4 grid-cols-2">
            <Link href="/about" className="group card flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:shadow-soft">
              <div className="grid h-16 w-16 place-items-center rounded-3xl sm:bg-emerald-50">
                <img src="/images/logoBana.png" alt="আমাদের বানারীপাড়া" className="h-12 w-12 object-contain transition group-hover:scale-110" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">আমাদের বানারীপাড়া</h2>
              </div>
            </Link>

            <Link href="/admins" className="group card flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:shadow-soft">
              <div className="grid h-16 w-16 place-items-center rounded-3xl sm:bg-emerald-50">
                <img src="/images/admin.png" alt="অ্যাডমিন পরিচিতি" className="h-12 w-12 object-contain transition group-hover:scale-110" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">অ্যাডমিনদের পরিচিতি</h2>
              </div>
            </Link>
          </div>
        </section>

        <section id="services" className="card mx-auto max-w-6xl p-5 md:p-7">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">Services</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">সেবা সমূহ</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
              {services.length} ক্যাটাগরি
            </span>
          </div>

          <div className="grid grid-cols-3 gap-[5px] sm:gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group rounded-[24px] border border-slate-100 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-soft"
              >
                <img src={service.icon} alt={service.title} className="mx-auto h-14 w-14 object-contain transition group-hover:scale-110" />
                <h3 className="mt-3 text-[14px] sm:text-base font-black text-slate-800">{service.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
