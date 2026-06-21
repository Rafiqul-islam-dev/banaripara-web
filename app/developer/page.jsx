import AppShell from '@/components/AppShell';

const infoCards = [
  {
    icon: '👤',
    title: 'পরিচিতি',
    text: 'আমি রফিকুল ইসলাম সোহেল। ২০১৯ সাল থেকে ওয়েব ও মোবাইল অ্যাপ্লিকেশন ডেভেলপমেন্ট নিয়ে কাজ করছি। Laravel, PHP, React, Vue এবং Flutter নিয়ে কাজের অভিজ্ঞতা রয়েছে।',
  },
  {
    icon: '💼',
    title: 'কাজের ধরন',
    text: 'Business website, School Website, Personal Website, Admin panel, Mobile app, Custom software, Laravel API এবং full-stack web application development নিয়ে কাজ করা হয়।',
  },
  {
    icon: '💚',
    title: 'এই অ্যাপ সম্পর্কে',
    text: 'আমাদের বানারীপাড়া অ্যাপটি স্থানীয় তথ্য সহজে খুঁজে পাওয়া এবং নতুন তথ্য অ্যাডমিন অনুমোদনের মাধ্যমে প্রকাশ করার জন্য তৈরি করা হয়েছে।',
  },
];

export default function DeveloperPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6 pb-10">
        <section className="overflow-hidden rounded-b-[42px] bg-gradient-to-br from-emerald-700 via-emerald-500 to-teal-500 px-6 py-10 text-center text-white shadow-2xl shadow-emerald-100">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-emerald-100">
            Developer Info
          </p>
          <h1 className="mt-4 text-4xl font-black md:text-5xl">
            Rafiqul Islam Sohel
          </h1>
          <p className="mt-4 text-2xl font-light text-white/90">
            Software Developer
          </p>
        </section>

        <div className="space-y-5 px-1">
          {infoCards.map((item) => (
            <section
              key={item.title}
              className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-50 md:p-8"
            >
              <div className="flex gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-4xl">
                  {item.icon}
                </div>

                <div>
                  <h2 className="text-2xl font-black text-emerald-800">
                    {item.title}
                  </h2>
                  <p className="mt-4 text-xl leading-[1.9] text-slate-700">
                    {item.text}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="grid gap-4 px-1 sm:grid-cols-2">
          <a
            href="https://www.sohelrana.bd"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-3 rounded-[24px] bg-emerald-600 px-6 py-5 text-xl font-bold text-white shadow-xl shadow-emerald-100 transition hover:bg-emerald-700"
          >
            <span className="text-2xl">🌐</span>
            Website Visit করুন
          </a>

          <a
            href="call:01714963096"
            className="flex items-center justify-center gap-3 rounded-[24px] border border-emerald-200 bg-white px-6 py-5 text-xl font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            <span className="text-2xl">📞</span>
            01714963096
          </a>
        </div>
      </div>
    </AppShell>
  );
}