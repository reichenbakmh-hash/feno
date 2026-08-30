const routes = {};

export function registerRoute(path, renderFn) {
  routes[path] = renderFn;
}

export function navigate(path) {
  window.location.hash = path;
}

export function startRouter(outlet) {
  const render = () => {
    const path = window.location.hash.slice(1) || '/login';
    const renderFn = routes[path] || routes['/login'];
    outlet.innerHTML = '';
    renderFn(outlet);
    updateActiveNav(path);
  };
  window.addEventListener('hashchange', render);
  render();
}

function updateActiveNav(path) {
  document.querySelectorAll('.bottom-nav a').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${path}`);
  });
}
