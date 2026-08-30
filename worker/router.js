export function createRouter() {
  const routes = [];

  function add(method, pattern, handler) {
    const paramNames = [];
    const regexPath = pattern
      .split('/')
      .map((segment) => {
        if (segment.startsWith(':')) {
          paramNames.push(segment.slice(1));
          return '([^/]+)';
        }
        return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      })
      .join('/');
    routes.push({ method, regex: new RegExp(`^${regexPath}$`), paramNames, handler });
  }

  return {
    get: (pattern, handler) => add('GET', pattern, handler),
    post: (pattern, handler) => add('POST', pattern, handler),
    put: (pattern, handler) => add('PUT', pattern, handler),
    delete: (pattern, handler) => add('DELETE', pattern, handler),

    async handle(request, context) {
      const url = new URL(request.url);
      for (const route of routes) {
        if (route.method !== request.method) continue;
        const match = route.regex.exec(url.pathname);
        if (!match) continue;
        const params = {};
        route.paramNames.forEach((name, index) => {
          params[name] = decodeURIComponent(match[index + 1]);
        });
        return route.handler(request, context, params);
      }
      return null;
    },
  };
}
