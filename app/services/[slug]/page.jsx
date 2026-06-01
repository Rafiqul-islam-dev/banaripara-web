'use client';

import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, getDocs, limit, query, serverTimestamp, startAfter } from 'firebase/firestore';

import AppShell from '@/components/AppShell';
import EmptyState from '@/components/EmptyState';
import Header from '@/components/Header';
import { db } from '@/lib/firebase';
import { doctorSpecialties, getService, isApproved } from '@/lib/serviceConfig';
import { getUser } from '@/lib/auth';

const SERVICE_PAGE_SIZE = 30;

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

function isBloodDonorService(service) {
  if (!service) return false;

  return (
    service.slug === 'blood' ||
    service.slug === 'blood-donors' ||
    service.slug === 'blood_donors' ||
    service.collection === 'blood_donors'
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

function getTreatmentText(item) {
  return valueForCard(item, [
    'treatment',
    'treatments',
    'diseases',
    'disease',
    'disease_treatment',
    'diseaseTreatment',
    'diseases_treated',
    'treatment_details',
    'medical_services',
    'services',
    'service_details',
    'যেই যেই রোগের চিকিৎসা করেন',
  ]);
}

function getRoleText(item) {
  return valueForCard(item, [
    'designation',
    'service_type',
    'position',
    'post',
    'rank',
    'type',
    'category',
    'পদবি',
    'সেবার ধরন',
  ]);
}

function getLongDetailsText(item) {
  return valueForCard(item, [
    'details',
    'description',
    'service_details',
    'specialist',
    'specialty',
    'designation',
    'education',
    'experience',
    'treatment',
    'treatments',
    'diseases',
    'disease_treatment',
    'diseases_treated',
    'treatment_details',
    'medical_services',
    'যেই যেই রোগের চিকিৎসা করেন',
  ]);
}

function getTitle(item, service) {
  return valueForCard(item, [
    'name',
    'title',
    'job_title',
    'transport_name',
    'bus_name',
  ]) || service?.title || 'তথ্য';
}

function timestampToText(value) {
  if (!value) return '';

  try {
    const date = value?.toDate ? value.toDate() : new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleString('bn-BD', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function ShareModal({ item, service, onClose }) {
  const t = { accent: '#059669' };
  const title = valueForCard(item, ['name','title','job_title','bus_name']) || service?.title || 'বানারীপাড়া';
  const phone = valueForCard(item, ['phone','mobile','number']);
  const address = valueForCard(item, ['address','route','chamber']);
  const details = valueForCard(item, ['details','description','service_type','specialty','designation','blood_group','bloodGroup']);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `${service?.title}: ${title}${phone ? '\n📞 ' + phone : ''}${address ? '\n📍 ' + address : ''}${details ? '\n' + details.slice(0,80) + (details.length>80?'...':'') : ''}\n\n🌐 ${pageUrl}`;

  const platforms = [
    {
      name: 'WhatsApp',
      color: '#25D366',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" style={{width:22,height:22}}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      url: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'Facebook',
      color: '#1877F2',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" style={{width:22,height:22}}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&quote=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'Telegram',
      color: '#229ED9',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" style={{width:22,height:22}}>
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
      url: `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'SMS',
      color: '#6b7280',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:22,height:22}}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      url: `sms:?body=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'কপি করুন',
      color: '#374151',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:22,height:22}}>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      ),
      action: () => {
        navigator.clipboard?.writeText(shareText).then(() => {
          alert('তথ্য কপি হয়েছে!');
          onClose();
        });
      },
    },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed',inset:0,zIndex:9999,
        background:'rgba(0,0,0,0.55)',
        display:'flex',alignItems:'flex-end',justifyContent:'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:'100%',maxWidth:480,
          background:'#fff',
          borderRadius:'28px 28px 0 0',
          padding:'8px 0 40px',
          boxShadow:'0 -16px 60px rgba(0,0,0,0.18)',
          animation:'slideUp 0.25s ease',
        }}
      >
        <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        {/* drag handle */}
        <div style={{width:40,height:4,background:'#e2e8f0',borderRadius:99,margin:'12px auto 20px'}} />

        <div style={{padding:'0 20px 16px',borderBottom:'1px solid #f1f5f9'}}>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:t.accent,margin:'0 0 4px'}}>শেয়ার করুন</p>
          <p style={{fontSize:17,fontWeight:700,color:'#0f172a',margin:0,lineHeight:1.4}}>{title}</p>
          {phone && <p style={{fontSize:13,color:'#64748b',margin:'4px 0 0'}}>📞 {phone}</p>}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,padding:'20px 16px'}}>
          {platforms.map(p => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                if (p.action) { p.action(); return; }
                window.open(p.url, '_blank', 'noopener');
                onClose();
              }}
              style={{
                display:'flex',flexDirection:'column',alignItems:'center',gap:6,
                background:'none',border:'none',cursor:'pointer',padding:'8px 4px',
                borderRadius:16,
              }}
            >
              <div style={{
                width:52,height:52,borderRadius:16,
                background:p.color,color:'#fff',
                display:'flex',alignItems:'center',justifyContent:'center',
              }}>
                {p.icon}
              </div>
              <span style={{fontSize:11,fontWeight:600,color:'#475569',textAlign:'center',lineHeight:1.2}}>{p.name}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            display:'block',width:'calc(100% - 32px)',margin:'0 16px',
            padding:'14px',borderRadius:20,border:'none',
            background:'#f1f5f9',color:'#475569',fontSize:15,fontWeight:700,cursor:'pointer',
          }}
        >
          বাতিল করুন
        </button>
      </div>
    </div>
  );
}

