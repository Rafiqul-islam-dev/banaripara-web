import AppShell from '@/components/AppShell';
import Header from '@/components/Header';

export default function PrivacyPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <Header
          title="গোপনীয়তা"
          badge="Privacy"
          icon="🛡️"
          subtitle="ব্যবহারকারীর তথ্য এবং অ্যাপে যুক্ত করা তথ্য কীভাবে ব্যবহৃত হবে।"
        />

        <section className="card space-y-4 p-6 md:p-8">
          <h2 className="text-2xl font-black text-slate-900">Privacy Policy</h2>
          <p className="leading-8 text-slate-600">
            এই ওয়েবসাইট ও অ্যাপে registration করলে আপনার নাম, ফোন নাম্বার এবং প্রয়োজনীয় basic তথ্য Firebase database-এ সংরক্ষণ করা হতে পারে। এই তথ্য মূলত login, তথ্য জমা দেওয়া এবং submitted information tracking করার জন্য ব্যবহার করা হয়।
          </p>
          <p className="leading-8 text-slate-600">
            ব্যবহারকারী কোনো তথ্য যোগ করলে সেটি সরাসরি প্রকাশ হয় না। অ্যাডমিন যাচাই করার পর approved তথ্য ওয়েবসাইট ও অ্যাপে দেখা যায়। ভুল তথ্য থাকলে correction request করা যাবে।
          </p>
          <p className="leading-8 text-slate-600">
            কোনো ব্যক্তিগত sensitive তথ্য public করার আগে সতর্ক থাকুন। জরুরি সেবা, প্রতিষ্ঠান, ব্যবসা বা public contact information যুক্ত করার সময় সঠিক তথ্য দেওয়ার অনুরোধ রইল।
          </p>
        </section>
      </div>
    </AppShell>
  );
}
