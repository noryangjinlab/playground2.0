const appIds = ['explorer', 'documents', 'jukebox', 'welcome', 'auth'];

export function readDesktopLink(search) {
  const params = new URLSearchParams(search);
  const app = params.get('app');
  if (!appIds.includes(app)) return { app: null, page: null };
  let page = params.get('page');
  if (app === 'explorer') page = ['home', 'help', 'passbank'].includes(page) ? page : 'home';
  else if (app === 'auth') page = page === 'signup' ? 'signup' : 'login';
  else if (app === 'documents') page = page || 'root';
  else page = null;
  return { app, page };
}

export function desktopLink(app, page) {
  if (!appIds.includes(app)) return '/';
  const params = new URLSearchParams({ app });
  if (page && ['explorer', 'documents', 'auth'].includes(app)) params.set('page', page);
  return `/?${params}`;
}
