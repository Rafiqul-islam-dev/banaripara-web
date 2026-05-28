const READ_STORAGE_KEY = 'banaripara_read_notifications';

export function getNotificationDate(notification) {
  if (!notification) return null;

  const value = notification.created_at || notification.createdAt || notification.date;

  if (!value) return null;

  const date = value?.toDate ? value.toDate() : new Date(value);

  if (!date || Number.isNaN(date.getTime())) return null;

  return date;
}

export function isCurrentMonthNotification(notification) {
  const date = getNotificationDate(notification);
  if (!date) return false;

  const now = new Date();

  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export function getReadNotificationIds() {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isNotificationRead(notificationId) {
  if (!notificationId) return false;

  return getReadNotificationIds().includes(notificationId);
}

export function markNotificationAsRead(notificationId) {
  if (typeof window === 'undefined' || !notificationId) return;

  const ids = getReadNotificationIds();

  if (!ids.includes(notificationId)) {
    const nextIds = [...ids, notificationId];
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(nextIds));
  }

  window.dispatchEvent(
    new CustomEvent('banaripara-notification-read', {
      detail: { notificationId },
    })
  );
}

export function getUnreadNotificationCount(notifications = []) {
  const readIds = getReadNotificationIds();

  return notifications.filter((notification) => {
    if (!notification?.id) return false;
    if (!isCurrentMonthNotification(notification)) return false;

    return !readIds.includes(notification.id);
  }).length;
}
