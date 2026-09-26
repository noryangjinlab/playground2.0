const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const { createNoteStore } = require('./note-store');
const content = { type: 'doc', content: [{ type: 'paragraph' }] };

async function fixture(t) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'lab-note-store-'));
  t.after(() => fs.remove(directory));
  return { directory, store: createNoteStore(directory) };
}
test('concurrent saves and reads never expose partially written JSON', async t => {
  const { directory, store } = await fixture(t);
  await store.save({ id: 'root', title: 'Root', content });
  const writes = Array.from({ length: 40 }, (_, i) => store.save({ id: 'root', title: String(i), content }));
  const reads = Array.from({ length: 100 }, () => fs.readJson(path.join(directory, 'root.json')));
  await Promise.all([...writes, ...reads]);
  assert.equal((await store.read('root')).title, '39');
  assert.equal((await store.list()).length, 1);
});
test('deletes every descendant and surviving links, preserves unrelated pages', async t => {
  const { directory, store } = await fixture(t);
  await store.save({ id: 'root', title: 'Root', content });
  await store.save({ id: 'child', parentId: 'root', title: 'Child', content });
  await store.save({ id: 'grandchild', parentId: 'child', title: 'Grandchild', content });
  await store.save({ id: 'other', title: 'Other', content: { type: 'doc', content: [{ type: 'paragraph', content: [
    { type: 'text', text: 'Keep this' }, { type: 'childNote', attrs: { noteId: 'child', title: 'Child' } },
  ] }] } });
  const result = await store.deleteTree('root');
  assert.deepEqual(new Set(result.deletedIds), new Set(['root', 'child', 'grandchild']));
  assert.deepEqual((await store.list()).map(note => note.id), ['other']);
  assert.equal((await store.read('other')).content.content[0].content.length, 1);
  await assert.rejects(store.save({ id: 'child', title: 'Late save', content }), { status: 409 });
  await assert.rejects(createNoteStore(directory).save({ id: 'child', title: 'After restart', content }), { status: 409 });
});
test('rejects unsafe ids and missing parents, keeps metadata on body-only save', async t => {
  const { store } = await fixture(t);
  await assert.rejects(store.read('../outside'), { status: 400 });
  await assert.rejects(store.save({ id: 'child', parentId: 'missing', title: 'Child', content }), { status: 404 });
  await store.save({ id: 'root', title: 'Root', content });
  await store.save({ id: 'child', parentId: 'root', title: 'Child', content });
  await store.save({ id: 'child', content });
  const child = await store.read('child');
  assert.equal(child.title, 'Child'); assert.equal(child.parentId, 'root');
});
