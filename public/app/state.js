const listeners = new Set();

const state = {
  user: null,
  members: [],
  theme: loadStoredTheme(),
};

function loadStoredTheme() {
  const stored = localStorage.getItem('feno_theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getState() {
  return state;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((listener) => listener(state));
}

export function setSession(user, members) {
  state.user = user;
  state.members = members || [];
  notify();
}

export function clearSession() {
  state.user = null;
  state.members = [];
  notify();
}

export function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem('feno_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  notify();
}

export function toggleTheme() {
  setTheme(state.theme === 'dark' ? 'light' : 'dark');
}
