import {
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';

import { app, db } from '@/lib/firebase';

const TOKEN_COLLECTION = 'web_push_tokens';
const ENABLED_KEY = 'banaripara_web_push_enabled';
const LAST_ERROR_KEY = 'banaripara_web_push_last_error';

function getDeviceInfo() {
  if (typeof window === 'undefined') {
    return {
      userAgent: '',
      platform: '',
      language: '',
      url: '',
    };
  }

  return {
    userAgent: window.navigator.userAgent || '',
    platform: window.navigator.platform || '',
    language: window.navigator.language || '',
    url: window.location.origin || '',
  };
}

function tokenToDocId(token) {
  // FCM token can contain characters that are not ideal for Firestore document IDs.
  // This creates a stable browser-safe ID without needing Firestore read/list permission.
  if (typeof window !== 'undefined' && window.btoa) {
    return window
      .btoa(unescape(encodeURIComponent(token)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '')
      .slice(0, 900);
  }

  return token.replace(/[^\w-]/g, '_').slice(0, 900);
}

async function registerServiceWorker() {
  if (typeof window === 'undefined') return null;

  if (!('serviceWorker' in navigator)) {
    throw new Error('এই browser service worker support করে না।');
  }

  const existing = await navigator.serviceWorker.getRegistration('/');

  if (existing) {
    await navigator.serviceWorker.ready;
    return existing;
  }

  const registration = await navigator.serviceWorker.register('/sw.js', {
    scope: '/',
  });

  await navigator.serviceWorker.ready;
  return registration;
}

async function saveTokenToFirestore(token) {
  if (!token) return;

  const deviceInfo = getDeviceInfo();
  const docId = tokenToDocId(token);

  await setDoc(
    doc(db, TOKEN_COLLECTION, docId),
    {
      token,
      source: 'pwa',
      platform: deviceInfo.platform,
      language: deviceInfo.language,
      user_agent: deviceInfo.userAgent,
      origin: deviceInfo.url,
      updated_at: serverTimestamp(),
      created_at: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function enableWebPushNotification() {
  if (typeof window === 'undefined') {
    throw new Error('Browser environment পাওয়া যায়নি।');
  }

  if (!('Notification' in window)) {
    throw new Error('এই browser notification support করে না।');
  }

  const supported = await isSupported().catch(() => false);

  if (!supported) {
    throw new Error('এই browser Firebase Messaging support করে না।');
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

  if (!vapidKey) {
    throw new Error('NEXT_PUBLIC_FIREBASE_VAPID_KEY .env.local / Vercel env এ পাওয়া যায়নি।');
  }

  const permission = await Notification.requestPermission();

  if (permission !== 'granted') {
    throw new Error('Notification permission allow করা হয়নি।');
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

  localStorage.setItem(ENABLED_KEY, 'yes');
  localStorage.removeItem(LAST_ERROR_KEY);

  return token;
}

// Backward-compatible name for older components.
export async function registerWebPushToken() {
  return enableWebPushNotification();
}

export function getNotificationPermissionStatus() {
  if (typeof window === 'undefined') return 'unsupported';

  if (!('Notification' in window)) return 'unsupported';

  return Notification.permission;
}

export function isWebPushEnabledLocally() {
  if (typeof window === 'undefined') return false;

  if (!('Notification' in window)) return false;

  return (
    Notification.permission === 'granted' ||
    localStorage.getItem(ENABLED_KEY) === 'yes'
  );
}

export function saveWebPushError(error) {
  if (typeof window === 'undefined') return;

  const message = error?.message || String(error || 'Unknown web push error');
  localStorage.setItem(LAST_ERROR_KEY, message);
}

export function getWebPushLastError() {
  if (typeof window === 'undefined') return '';

  return localStorage.getItem(LAST_ERROR_KEY) || '';
}
