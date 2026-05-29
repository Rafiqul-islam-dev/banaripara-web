import Link from 'next/link';
import AppShell from '@/components/AppShell';
import EmptyState from '@/components/EmptyState';
import { aboutMenuItems, getAboutItem } from '@/lib/aboutMenu';
import {
  overviewStats,
  overviewParagraphs,
  freedomParagraphs,
  municipalityInfo,
  unionData,
  schoolData,
  famousPersons,
  hatBazarList,
} from '@/lib/aboutData';

export function generateStaticParams() {
  return aboutMenuItems.map((item) => ({ slug: item.slug }));
}

function Hero({ item }) {
  return (
    <section className="overflow-hidden rounded-[32px] bg-white shadow-soft">
      <div className="relative h-64 md:h-96">
        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8">
          <div className="mb-3 inline-grid h-16 w-16 place-items-center rounded-3xl bg-white/20 text-4xl font-black backdrop-blur">
            <img
              src={item.icon}
              alt={item.title}
              className="h-14 w-14 object-contain"
            />
          </div>
          <h1 className="text-3xl font-black md:text-5xl">{item.title}</h1>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-white/85 md:text-base">{item.description}</p>
        </div>
      </div>
    </section>
  );
}

function InfoGrid({ rows }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {rows.map((row, index) => {
        const label = Array.isArray(row) ? row[0] : row.split(':')[0];
        const value = Array.isArray(row) ? row[1] : row.substring(row.indexOf(':') + 1).replace('।', '').trim();
        return (
          <div key={`${label}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-1 text-lg font-black text-slate-900">{value || row}</p>
          </div>
        );
      })}
    </div>
  );
}

function OverviewSection() {
  return (
    <div className="space-y-6">
      <section className="card p-5 md:p-7">
        <h2 className="mb-5 text-2xl font-black text-emerald-700">বানারীপাড়ার পরিসংখ্যান</h2>
        <InfoGrid rows={overviewStats} />
      </section>
      <section className="card p-5 md:p-7">
        <h2 className="mb-4 text-2xl font-black text-slate-900">এক নজরে বানারীপাড়া উপজেলার ঐতিহ্য</h2>
        <div className="space-y-4 text-justify text-base font-semibold leading-8 text-slate-600 md:text-lg">
          {overviewParagraphs.map((text, index) => <p key={index}>{text}</p>)}
        </div>
      </section>
    </div>
  );
}

function FreedomSection() {
  return (
    <section className="card p-5 md:p-7">
      <h2 className="mb-4 text-2xl font-black text-emerald-700">৭১’র মুক্তিযুদ্ধে বানারীপাড়ার সংক্ষিপ্ত ইতিহাস</h2>
      <div className="space-y-4 text-justify text-base font-semibold leading-8 text-slate-600 md:text-lg">
        {freedomParagraphs.map((text, index) => <p key={index}>{text}</p>)}
      </div>
    </section>
  );
}

function MunicipalitySection() {
  return (
    <section className="card p-5 md:p-7">
      <h2 className="mb-5 text-2xl font-black text-emerald-700">এক নজরে পৌরসভা</h2>
      <InfoGrid rows={municipalityInfo} />
    </section>
  );
}

function MapSection() {
  return (
    <section className="card overflow-hidden p-3 md:p-4">
      <img src="/images/banariparamap.png" alt="বানারীপাড়ার ম্যাপ" className="w-full rounded-[28px] object-contain" />
      <div className="p-4">
        <a
          href="https://maps.google.com/?q=Banaripara%2C%20Barishal"
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white"
        >
          Google Map খুলুন
        </a>
      </div>
    </section>
  );
}

function UnionSection() {
  return (
    <section className="grid gap-5 md:grid-cols-2">
      {unionData.map((item) => (
        <article key={item.name} className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-100">
          <img src={item.image} alt={item.name} className="h-44 w-full object-cover" />
          <div className="space-y-4 p-5">
            <h2 className="text-2xl font-black text-emerald-700">{item.name}</h2>
            <InfoGrid rows={[
              ['জনসংখ্যা', item.population],
              ['আয়তন', item.area],
              ['গ্রাম', item.villageCount],
              ['মৌজা', item.moujaCount],
              ['হাট-বাজার', item.hatBajarCount],
              ['যোগাযোগ', item.jogajog],
              ['শিক্ষার হার', item.educationRate],
              ['ভোট কেন্দ্র', item.votingCenter],
              ['সরকারি প্রাথমিক বিদ্যালয়', item.primaryGovtCount],
              ['বেসরকারি প্রাথমিক বিদ্যালয়', item.privateGovtCount],
              ['উচ্চ বিদ্যালয়', item.higherSchool],
              ['মাদ্রাসা', item.madrasha],
            ]} />
            <ListBlock title="গ্রামসমূহ" items={item.villages} />
            <ListBlock title="হাট-বাজার" items={item.markets} />
            <ListBlock title="শিক্ষা প্রতিষ্ঠান" items={item.educationalInstitutions} />
          </div>
        </article>
      ))}
    </section>
  );
}

function ListBlock({ title, items }) {
  return (
    <div>
      <h3 className="mb-2 text-lg font-black text-slate-900">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((text, index) => (
          <span key={`${text}-${index}`} className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

function EducationSection() {
  return (
    <section className="card overflow-hidden p-0">
      <div className="border-b border-slate-100 p-5 md:p-7">
        <h2 className="text-2xl font-black text-emerald-700">শিক্ষা প্রতিষ্ঠান তালিকা</h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">মোবাইল অ্যাপের static education list অনুযায়ী তথ্য দেখানো হচ্ছে।</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-left">
          <thead className="bg-emerald-50 text-sm font-black text-emerald-800">
            <tr>
              <th className="px-4 py-3">নং</th>
              <th className="px-4 py-3">প্রতিষ্ঠানের নাম</th>
              <th className="px-4 py-3">EIIN</th>
              <th className="px-4 py-3">প্রধানের নাম</th>
              <th className="px-4 py-3">মোবাইল</th>
              <th className="px-4 py-3">অবস্থান</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-600">
            {schoolData.map((item) => (
              <tr key={`${item.no}-${item.name}`} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-black text-emerald-700">{item.no}</td>
                <td className="px-4 py-3 font-black text-slate-900">{item.name}</td>
                <td className="px-4 py-3">{item.eiin}</td>
                <td className="px-4 py-3">{item.principal}</td>
                <td className="px-4 py-3">{item.mobile}</td>
                <td className="px-4 py-3">{item.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PersonsSection() {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {famousPersons.map((person, index) => (
        <article key={`${person.name}-${index}`} className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-emerald-100">
          <h2 className="text-xl font-black text-emerald-700">{person.name}</h2>
          {person.duration && <p className="mt-1 text-sm font-bold text-slate-500">{person.duration}</p>}
          <p className="mt-3 text-justify text-sm font-semibold leading-7 text-slate-600">{person.description}</p>
        </article>
      ))}
    </section>
  );
}

function MarketsSection() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {hatBazarList.map((name, index) => {
        const query = encodeURIComponent(`${name} বানারীপাড়া, বরিশাল`);
        return (
          <a
            key={`${name}-${index}`}
            href={`https://maps.google.com/?q=${query}`}
            target="_blank"
            rel="noreferrer"
            className="group rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-soft hover:ring-emerald-100"
          >
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-3xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white">🏪</div>
              <div>
                <h2 className="text-lg font-black text-slate-900">{name}</h2>
                <p className="mt-1 text-sm font-bold text-emerald-600">Google Map এ দেখুন →</p>
              </div>
            </div>
          </a>
        );
      })}
    </section>
  );
}

function RenderContent({ item }) {
  if (item.type === 'overview') return <OverviewSection />;
  if (item.type === 'map') return <MapSection />;
  if (item.type === 'freedom') return <FreedomSection />;
  if (item.type === 'municipality') return <MunicipalitySection />;
  if (item.type === 'unions') return <UnionSection />;
  if (item.type === 'education') return <EducationSection />;
  if (item.type === 'persons') return <PersonsSection />;
  if (item.type === 'markets') return <MarketsSection />;

  return (
    <section className="card p-6 md:p-8">
      <p className="text-lg font-semibold leading-9 text-slate-600">{item.description}</p>
    </section>
  );
}

export default function AboutDetailsPage({ params }) {
  const item = getAboutItem(params.slug);

  if (!item) {
    return (
      <AppShell>
        <EmptyState title="তথ্য পাওয়া যায়নি" message="সঠিক menu থেকে আবার চেষ্টা করুন।" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <Link href="/about" className="inline-flex items-center rounded-2xl bg-emerald-50 px-4 py-2 font-black text-emerald-700">
          ← আমাদের বানারীপাড়া
        </Link>
        <Hero item={item} />
        <RenderContent item={item} />
      </div>
    </AppShell>
  );
}
