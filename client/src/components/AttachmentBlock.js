import { Node } from '@tiptap/core';

export const AttachmentBlock = Node.create({
  name: 'attachmentBlock', group: 'block', atom: true, draggable: true,
  addAttributes() { return { url: { default: '' }, name: { default: '파일' }, size: { default: 0 } }; },
  parseHTML() { return [{ tag: 'div[data-attachment]', getAttrs: element => ({
    url: element.querySelector('a')?.getAttribute('href') || '', name: element.getAttribute('data-name'), size: Number(element.getAttribute('data-size')),
  }) }]; },
  renderHTML({ HTMLAttributes: attrs }) {
    const size = Number(attrs.size) || 0;
    const label = size >= 1024 ** 3 ? `${(size / 1024 ** 3).toFixed(2)} GB` : size >= 1024 ** 2 ? `${(size / 1024 ** 2).toFixed(1)} MB` : `${Math.ceil(size / 1024)} KB`;
    const url = /^\/api\/lab\/file\/[a-f0-9-]{36}$/.test(attrs.url) ? attrs.url : '';
    return ['div', { 'data-attachment': 'true', 'data-name': attrs.name, 'data-size': size, contenteditable: 'false' },
      ['a', { href: url || undefined, download: attrs.name, title: '파일 다운로드' }, ['span', { 'aria-hidden': 'true' }, '📎 '], attrs.name, ['small', {}, ` · ${label} · 다운로드`]],
      ['button', { type: 'button', 'data-attachment-delete': 'true', 'aria-label': `${attrs.name} 첨부 삭제`, title: '문서에서 첨부 삭제' }, '삭제']];
  },
});
