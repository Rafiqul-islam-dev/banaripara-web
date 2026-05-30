'use client';

import { useEffect } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';

const VISITOR_ID_KEY = 'banaripara_visitor_id';
const SESSION_ID_KEY = 'banaripara_session_id';
const HEARTBEAT_MS = 30000;
const ACTIVE_WINDOW_SECONDS = 90;

function createId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function getOrCreateLocalId(key, prefix) {
  if (typeof window === 'undefined') return '';

  let id = localStorage.getItem(key);

  if (!id) {
    id = createId(prefix);
    localStorage.setItem(key, id);
  }

  return id;
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

async function updateVisitorPresence() {
  if (typeof window === 'undefined') return;

  const visitorId = getOrCreateLocalId(VISITOR_ID_KEY, 'visitor');
  const sessionId = getOrCreateLocalId(SESSION_ID_KEY, 'session');

  if (!visitorId || !sessionId) return;

  const nowMs = Date.now();
  const deviceInfo = getDeviceInfo();
  const path = window.location.pathname || '/';
  const fullUrl = window.location.href || '';
  const referrer = document.referrer || '';

  await Promise.all([
    setDoc(
      doc(db, 'web_visitors', visitorId),
      {
        visitor_id: visitorId,
        first_seen: serverTimestamp(),
        last_seen: serverTimestamp(),
        last_seen_ms: nowMs,
        last_path: path,
        last_url: fullUrl,
        referrer,
        active_window_seconds: ACTIVE_WINDOW_SECONDS,
        source: 'website',
        ...deviceInfo,
      },
      { merge: true }
    ),
    setDoc(
      doc(db, 'web_online_visitors', visitorId),
      {
        visitor_id: visitorId,
        session_id: sessionId,
        last_seen: serverTimestamp(),
        last_seen_ms: nowMs,
        current_path: path,
        current_url: fullUrl,
        active_window_seconds: ACTIVE_WINDOW_SECONDS,
        source: 'website',
        ...deviceInfo,
      },
      { merge: true }
    ),
    setDoc(
      doc(db, 'web_visit_logs', `${visitorId}_${nowMs}`),
      {
        visitor_id: visitorId,
        session_id: sessionId,
        visited_at: serverTimestamp(),
        visited_at_ms: nowMs,
        path,
        url: fullUrl,
        referrer,
        source: 'website',
        ...deviceInfo,
      },
      { merge: true }
    ),
  ]);
}

export default function VisitorTracker() {
  useEffect(() => {
    let timer = null;
    let stopped = false;

    const safeUpdate = async () => {
      if (stopped) return;

      try {
        await updateVisitorPresence();
      } catch (error) {
        console.error('Visitor tracking error:', error);
      }
    };

    safeUpdate();
    timer = window.setInterval(safeUpdate, HEARTBEAT_MS);

    const handleVisibilityChange = () => {
      if (!document.hidden) safeUpdate();
    };

    const handleBeforeUnload = () => {
      try {
        updateVisitorPresence();
      } catch {
        // ignore unload errors
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      stopped = true;
      if (timer) window.clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null;
}
