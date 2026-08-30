import { createRouter } from './router.js';
import { createStore } from './db.js';
import { handleRegisterHousehold, handleLogin, handleLogout, getSessionUser, publicUser } from './auth.js';
import { json, jsonError } from './responses.js';

const router = createRouter();

router.post('/api/auth/register', async (request, { env, store }) => {
  return handleRegisterHousehold(request, env, store);
});

router.post('/api/auth/login', async (request, { env, store }) => {
  return handleLogin(request, env, store);
});

router.post('/api/auth/logout', async (request, { env, store }) => {
  return handleLogout(request, env, store);
});

router.get('/api/me', async (request, { env, store }) => {
  const user = await getSessionUser(request, env, store);
  if (!user) return jsonError('Non authentifié', 401);
  const members = await store.listHouseholdMembers(user.household_id);
  return json({ user: publicUser(user), members });
});

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const store = createStore(env.DB);

    if (url.pathname.startsWith('/api/')) {
      try {
        const response = await router.handle(request, { env, ctx, store });
        return response || jsonError('Route introuvable', 404);
      } catch (error) {
        return jsonError('Erreur serveur', 500);
      }
    }

    return env.ASSETS.fetch(request);
  },
};
