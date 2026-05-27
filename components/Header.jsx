export default function Header({ title, subtitle, badge, icon = '🌿' }) {
  return (
    <section className="green-gradient overflow-hidden rounded-[32px] p-6 text-white shadow-soft md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          {badge && <p className="mb-2 text-xs font-black uppercase tracking-[0.35em] text-emerald-100">{badge}</p>}
          <h1 className="text-3xl font-black md:text-5xl">{title}</h1>
          {subtitle && <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-50 md:text-base">{subtitle}</p>}
        </div>
        <div className="hidden rounded-3xl bg-white/15 p-6 text-5xl backdrop-blur md:block">{icon}</div>
      </div>
    </section>
  );
}
