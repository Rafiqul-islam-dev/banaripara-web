export function saveUser(user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('banaripara_user', JSON.stringify(user));
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('banaripara_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logoutUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('banaripara_user');
}