function DetailsModal({ item, service, onClose }) {
  const isDoctorService = service?.slug === 'doctors';
  const isBloodService = isBloodDonorService(service);
  const title = getTitle(item, service);
  const phone = valueForCard(item, ['phone', 'mobile', 'number']);
  const address = valueForCard(item, ['address', 'route']);
  const chamber = valueForCard(item, ['chamber']);
  const role = getRoleText(item);
  const treatment = getTreatmentText(item);
  const bloodGroup = valueForCard(item, ['blood_group', 'bloodGroup', 'group', 'blood']);
  const lastDonation = valueForCard(item, ['last_donation', 'lastDonation', 'last_donate_date']);
  const details = valueForCard(item, ['details', 'description', 'service_details']);

  const rows = [
    ['পদবি/সেবার ধরন', role],
    ...(isBloodService ? [['রক্তের গ্রুপ', bloodGroup]] : []),
    ...(isDoctorService
      ? [['বিশেষত্ব/ক্যাটাগরি', valueForCard(item, ['category', 'specialty', 'specialist'])]]
      : []),
    ...(isDoctorService ? [['শিক্ষাগত যোগ্যতা', item.education]] : []),
    ...(isDoctorService
      ? [['বর্তমান কর্মস্থল', item.workplace || item.current_workplace]]
      : []),
    [isDoctorService ? 'চেম্বার' : 'ঠিকানা', isDoctorService ? chamber || address : address],
    ...(isDoctorService ? [['অভিজ্ঞতা', item.experience]] : []),
    ['অফিস সময়', item.office_time],
    ...(isBloodService ? [['শেষ রক্তদান', lastDonation]] : []),
    ...(isDoctorService ? [['যেই যেই রোগের চিকিৎসা করেন', treatment]] : []),
    ['বিস্তারিত', details],
    ['ফোন', phone],
    ['সময়', timestampToText(item.created_at || item.createdAt)],
  ].filter(([, value]) => value);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-[30px] bg-white p-5 shadow-2xl md:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600">
              বিস্তারিত তথ্য
            </p>
            <h2 className="mt-2 text-2xl font-black leading-snug text-slate-900">
              {title}
            </h2>
            {role && (
              <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                {role}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-xl font-black text-red-600 transition hover:bg-red-100"
          >
            ×
          </button>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-4 font-bold text-slate-500">
            বিস্তারিত তথ্য পাওয়া যায়নি।
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-black text-emerald-700">{label}</p>
                <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-7 text-slate-700">
                  {String(value)}
                </p>
              </div>
            ))}
          </div>
        )}

        {phone && (
          <a
            href={`tel:${phone}`}
            className="mt-5 block rounded-2xl bg-emerald-600 px-5 py-3 text-center font-black text-white transition hover:bg-emerald-700"
          >
            📞 কল করুন
          </a>
        )}
      </div>
    </div>
  );
}

