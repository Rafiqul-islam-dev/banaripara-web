'use client';

import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import AppShell from '@/components/AppShell';
import EmptyState from '@/components/EmptyState';
import Header from '@/components/Header';
import { db } from '@/lib/firebase';
import { doctorSpecialties, getService, isApproved } from '@/lib/serviceConfig';
import { getUser } from '@/lib/auth';

function valueForCard(data, keys) {
  for (const key of keys) {
    if (data?.[key]) return data[key];
  }
  return '';
}

function buildDoctorCategoryUrl(category) {
  return `/services/doctors?category=${encodeURIComponent(category)}`;
}

function isBusScheduleService(service) {
  if (!service) return false;

  return (
    service.slug === 'bus' ||
    service.slug === 'busschedule' ||
    service.slug === 'bus-schedule' ||
    service.collection === 'busschedule'
  );
}

function getBusScheduleText(item) {
  return valueForCard(item, [
    'schedule',
    'suchi',
    'time_schedule',
    'bus_schedule',
    'busSchedule',
    'timing',
    'time',
    'times',
    'details',
    'description',
  ]);
}

export default function ServicePage() {
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedDoctorCategory = searchParams.get('category') || '';
  const service = getService(params.slug);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  useEffect(() => {
    if (!service) return;

    async function loadData() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, service.collection));
        const list = snap.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .filter((data) => isApproved(data));
        setItems(list);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [service]);

  useEffect(() => {
    if (service?.slug === 'doctors' && selectedDoctorCategory) {
      setForm((prev) => ({
        ...prev,
        category: selectedDoctorCategory,
        specialty: prev.specialty || selectedDoctorCategory,
      }));
    }
  }, [service?.slug, selectedDoctorCategory]);

  const filtered = useMemo(() => {
    const key = search.trim().toLowerCase();
    return items.filter((item) => {
      if (service?.slug === 'doctors' && selectedDoctorCategory) {
        const category = String(item.category || item.specialty || item.specialist || '').trim();
        if (category !== selectedDoctorCategory) return false;
      }
      if (!key) return true;
      return JSON.stringify(item).toLowerCase().includes(key);
    });
  }, [items, search, selectedDoctorCategory, service?.slug]);

  if (!service) {
    return (
      <AppShell>
        <EmptyState title="ক্যাটাগরি পাওয়া যায়নি" message="সঠিক menu থেকে আবার চেষ্টা করুন।" />
      </AppShell>
    );
  }

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const requireLoginForAdd = () => {
  const currentUser = getUser();

  if (!currentUser) {
    const nextUrl = `${pathname}${
      selectedDoctorCategory
        ? `?category=${encodeURIComponent(selectedDoctorCategory)}`
        : ''
    }`;

    window.location.href = `/login?next=${encodeURIComponent(nextUrl)}`;
    return;
  }

  setUser(currentUser);

  if (service.slug === 'doctors' && selectedDoctorCategory) {
    setForm((prev) => ({
      ...prev,
      category: selectedDoctorCategory,
      specialty: prev.specialty || selectedDoctorCategory,
    }));
  }

  setOpenForm((value) => !value);
  };

  const submitInfo = async (e) => {
    e.preventDefault();
    setMessage('');

    const currentUser = getUser();
    if (!currentUser) {
      window.location.href = `/login?next=${encodeURIComponent(pathname)}`;
      return;
    }

    for (const [key, label, , required] of service.fields) {
      if (required && !String(form[key] || '').trim()) {
        setMessage(`${label} দিতে হবে।`);
        return;
      }
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        approved: 0,
        approve: 0,
        approval: 0,
        status: 'pending',
        submitted_by_name: currentUser?.name || '',
        submitted_by_phone: currentUser?.phone || '',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      if (service.slug === 'doctors') {
        payload.specialty = payload.specialty || payload.category || '';
      }

      await addDoc(collection(db, service.collection), payload);

      setForm({});
      setOpenForm(false);
      setMessage('তথ্য জমা হয়েছে। অ্যাডমিন যাচাই করে approve করলে এখানে দেখা যাবে।');
    } catch (error) {
      console.error(error);
      setMessage('তথ্য জমা দিতে সমস্যা হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  const showDoctorCategoryGrid = service.slug === 'doctors' && !selectedDoctorCategory;
  const pageTitle = service.slug === 'doctors' && selectedDoctorCategory ? selectedDoctorCategory : service.title;
  const busService = isBusScheduleService(service);

  return (
    <AppShell>
      <div className="space-y-6">
        <Header
          title={pageTitle}
          badge={service.slug === 'doctors' ? 'Doctor Directory' : busService ? 'Bus Schedule' : 'Directory'}
          icon={<img src={service.icon} alt="" className="h-16 w-16 object-contain" />}
          subtitle={
            service.slug === 'doctors'
              ? 'মোবাইল অ্যাপের মতো ডাক্তারদের বিশেষজ্ঞ ক্যাটাগরি অনুযায়ী দেখুন। নতুন তথ্য যুক্ত করতে login/registration প্রয়োজন।'
              : busService
                ? 'বাসের সময়সূচী দেখুন। নতুন পরিবহন/সূচী যুক্ত করতে login/registration প্রয়োজন।'
                : `${service.title} সম্পর্কিত প্রয়োজনীয় তথ্য দেখুন। নতুন তথ্য যুক্ত করতে login/registration প্রয়োজন।`
          }
        />

        {showDoctorCategoryGrid && (
          <section className="card p-5 md:p-7">
            <div className="mb-5 text-center">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">Doctor Categories</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">কোন রোগ হলে কোন ডাক্তারের কাছে যাবেন</h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">নিচের ক্যাটাগরি থেকে আপনার প্রয়োজনীয় বিশেষজ্ঞ নির্বাচন করুন।</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {doctorSpecialties.map((item) => (
                <a
                  key={item.title}
                  href={buildDoctorCategoryUrl(item.title)}
                  className="group rounded-[24px] border border-slate-100 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-soft"
                >
                  <img src={item.icon} alt={item.title} className="mx-auto h-16 w-16 object-contain transition group-hover:scale-110" />
                  <h3 className="mt-3 text-sm font-black leading-6 text-slate-800 md:text-base">{item.title}</h3>
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="card p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <button
            type="button"
            onClick={() => {
              const targetUrl =
                service.slug === 'doctors' && selectedDoctorCategory
                  ? '/services/doctors'
                  : '/dashboard';

              window.location.href = targetUrl;
            }}
            className="text-left font-black text-emerald-700"
          >
            ← {service.slug === 'doctors' && selectedDoctorCategory ? 'ডাক্তার ক্যাটাগরি' : 'সব ক্যাটাগরি'}
          </button>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search করুন"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
              <button
                onClick={requireLoginForAdd}
                className="rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700"
              >
                + {service.addText}
              </button>
            </div>
          </div>

          {message && <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 font-bold text-emerald-700">{message}</p>}
        </section>

        {openForm && (
          <form onSubmit={submitInfo} className="card p-5 md:p-7">
            <h2 className="mb-2 text-2xl font-black text-slate-900">{service.addText}</h2>
            <p className="mb-5 text-sm font-semibold text-slate-500">আপনার দেওয়া তথ্য pending থাকবে। Admin approve করার পর ওয়েবসাইট ও অ্যাপে দেখা যাবে।</p>
            <div className="grid gap-4 md:grid-cols-2">
              {service.fields.map(([key, label, type, required, options]) => (
                <div key={key} className={type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="mb-2 block text-sm font-black text-slate-700">
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  {type === 'textarea' ? (
                    <textarea
                      value={form[key] || ''}
                      onChange={(e) => updateForm(key, e.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    />
                  ) : type === 'select' ? (
                    <select
                      value={form[key] || ''}
                      onChange={(e) => updateForm(key, e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    >
                      <option value="">নির্বাচন করুন</option>
                      {(options || []).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={type}
                      value={form[key] || ''}
                      onChange={(e) => updateForm(key, e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    />
                  )}
                </div>
              ))}
            </div>
            <button disabled={saving} className="mt-5 rounded-2xl bg-emerald-600 px-6 py-3 font-black text-white shadow-lg shadow-emerald-100 disabled:opacity-60">
              {saving ? 'জমা হচ্ছে...' : 'তথ্য জমা দিন'}
            </button>
          </form>
        )}

        {loading ? (
          <div className="card flex min-h-[240px] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
          </div>
        ) : filtered.length === 0 ? (
          !showDoctorCategoryGrid && <EmptyState title="কোনো তথ্য পাওয়া যায়নি" message="এই ক্যাটাগরিতে approved তথ্য পাওয়া যায়নি।" />
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => {
              const title = valueForCard(item, ['name', 'title', 'job_title', 'transport_name', 'bus_name']) || service.title;
              const phone = valueForCard(item, ['phone', 'mobile', 'number']);
              const address = valueForCard(item, ['address', 'route', 'chamber']);
              const busScheduleText = busService ? getBusScheduleText(item) : '';
              const details = busService
                ? valueForCard(item, ['route', 'address'])
                : valueForCard(item, ['details', 'description', 'service_type', 'specialist', 'specialty', 'designation', 'education']);
              const image = valueForCard(item, ['image', 'image_url', 'photo']);
              const category = valueForCard(item, ['category', 'specialty', 'specialist']);

              return (
                <article key={item.id} className="card overflow-hidden">
                  {image ? (
                    <img src={image} alt={title} className="h-44 w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : service.slug === 'doctors' ? (
                    <div className="flex h-44 items-center justify-center bg-emerald-50">
                      <img src="/images/doctordefult.png" alt={title} className="h-28 w-28 rounded-full object-cover" />
                    </div>
                  ) : busService ? (
                    <div className="flex h-36 items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-5xl shadow-sm">
                        🚌
                      </div>
                    </div>
                  ) : null}

                  <div className="p-5">
                    <h3 className="text-xl font-black text-slate-900">{title}</h3>
                    {category && <p className="mt-1 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{category}</p>}
                    {details && <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-600">{details}</p>}
                    <div className="mt-4 space-y-2 text-sm font-bold text-slate-600">
                      {item.education && <p>🎓 {item.education}</p>}
                      {phone && <p>📞 <a href={`tel:${phone}`} className="text-emerald-700">{phone}</a></p>}
                      {address && <p>📍 {address}</p>}
                    </div>

                    {busService && (
                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        {phone && (
                          <a
                            href={`tel:${phone}`}
                            className="flex-1 rounded-2xl bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
                          >
                            📞 কল করুন
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedSchedule({
                              title,
                              phone,
                              address,
                              schedule: busScheduleText || 'এই পরিবহনের সময়সূচী পাওয়া যায়নি।',
                            })
                          }
                          className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-center text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700"
                        >
                          📋 সূচী দেখুন
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {selectedSchedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
                    Bus Schedule
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-slate-900">
                    {selectedSchedule.title}
                  </h2>
                  {selectedSchedule.phone && (
                    <p className="mt-2 text-sm font-bold text-slate-600">
                      📞 {selectedSchedule.phone}
                    </p>
                  )}
                  {selectedSchedule.address && (
                    <p className="mt-1 text-sm font-bold text-slate-600">
                      📍 {selectedSchedule.address}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSchedule(null)}
                  className="rounded-full bg-red-50 px-4 py-2 text-lg font-black text-red-600 transition hover:bg-red-100"
                >
                  ×
                </button>
              </div>

              <div className="rounded-[22px] bg-emerald-50 p-5">
                <h3 className="mb-3 text-lg font-black text-emerald-800">
                  গাড়ি ছাড়ার সময়-সূচী
                </h3>
                <p className="whitespace-pre-line text-base font-semibold leading-8 text-slate-700">
                  {selectedSchedule.schedule}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSchedule(null)}
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