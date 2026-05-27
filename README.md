# প্রাণের বানারীপাড়া - React Website

এটি Flutter mobile app-এর user-side features অনুযায়ী তৈরি করা Next.js + Firebase ওয়েব অ্যাপ। Vercel-এ deploy করা যাবে।

## Features

- User registration/login using existing Firestore `users` collection
- Mobile app-এর মতো dashboard এবং service category grid
- Existing app icon/images copied from Flutter `images/` folder
- Service/category wise approved data view
- User can submit new information; admin approval না হওয়া পর্যন্ত pending থাকবে
- Current month notification list from `notifications` collection
- Admin profile view from `admin_profiles`
- Responsive mobile-first design with bottom navigation

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` এ Firebase Web Config বসান:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Vercel Deploy

1. Project GitHub এ push করুন
2. Vercel থেকে import করুন
3. Environment Variables এ `.env.local` এর values বসান
4. Deploy করুন

## Firestore Collections Used

- users
- app_banners
- notifications
- admin_profiles
- doctors
- hospitals
- busschedule
- historical_place
- house_rent
- shopping_services
- courier_service
- police_services
- electricity_offices
- diagnostic_centers
- blood_donors
- vehicle_rent_services
- mechanic_services
- emergency_services
- jobs
- entrepreneurs
- teachers
- parlors
- restaurants
- flat_land
- education_institutions

## Approval Logic

Website only shows documents where one of these is approved:

- `approved: true` or `approved: 1`
- `approve: true` or `approve: 1`
- `approval: true` or `approval: 1`
- `status: "approved"`

New submitted data will save as:

```js
approved: 0,
approve: 0,
approval: 0,
status: 'pending'
```

Admin panel থেকে approve করলে website/mobile app-এ show করবে।