function ScheduleModal({ item, onClose }) {
  const title = getTitle(item, { title: 'বাসের সময়সূচি' });
  const schedule = getBusScheduleText(item) || 'এই পরিবহনের সময়সূচী পাওয়া যায়নি।';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-[30px] bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600">
              গাড়ি ছাড়ার সময়-সূচী
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-xl font-black text-red-600"
          >
            ×
          </button>
        </div>

        <div className="rounded-3xl bg-emerald-50 p-5">
          <p className="whitespace-pre-line text-base font-bold leading-8 text-slate-700">
            {schedule}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white"
        >
          বন্ধ করুন
        </button>
      </div>
    </div>
  );
}

function CardButton({ children, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition active:scale-[0.98] ${className}`}
    >
      {children}
    </button>
  );
}

function MiniInfo({ icon, children }) {
  if (!children) return null;

  return (
    <div className="flex items-start gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-bold leading-6 text-slate-600">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
}

function ServiceCard({ item, service, onShare, onDetails, onSchedule }) {
  const title = getTitle(item, service);
  const phone = valueForCard(item, ['phone', 'mobile', 'number']);
  const address = valueForCard(item, ['address', 'route', 'chamber']);
  const category = valueForCard(item, ['category', 'specialty', 'specialist']);
  const role = getRoleText(item);
  const treatment = getTreatmentText(item);
  const details = getLongDetailsText(item);
  const image = valueForCard(item, ['image', 'image_url', 'photo']);
  const bloodGroup = valueForCard(item, ['blood_group', 'bloodGroup', 'group', 'blood']);
  const lastDonation = valueForCard(item, ['last_donation', 'lastDonation', 'last_donate_date']);
  const busService = isBusScheduleService(service);
  const isDoctor = service?.slug === 'doctors';
  const isPolice = service?.slug === 'police';
  const isHospital = service?.slug === 'hospitals';
  const isBlood = isBloodDonorService(service);
  const hasExtraDetails = Boolean(
    details ||
    treatment ||
    role ||
    item.education ||
    item.experience ||
    item.office_time ||
    item.workplace ||
    item.current_workplace ||
    bloodGroup ||
    lastDonation
  );

  const headerIcon = busService
    ? '🚌'
    : isDoctor
      ? '🩺'
      : isHospital
        ? '🏥'
        : isBlood
          ? '🩸'
          : service?.icon
            ? null
            : '📋';

  const label = isDoctor ? 'ডাক্তার' : busService ? 'বাস সার্ভিস' : service?.title;

  return (
    <article className="group relative overflow-hidden rounded-[32px] border border-emerald-100/70 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_24px_80px_rgba(16,185,129,0.18)]">
      <div className="relative min-h-[132px] overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-slate-900 p-5 text-white">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 right-8 h-40 w-40 rounded-full bg-emerald-300/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_32%)]" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 pb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white/90 ring-1 ring-white/15">
              <span>{busService ? 'Bus' : isDoctor ? 'Doctor' : 'Info'}</span>
            </div>

            <h3 className="mt-3 line-clamp-2 text-2xl font-black leading-snug text-white">
              {title}
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              {category && (
                <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-black text-white ring-1 ring-white/15">
                  {category}
                </span>
              )}
              {bloodGroup && (
                <span className="rounded-full bg-red-500/30 px-3 py-1 text-xs font-black text-white ring-1 ring-white/20">
                  🩸 {bloodGroup}
                </span>
              )}
              {role && (isPolice || !category) && (
                <span className="rounded-full bg-sky-400/25 px-3 py-1 text-xs font-black text-white ring-1 ring-white/15">
                  {role}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onShare}
            title="শেয়ার করুন"
            className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/25 active:scale-95"
          >
            ↗
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="relative px-5 pb-5">
        <div className="-mt-14 mb-4 flex items-end gap-4">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[28px] border-4 border-white bg-emerald-50 shadow-xl shadow-emerald-100">
            {image || isDoctor ? (
              <img
                src={image || '/images/doctordefult.png'}
                alt={title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  if (isDoctor) e.currentTarget.src = '/images/doctordefult.png';
                  else e.currentTarget.style.display = 'none';
                }}
              />
            ) : isBlood ? (
              <div className="flex h-full w-full flex-col items-center justify-center bg-red-50 text-red-600">
                <span className="text-3xl">🩸</span>
                <span className="mt-1 text-xl font-black">{bloodGroup || 'রক্ত'}</span>
              </div>
            ) : service?.icon ? (
              <img src={service.icon} alt="" className="h-14 w-14 object-contain" />
            ) : (
              <span className="text-5xl">{headerIcon}</span>
            )}
          </div>

          <div className="mb-2 min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
              {label}
            </p>
            {phone && (
              <a href={`tel:${phone}`} className="mt-1 inline-block max-w-full truncate text-sm font-black text-slate-700 hover:text-emerald-700">
                📞 {phone}
              </a>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {bloodGroup && <MiniInfo icon="🩸">রক্তের গ্রুপ: {bloodGroup}</MiniInfo>}
          {lastDonation && <MiniInfo icon="⏰">শেষ রক্তদান: {lastDonation}</MiniInfo>}
          {item.education && <MiniInfo icon="🎓">{item.education}</MiniInfo>}
          {item.chamber && <MiniInfo icon="🏥">{item.chamber}</MiniInfo>}
          {address && !item.chamber && <MiniInfo icon="📍">{address}</MiniInfo>}
          {item.office_time && <MiniInfo icon="🕐">{item.office_time}</MiniInfo>}
        </div>

        {treatment && (
          <button
            type="button"
            onClick={onDetails}
            className="mt-4 w-full rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 text-left transition hover:border-emerald-200 hover:shadow-sm"
          >
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">
              চিকিৎসা করেন
            </p>
            <p className="mt-2 line-clamp-2 text-sm font-bold leading-7 text-slate-700">
              🩺 {treatment}
            </p>
            <p className="mt-2 text-xs font-black text-emerald-700">বিস্তারিত দেখতে ক্লিক করুন →</p>
          </button>
        )}

        {!treatment && details && (
          <button
            type="button"
            onClick={onDetails}
            className="mt-4 w-full rounded-3xl bg-slate-50 p-4 text-left transition hover:bg-emerald-50"
          >
            <p className="line-clamp-2 text-sm font-semibold leading-7 text-slate-600">
              {details}
            </p>
            <p className="mt-2 text-xs font-black text-emerald-700">বিস্তারিত দেখুন →</p>
          </button>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700 active:scale-[0.98]"
            >
              📞 কল করুন
            </a>
          )}

          {busService && (
            <CardButton
              onClick={onSchedule}
              className="bg-amber-500 text-white shadow-lg shadow-amber-100 hover:bg-amber-600"
            >
              📋 সূচী দেখুন
            </CardButton>
          )}

          {hasExtraDetails && !treatment && !details && (
            <CardButton
              onClick={onDetails}
              className="bg-slate-900 text-white shadow-lg shadow-slate-100 hover:bg-slate-700"
            >
              বিস্তারিত দেখুন
            </CardButton>
          )}

          <CardButton
            onClick={onShare}
            className="border border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            🔗 শেয়ার
          </CardButton>
        </div>
      </div>
    </article>
  );
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
  const [shareItem, setShareItem] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [scheduleItem, setScheduleItem] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  useEffect(() => {
    if (!service) return;

    async function loadData() {
      setLoading(true);
      setItems([]);
      setLastDoc(null);
      setHasMore(false);

      try {
        const firstQuery = query(collection(db, service.collection), limit(SERVICE_PAGE_SIZE));
        const snap = await getDocs(firstQuery);
        const list = snap.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .filter((data) => isApproved(data));

        setItems(list);
        setLastDoc(snap.docs[snap.docs.length - 1] || null);
        setHasMore(snap.docs.length === SERVICE_PAGE_SIZE);
      } catch (error) {
        console.error('Service data load error:', error);
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
      const nextUrl = `${pathname}${selectedDoctorCategory ? `?category=${encodeURIComponent(selectedDoctorCategory)}` : ''}`;
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
      console.error('Submit info error:', error);
      setMessage('তথ্য জমা দিতে সমস্যা হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  const loadMoreItems = async () => {
    if (!service || !lastDoc || loadingMore) return;

    setLoadingMore(true);

    try {
      const nextQuery = query(
        collection(db, service.collection),
        startAfter(lastDoc),
        limit(SERVICE_PAGE_SIZE)
      );

      const snap = await getDocs(nextQuery);
      const list = snap.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .filter((data) => isApproved(data));

      setItems((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const uniqueNewItems = list.filter((item) => !existingIds.has(item.id));
        return [...prev, ...uniqueNewItems];
      });
      setLastDoc(snap.docs[snap.docs.length - 1] || lastDoc);
      setHasMore(snap.docs.length === SERVICE_PAGE_SIZE);
    } catch (error) {
      console.error('Load more service data error:', error);
      setMessage('আরও তথ্য load করতে সমস্যা হয়েছে।');
    } finally {
      setLoadingMore(false);
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
              <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">
                Doctor Categories
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">
                কোন রোগ হলে কোন ডাক্তারের কাছে যাবেন
              </h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                নিচের ক্যাটাগরি থেকে আপনার প্রয়োজনীয় বিশেষজ্ঞ নির্বাচন করুন।
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {doctorSpecialties.map((item) => (
                <a
                  key={item.title}
                  href={buildDoctorCategoryUrl(item.title)}
                  className="group rounded-[24px] border border-slate-100 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-soft"
                >
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="mx-auto h-16 w-16 object-contain transition group-hover:scale-110"
                  />
                  <h3 className="mt-3 text-sm font-black leading-6 text-slate-800 md:text-base">
                    {item.title}
                  </h3>
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
                const targetUrl = service.slug === 'doctors' && selectedDoctorCategory
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
                type="button"
                onClick={requireLoginForAdd}
                className="rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700"
              >
                + {service.addText}
              </button>
            </div>
          </div>

          {message && (
            <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 font-bold text-emerald-700">
              {message}
            </p>
          )}
        </section>

        {openForm && (
          <form onSubmit={submitInfo} className="card p-5 md:p-7">
            <h2 className="mb-2 text-2xl font-black text-slate-900">{service.addText}</h2>
            <p className="mb-5 text-sm font-semibold text-slate-500">
              আপনার দেওয়া তথ্য pending থাকবে। Admin approve করার পর ওয়েবসাইট ও অ্যাপে দেখা যাবে।
            </p>

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

            <button
              disabled={saving}
              className="mt-5 rounded-2xl bg-emerald-600 px-6 py-3 font-black text-white shadow-lg shadow-emerald-100 disabled:opacity-60"
            >
              {saving ? 'জমা হচ্ছে...' : 'তথ্য জমা দিন'}
            </button>
          </form>
        )}

        {loading ? (
          <div className="card flex min-h-[240px] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
          </div>
        ) : filtered.length === 0 ? (
          !showDoctorCategoryGrid && (
            <EmptyState title="কোনো তথ্য পাওয়া যায়নি" message="এই ক্যাটাগরিতে approved তথ্য পাওয়া যায়নি।" />
          )
        ) : (
          <>
            <p className="px-1 text-sm font-black text-slate-500">
              {filtered.length}টি তথ্য পাওয়া গেছে
            </p>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => (
                <ServiceCard
                  key={item.id}
                  item={item}
                  service={service}
                  onShare={() => setShareItem(item)}
                  onDetails={() => setDetailsItem(item)}
                  onSchedule={() => setScheduleItem(item)}
                />
              ))}
            </section>

            {hasMore && !search.trim() && (
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={loadMoreItems}
                  disabled={loadingMore}
                  className="rounded-2xl bg-emerald-600 px-6 py-3 font-black text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {loadingMore ? 'আরও তথ্য আসছে...' : 'আরও তথ্য দেখুন'}
                </button>
              </div>
            )}
          </>
        )}

        {shareItem && (
          <ShareModal
            item={shareItem}
            service={service}
            onClose={() => setShareItem(null)}
          />
        )}

        {detailsItem && (
          <DetailsModal
            item={detailsItem}
            service={service}
            onClose={() => setDetailsItem(null)}
          />
        )}

        {scheduleItem && (
          <ScheduleModal
            item={scheduleItem}
            onClose={() => setScheduleItem(null)}
          />
        )}
      </div>
    </AppShell>
  );
}
