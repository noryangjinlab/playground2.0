const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

function failure(status, message) { return Object.assign(new Error(message), { status }); }
function validateId(id) {
  if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(id)) throw failure(400, '잘못된 문서 ID입니다');
  return id;
}

function createNoteStore(directory) {
  const deletedDirectory = path.join(directory, '.deleted');
  let queue = Promise.resolve();
  const serial = action => {
    const result = queue.then(action);
    queue = result.catch(() => {});
    return result;
  };
  const filename = id => path.join(directory, `${validateId(id)}.json`);
  const tombstone = id => path.join(deletedDirectory, `${validateId(id)}.json`);
  async function writeAtomic(file, data) {
    const temporary = `${file}.${crypto.randomUUID()}.tmp`;
    try { await fs.writeJson(temporary, data, { spaces: 2 }); await fs.rename(temporary, file); }
    finally { await fs.remove(temporary); }
  }
  async function read(id) {
    if (await fs.pathExists(tombstone(id))) throw failure(404, '삭제된 문서입니다');
    if (!await fs.pathExists(filename(id))) throw failure(404, '문서를 찾을 수 없습니다');
    return fs.readJson(filename(id));
  }
  async function all() {
    await fs.ensureDir(directory);
    const names = (await fs.readdir(directory)).filter(name => name.endsWith('.json'));
    const notes = [];
    for (const name of names) {
      const id = name.slice(0, -5);
      if (await fs.pathExists(tombstone(id))) continue;
      const note = await fs.readJson(filename(id));
      notes.push({ ...note, id });
    }
    return notes;
  }
  function stripLinks(node, removed) {
    if (!node || typeof node !== 'object') return node;
    if (node.type === 'childNote' && removed.has(node.attrs?.noteId)) return null;
    return { ...node, ...(Array.isArray(node.content) ? { content: node.content.map(child => stripLinks(child, removed)).filter(Boolean) } : {}) };
  }
  return {
    read: id => serial(() => read(id)),
    list: () => serial(async () => (await all()).map(({ id, parentId, title, icon }) => ({ id, parentId: parentId || null, title: title || '(제목 없음)', icon: icon || null }))),
    save: input => serial(async () => {
      const { id, content } = input;
      validateId(id);
      if (await fs.pathExists(tombstone(id))) throw failure(409, '삭제된 문서는 저장할 수 없습니다');
      await fs.ensureDir(directory);
      const existing = await fs.pathExists(filename(id)) ? await read(id) : null;
      const parentId = input.parentId !== undefined ? input.parentId : existing?.parentId || null;
      if (parentId === id) throw failure(400, '자기 자신을 상위 문서로 지정할 수 없습니다');
      const title = input.title !== undefined ? input.title : existing?.title || '';
      const icon = input.icon !== undefined ? input.icon : existing?.icon || null;
      if (icon !== null && (typeof icon !== 'string' || !/^\/images\/icon\/[^/\\]+\.(png|webp|gif|jpe?g|svg|ico|bmp)$/i.test(icon) || icon.includes('..'))) throw failure(400, '잘못된 아이콘 경로입니다');
      if (typeof title !== 'string' || !content || content.type !== 'doc') throw failure(400, '문서 제목 또는 본문 형식이 올바르지 않습니다');
      let ancestors = [];
      if (parentId) {
        const parent = await read(parentId);
        ancestors = [...(parent.ancestors || []), { id: parentId, title: parent.title || '' }];
        if (ancestors.some(item => item.id === id)) throw failure(400, '순환하는 문서 구조입니다');
      }
      await writeAtomic(filename(id), { id, parentId, title, icon, ancestors, content });
      return { success: true };
    }),
    deleteTree: id => serial(async () => {
      await read(id);
      const notes = await all();
      const removed = new Set([id]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const note of notes) if (removed.has(note.parentId) && !removed.has(note.id)) { removed.add(note.id); changed = true; }
      }
      // Remove references from all surviving documents, including cross-links.
      for (const note of notes.filter(note => !removed.has(note.id))) {
        const content = stripLinks(note.content, removed);
        if (JSON.stringify(content) !== JSON.stringify(note.content)) await writeAtomic(filename(note.id), { ...note, content });
      }
      await fs.ensureDir(deletedDirectory);
      for (const target of removed) {
        // Reject delayed autosaves after deletion, even after a server restart.
        await writeAtomic(tombstone(target), { deletedAt: new Date().toISOString() });
        await fs.remove(filename(target));
      }
      return { success: true, deletedIds: [...removed] };
    }),
  };
}
module.exports = { createNoteStore };
