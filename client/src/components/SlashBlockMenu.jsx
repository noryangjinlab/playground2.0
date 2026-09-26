import { useEffect, useRef, useState } from 'react';

const paragraph = { type: 'paragraph' };
const blocks = [
  { label: '새 페이지', keywords: 'page new document', action: 'page' },
  { label: '텍스트', keywords: 'text paragraph', node: paragraph },
  { label: '제목 1', keywords: 'heading h1', node: { type: 'heading', attrs: { level: 1 } } },
  { label: '제목 2', keywords: 'heading h2', node: { type: 'heading', attrs: { level: 2 } } },
  { label: '글머리 목록', keywords: 'bullet list', node: { type: 'bulletList', content: [{ type: 'listItem', content: [paragraph] }] } },
  { label: '번호 목록', keywords: 'ordered numbered list', node: { type: 'orderedList', content: [{ type: 'listItem', content: [paragraph] }] } },
  { label: '인용', keywords: 'quote blockquote', node: { type: 'blockquote', content: [paragraph] } },
  { label: '코드 블록', keywords: 'code', node: { type: 'codeBlock', attrs: { language: 'plaintext' } } },
  { label: '구분선', keywords: 'divider horizontal rule', node: { type: 'horizontalRule' } },
];

export default function SlashBlockMenu({ editor, enabled, onCreatePage }) {
  const [menu, setMenu] = useState(null);
  const current = useRef(null);
  const dismissed = useRef(null);
  const createPage = useRef(onCreatePage);
  useEffect(() => { createPage.current = onCreatePage; }, [onCreatePage]);

  function insert(block, active) {
    if (block.action === 'page') { setMenu(null); createPage.current?.({ from: active.from, to: active.to }); return; }
    const content = block.action === 'page' ? paragraph : block.node.type === 'horizontalRule' ? [block.node, paragraph] : block.node;
    editor.chain().focus().insertContentAt({ from: active.from, to: active.to }, content).run();
    if (block.action === 'page') createPage.current?.();
  }

  useEffect(() => {
    if (!editor || !enabled) return;
    const update = next => { current.current = next; setMenu(next); };
    const sync = () => {
      const { $from, empty } = editor.state.selection;
      const text = $from.parent.textContent;
      const key = `${$from.pos}:${text}`;
      if (!editor.isEditable || !empty || $from.parent.type.name !== 'paragraph' || !/^\/[^/\s]*$/.test(text)) {
        dismissed.current = null; update(null); return;
      }
      if (dismissed.current === key) { update(null); return; }
      const query = text.slice(1).toLowerCase();
      const items = blocks.filter(block => `${block.label} ${block.keywords}`.toLowerCase().includes(query));
      update({ from: $from.before(), to: $from.after(), key, items, index: current.current?.key === key ? current.current.index : 0 });
    };
    const keydown = event => {
      const active = current.current;
      if (!active || event.isComposing) return;
      if (event.key === 'Escape') {
        event.preventDefault(); event.stopPropagation(); dismissed.current = active.key; update(null);
      } else if (['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key) && active.items.length) {
        event.preventDefault(); event.stopPropagation();
        if (event.key === 'Enter') {
          const block = active.items[active.index];
          update(null);
          if (block.action === 'page') { createPage.current?.({ from: active.from, to: active.to }); return; }
          const content = block.action === 'page' ? paragraph : block.node.type === 'horizontalRule' ? [block.node, paragraph] : block.node;
          editor.chain().focus().insertContentAt({ from: active.from, to: active.to }, content).run();
          if (block.action === 'page') createPage.current?.();
        } else {
          update({ ...active, index: (active.index + (event.key === 'ArrowDown' ? 1 : -1) + active.items.length) % active.items.length });
        }
      }
    };
    editor.on('transaction', sync);
    editor.view.dom.addEventListener('keydown', keydown, true);
    sync();
    return () => {
      editor.off('transaction', sync);
      editor.view.dom.removeEventListener('keydown', keydown, true);
      current.current = null;
    };
  }, [editor, enabled]);

  if (!enabled || !menu) return null;
  return <div className="explorer-slash-menu" role="listbox" aria-label="새 블록 종류">
    <div className="explorer-slash-heading">블록 추가 <small>↑↓ 선택 · Enter 적용 · Esc 닫기</small></div>
    {menu.items.length ? menu.items.map((block, index) => <button key={block.label} type="button" role="option" aria-selected={index === menu.index}
      onMouseDown={event => event.preventDefault()}
      onClick={() => {
        insert(block, menu);
      }}>{block.label}</button>) : <p>일치하는 블록이 없습니다.</p>}
  </div>;
}
