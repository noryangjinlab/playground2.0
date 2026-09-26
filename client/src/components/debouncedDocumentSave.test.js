import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDebouncedDocumentSave } from './debouncedDocumentSave.js';

test('rapid title/content edits save only the latest snapshot', async () => {
  const writes = [];
  const saver = createDebouncedDocumentSave(async value => writes.push(value), () => {}, 10);
  saver.enqueue({ id: 'a', title: 'old', content: 'old' });
  saver.enqueue({ id: 'a', title: 'new', content: 'new' });
  assert.equal(writes.length, 0);
  await saver.wait();
  assert.deepEqual(writes, [{ id: 'a', title: 'new', content: 'new' }]);
  saver.dispose();
});

test('edits during a request are serialized and waiting includes the next save', async () => {
  const writes = [];
  let release, started;
  const ready = new Promise(resolve => { started = resolve; });
  const saver = createDebouncedDocumentSave(async value => {
    writes.push(value);
    if (writes.length === 1) { started(); await new Promise(resolve => { release = resolve; }); }
  }, () => {}, 10);
  saver.enqueue({ id: 'a', title: 'first' });
  await ready;
  saver.enqueue({ id: 'a', title: 'latest' });
  const finished = saver.wait();
  assert.equal(writes.length, 1);
  release();
  await finished;
  assert.deepEqual(writes.map(value => value.title), ['first', 'latest']);
  saver.dispose();
});

test('a transient failure retries the same document without losing its content', async () => {
  let calls = 0;
  const writes = [];
  const saver = createDebouncedDocumentSave(async value => {
    if (++calls === 1) throw new Error('offline');
    writes.push(value);
  }, () => {}, 10);
  saver.enqueue({ id: 'a', content: 'retain me' });
  await saver.wait();
  assert.deepEqual(writes, [{ id: 'a', content: 'retain me' }]);
  saver.dispose();
});
