import { api } from './api.js';
import { getState, setSession, clearSession, setTheme, toggleTheme, subscribe } from './state.js';
import { registerRoute, startRouter, navigate } from './router.js';
import { renderLogin } from './pages/login.js';
import { renderRegister } from './pages/register.js';
import { renderDashboard } from './pages/dashboard.js';

const app = document.getElementById('app');

setTheme(getState().theme);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  });
}

function buildShell() {
  app.innerHTML = `
    <div class="topbar">
      <span class="brand-mark" style="font-size:1.15rem;">
        <svg class="brand-leaf" style="width:22px;height:22px;" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
          <path d="M96 146V88C96 63 76 46 46 44C48 76 66 96 96 100" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Feno
      </span>
      <button class="theme-toggle" id="theme-toggle" aria-label="Changer de thème" type="button"></button>
    </div>
    <div id="outlet"></div>
    <nav class="bottom-nav" id="bottom-nav" hidden>
      <a href="#/dashboard">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg>
        Accueil
      </a>
    </nav>
  `;

  const themeToggle = app.querySelector('#theme-toggle');
  themeToggle.addEventListener('click', toggleTheme);
  updateThemeIcon();

  return app.querySelector('#outlet');
}

function updateThemeIcon() {
  const button = document.getElementById('theme-toggle');
  if (!button) return;
  button.textContent = getState().theme === 'dark' ? '☀️' : '🌙';
}

function updateNavVisibility() {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;
  nav.hidden = !getState().user;
}

const outlet = buildShell();

registerRoute('/login', (el) => {
  if (getState().user) return navigate('/dashboard');
  renderLogin(el);
});

registerRoute('/register', (el) => {
  if (getState().user) return navigate('/dashboard');
  renderRegister(el);
});

registerRoute('/dashboard', (el) => {
  if (!getState().user) return navigate('/login');
  renderDashboard(el);
});

subscribe(() => {
  updateThemeIcon();
  updateNavVisibility();
});

async function bootstrap() {
  try {
    const { user, members } = await api.me();
    setSession(user, members);
  } catch {
    clearSession();
  }
  startRouter(outlet);
}

bootstrap();
