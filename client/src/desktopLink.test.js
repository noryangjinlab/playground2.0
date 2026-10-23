import { test } from 'node:test';
import assert from 'node:assert/strict';
import { desktopLink, readDesktopLink } from './desktopLink.js';

test('links restore one app and its page', () => {
  for (const [app, page] of [['explorer', 'help'], ['explorer', 'passbank'], ['documents', '문서 / ? & #'], ['auth', 'signup'], ['jukebox', null], ['welcome', null]]) {
    assert.deepEqual(readDesktopLink(desktopLink(app, page).slice(1)), { app, page });
  }
});

test('unknown apps and pages fall back safely', () => {
  assert.deepEqual(readDesktopLink('?app=unknown&page=help'), { app: null, page: null });
  assert.deepEqual(readDesktopLink('?app=explorer&page=unknown'), { app: 'explorer', page: 'home' });
  assert.deepEqual(readDesktopLink('?app=documents'), { app: 'documents', page: 'root' });
  assert.equal(desktopLink(undefined), '/');
});

test('sharing the active app discards other apps and private form or playback state', () => {
  const opened = readDesktopLink('?app=explorer&page=help&apps=documents,jukebox&password=secret&playing=true');
  assert.equal(desktopLink(opened.app, opened.page), '/?app=explorer&page=help');
});
