import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';

import { app, db } from '@/lib/firebase';

const TOKEN_COLLECTION = 'web_push_tokens';

function getDeviceInfo() {
  if (typeof window === 'undefined') {
    return {
      userAgent: '',
      platform: '',
    };
  }

  return {
    userAgent: window.navigator.userAgent || '',
    platform: window.navigator.platform || '',
  };
}

async function registerServiceWorker() {
  if (typeof window === 'undefined') return null;

  if (!('serviceWorker' in navigator)) {
    throw new Error('এই browser service worker support করে না।');
  }

  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  return registration;
}

async function saveTokenToFirestore(token) {
  if (!token) return;

  const tokenQuery = query(
    collection(db, TOKEN_COLLECTION),
    where('token', '==', token)
  );

  const snapshot = await getDocs(tokenQuery);

  if (!snapshot.empty) {
    return;
  }

  const deviceInfo = getDeviceInfo();

  await addDoc(collection(db, TOKEN_COLLECTION), {
    token,
    source: 'pwa',
    platform: deviceInfo.platform,
    user_agent: deviceInfo.userAgent,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
}

export async function enableWebPushNotification() {
  if (typeof window === 'undefined') {
    throw new Error('Browser environment পাওয়া যায়নি।');
  }

  if (!('Notification' in window)) {
    throw new Error('এই browser notification support করে না।');
  }

  const supported = await isSupported();

  if (!supported) {
    throw new Error('এই browser Firebase Messaging support করে না।');
  }

  const permission = await Notification.requestPermission();

  if (permission !== 'granted') {
    throw new Error('Notification permission allow করা হয়নি।');
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

  if (!vapidKey) {
    throw new Error('NEXT_PUBLIC_FIREBASE_VAPID_KEY .env.local এ পাওয়া যায়নি।');
  }

  const registration = await registerServiceWorker();
  const messaging = getMessaging(app);

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    throw new Error('FCM token generate হয়নি।');
  }

  await saveTokenToFirestore(token);

  return token;
}

export function getNotificationPermissionStatus() {
  if (typeof window === 'undefined') return 'unsupported';

  if (!('Notification' in window)) return 'unsupported';

  return Notification.permission;
}