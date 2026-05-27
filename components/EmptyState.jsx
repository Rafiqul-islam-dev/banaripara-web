export default function EmptyState({ title = 'কোনো তথ্য পাওয়া যায়নি', message = 'নতুন তথ্য যুক্ত হলে এখানে দেখা যাবে।' }) {
  return (
    <div className="card flex min-h-[240px] items-center justify-center p-8 text-center">
      <div>
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-4xl">📭</div>
        <h3 className="text-xl font-black text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}
