import { api } from '../api.js';
import { setSession } from '../state.js';
import { navigate } from '../router.js';

export function renderLogin(outlet) {
  outlet.innerHTML = `
    <div class="center-screen">
      <div style="width:100%; max-width:380px;">
        <div style="text-align:center; margin-bottom:28px;">
          <span class="brand-mark">
            <svg class="brand-leaf" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
              <rect width="192" height="192" rx="40" fill="currentColor" opacity="0.12" />
              <path d="M96 146V88C96 63 76 46 46 44C48 76 66 96 96 100" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Feno
          </span>
        </div>
        <div class="card">
          <h1>Bon retour</h1>
          <p>Connecte-toi pour retrouver ton foyer.</p>
          <div id="login-error"></div>
          <form id="login-form">
            <div class="field">
              <label for="email">E-mail</label>
              <input id="email" type="email" autocomplete="email" required />
            </div>
            <div class="field">
              <label for="password">Mot de passe</label>
              <input id="password" type="password" autocomplete="current-password" required />
            </div>
            <button class="btn btn-primary" type="submit">Se connecter</button>
          </form>
          <div class="form-switch-line">
            Pas encore de foyer ? <a href="#/register">Créer un compte</a>
          </div>
        </div>
      </div>
    </div>
  `;

  const form = outlet.querySelector('#login-form');
  const errorBox = outlet.querySelector('#login-error');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.innerHTML = '';
    const submitButton = form.querySelector('button');
    submitButton.disabled = true;

    try {
      await api.login({
        email: outlet.querySelector('#email').value,
        password: outlet.querySelector('#password').value,
      });
      const { user, members } = await api.me();
      setSession(user, members);
      navigate('/dashboard');
    } catch (error) {
      errorBox.innerHTML = `<div class="form-error">${error.message}</div>`;
    } finally {
      submitButton.disabled = false;
    }
  });
}
