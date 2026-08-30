export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(init.headers || {}),
    },
  });
}

export function jsonError(message, status = 400) {
  return json({ error: message }, { status });
}

export function withSessionCookie(response, token, ttlDays, cookieName, secure) {
  const maxAge = ttlDays * 24 * 60 * 60;
  const secureAttr = secure ? ' Secure;' : '';
  response.headers.append(
    'Set-Cookie',
    `${cookieName}=${token}; Path=/; HttpOnly;${secureAttr} SameSite=Lax; Max-Age=${maxAge}`
  );
  return response;
}

export function clearSessionCookie(response, cookieName, secure) {
  const secureAttr = secure ? ' Secure;' : '';
  response.headers.append(
    'Set-Cookie',
    `${cookieName}=; Path=/; HttpOnly;${secureAttr} SameSite=Lax; Max-Age=0`
  );
  return response;
}

export function readCookie(request, name) {
  const header = request.headers.get('Cookie');
  if (!header) return null;
  const match = header.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
}
