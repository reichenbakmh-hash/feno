import { getState } from '../state.js';

const UPCOMING_MODULES = [
  { emoji: '📅', label: 'Calendrier' },
  { emoji: '✅', label: 'Tâches' },
  { emoji: '🛒', label: 'Courses' },
  { emoji: '🍽️', label: 'Repas' },
  { emoji: '💶', label: 'Budget' },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

export function renderDashboard(outlet) {
  const { user, members } = getState();

  outlet.innerHTML = `
    <div class="screen">
      <h1>${greeting()}, ${user ? user.name : ''}</h1>
      <p>Voici ton foyer.</p>

      <div class="card" style="margin-bottom:16px;">
        <h3>Membres du foyer</h3>
        <div id="member-list"></div>
      </div>

      <div class="card">
        <h3>Prochainement dans Feno</h3>
        <p>Ces modules arrivent au fil des prochaines mises à jour.</p>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          ${UPCOMING_MODULES.map((m) => `<span class="tag">${m.emoji} ${m.label}</span>`).join('')}
        </div>
      </div>
    </div>
  `;

  const memberList = outlet.querySelector('#member-list');
  members.forEach((member) => {
    const row = document.createElement('div');
    row.className = 'member-row';
    row.innerHTML = `
      <span class="avatar-chip" style="background:${member.color}22;">${member.avatar_emoji}</span>
      <div>
        <div style="font-weight:600;">${member.name}</div>
        <div style="font-size:0.8rem; color:var(--color-ink-faint); text-transform:capitalize;">${member.role}</div>
      </div>
    `;
    memberList.appendChild(row);
  });
}
