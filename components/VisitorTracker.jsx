'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';

const VISITOR_ID_KEY = 'banaripara_visitor_id';
const SESSION_ID_KEY = 'banaripara_session_id';
const HEARTBEAT_MS = 120000;
const ACTIVE_WINDOW_SECONDS = 300;
const LOGGED_PATHS_KEY = 'banaripara_logged_paths';

function createId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function getOrCreateLocalId() {
  if (typeof window === 'undefined') return '';

  let visitorId = localStorage.getItem(VISITOR_ID_KEY);

  if (!visitorId) {
    visitorId = createId('visitor');
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }

  return visitorId;
}

function getOrCreateSessionId() {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);

  if (!sessionId) {
    sessionId = createId('session');
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }

  return sessionId;
}


function shouldLogPath(path) {
  if (typeof window === 'undefined') return false;

  try {
    const sessionId = getOrCreateSessionId();
    const key = `${LOGGED_PATHS_KEY}_${sessionId}`;
    const raw = sessionStorage.getItem(key);
    const logged = JSON.parse(raw || '[]');

    if (Array.isArray(logged) && logged.includes(path)) return false;

    const nextLogged = Array.isArray(logged) ? [...logged, path] : [path];
    sessionStorage.setItem(key, JSON.stringify(nextLogged.slice(-30)));

    return true;
  } catch {
    return true;
  }
}

function getDeviceInfo() {
  if (typeof window === 'undefined') {
    return {
      user_agent: '',
      platform: '',
      language: '',
      screen: '',
    };
  }

  return {
    user_agent: navigator.userAgent || '',
    platform: navigator.platform || '',
    language: navigator.language || '',
    screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
  };
}

function getCurrentPageInfo() {
  if (typeof window === 'undefined') {
    return {
      path: '/',
      url: '',
      referrer: '',
      title: '',
    };
  }

  return {
    path: window.location.pathname || '/',
    url: window.location.href || '',
    referrer: document.referrer || '',
    title: document.title || '',
  };
}

async function updateVisitorPresence({ shouldCreateLog = false } = {}) {
  if (typeof window === 'undefined') return;

  const visitorId = getOrCreateLocalId();
  const sessionId = getOrCreateSessionId();

  if (!visitorId || !sessionId) return;

  const nowMs = Date.now();
  const deviceInfo = getDeviceInfo();
  const pageInfo = getCurrentPageInfo();

  const basePayload = {
    visitor_id: visitorId,
    session_id: sessionId,
    last_seen: serverTimestamp(),
    last_seen_ms: nowMs,
    active_window_seconds: ACTIVE_WINDOW_SECONDS,
    source: 'website',
    ...deviceInfo,
  };

  await Promise.all([
    setDoc(
      doc(db, 'web_visitors', visitorId),
      {
        ...basePayload,
        first_seen: serverTimestamp(),
        last_path: pageInfo.path,
        last_url: pageInfo.url,
        last_title: pageInfo.title,
        referrer: pageInfo.referrer,
      },
      { merge: true }
    ),
    setDoc(
      doc(db, 'web_online_visitors', visitorId),
      {
        ...basePayload,
        current_path: pageInfo.path,
        current_url: pageInfo.url,
        current_title: pageInfo.title,
        referrer: pageInfo.referrer,
      },
      { merge: true }
    ),
  ]);

  if (shouldCreateLog) {
    await addDoc(collection(db, 'web_visit_logs'), {
      visitor_id: visitorId,
      session_id: sessionId,
      visited_at: serverTimestamp(),
      visited_at_ms: nowMs,
      path: pageInfo.path,
      url: pageInfo.url,
      title: pageInfo.title,
      referrer: pageInfo.referrer,
      source: 'website',
      ...deviceInfo,
    });
  }
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const lastLoggedPathRef = useRef('');

  useEffect(() => {
    let timer = null;
    let stopped = false;

    const safeUpdate = async ({ shouldCreateLog = false } = {}) => {
      if (stopped) return;

      try {
        await updateVisitorPresence({ shouldCreateLog });
      } catch (error) {
        console.error('Visitor tracking error:', error);
      }
    };

    const currentPath = pathname || '/';
    const shouldCreateLog = lastLoggedPathRef.current !== currentPath && shouldLogPath(currentPath);
    lastLoggedPathRef.current = currentPath;

    safeUpdate({ shouldCreateLog });
    timer = window.setInterval(() => safeUpdate({ shouldCreateLog: false }), HEARTBEAT_MS);

    const handleVisibilityChange = () => {
      if (!document.hidden) safeUpdate({ shouldCreateLog: false });
    };

    const handleFocus = () => {
      safeUpdate({ shouldCreateLog: false });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      stopped = true;
      if (timer) window.clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [pathname]);

  return null;
}
