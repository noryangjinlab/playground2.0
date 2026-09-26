import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { EditorState } from 'prosemirror-state';
import { AppWindow } from './app-window';
import { CodeBlock, TextStyle, FontSize, ChildNote, LabImage } from '../routes/lab';
import { fetchApi } from '../api';
import './file-explorer.css';
import SlashBlockMenu from './SlashBlockMenu';
import { createDebouncedDocumentSave } from './debouncedDocumentSave';
import { Color } from '@tiptap/extension-text-style';
import EditorToolbar from './EditorToolbar';
import { ExplorerBehavior, ExplorerDragHandle } from './explorerEditorExtensions';

const folderIcon = '/images/icon/directory_open_1.png';
const ProtectedCodeBlock = CodeBlock.extend({
  addKeyboardShortcuts() {
    const shortcuts = { ...this.parent?.() };
    delete shortcuts.Backspace;
    return shortcuts;
  },
});
const PageLink = ChildNote.extend({
  renderHTML({ HTMLAttributes }) {
    return ['span', {
      'data-child-note': 'true', 'data-note-id': HTMLAttributes.noteId,
      role: 'link', tabindex: '0', contenteditable: 'false',
    }, ['span', { 'data-child-note-box': 'true' }, HTMLAttributes.title || '(제목 없음)']];
  },
});
export default function DocumentsWindow({ onClose, ...windowProps }) {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [expanded, setExpanded] = useState(new Set());
  const [selection, setSelection] = useState({ id: 'root', folder: true, title: '파일탐색기' });
  const [user, setUser] = useState(null);
  const [loadingTree, setLoadingTree] = useState(true);
  const [treeError, setTreeError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('왼쪽에서 파일을 선택하세요.');
  const request = useRef(0);
  const draft = useRef(null);
  const autosave = useRef(null);
  const transitioning = useRef(false);
  const creating = useRef(false);
  const deletingPage = useRef(false);
  const uploadTask = useRef(null);
  const uploadHandler = useRef(null);
  const imageInput = useRef(null);
  const imageTarget = useRef(null);
  const canEdit = user?.isAdmin === true;
  const editor = useEditor({
    extensions: [StarterKit.configure({ codeBlock: false }), ProtectedCodeBlock, TextStyle, Color, FontSize, PageLink, LabImage,
      ExplorerDragHandle, ExplorerBehavior.configure({ onFiles: (files, range) => uploadHandler.current?.(files, range) })],
    content: '', editable: false,
    onUpdate: ({ editor: current }) => {
      if (!current.isEditable || !draft.current) return;
      draft.current = { ...draft.current, content: current.getJSON() };
      autosave.current?.enqueue(draft.current);
    },
  });
  useEffect(() => {
    const saver = createDebouncedDocumentSave(
      snapshot => fetchApi('/lab/save', { method: 'POST', body: JSON.stringify(snapshot) }),
      (state, error) => {
        setDirty(state !== 'saved');
        setMessage(state === 'saved' ? '자동 저장되었습니다.' : state === 'saving' ? '자동 저장 중…' : state === 'error' ? `자동 저장 실패: ${error.message} — 변경 내용을 유지했습니다.` : '입력이 끝나면 자동 저장합니다…');
      },
    );
    autosave.current = saver;
    return () => saver.dispose();
  }, []);
  async function loadTree() {
    setLoadingTree(true); setTreeError('');
    try {
      const data = await fetchApi('/lab/tree');
      if (!Array.isArray(data)) throw new Error('파일 목록 응답이 올바르지 않습니다.');
      setNotes(data);
    } catch (error) { setTreeError(error.message); }
    finally { setLoadingTree(false); }
  }
  useEffect(() => { loadTree(); }, []);
  useEffect(() => {
    const refreshUser = () => fetchApi('/auth/me').then(setUser).catch(() => setUser(null));
    refreshUser(); window.addEventListener('focus', refreshUser);
    return () => window.removeEventListener('focus', refreshUser);
  }, []);
  useEffect(() => { editor?.setEditable(canEdit && loaded && !loading && !leaving && !uploading && !deleting, false); }, [editor, canEdit, loaded, loading, leaving, uploading, deleting]);
  useEffect(() => {
    if (!dirty && !uploading) return;
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, uploading]);
  useEffect(() => () => { request.current++; }, []);
  async function finishPending() {
    if (transitioning.current) return false;
    transitioning.current = true; setLeaving(true);
    try { await uploadTask.current; await autosave.current?.wait(); return true; }
    catch { return false; }
    finally { transitioning.current = false; setLeaving(false); }
  }
  async function uploadImages(files, range) {
    if (!canEdit || !loaded || leaving || uploadTask.current || !draft.current) return;
    const id = draft.current.id;
    setUploading(true); setMessage('이미지를 업로드하는 중…');
    const task = (async () => {
      let target = range;
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const body = new FormData(); body.append('file', file);
        const data = await fetchApi('/lab/image/upload', { method: 'POST', body });
        if (editor.isDestroyed || draft.current?.id !== id) return;
        editor.commands.insertContentAt(target, { type: 'labImage', attrs: { src: data.url, filename: data.filename, alt: file.name, width: null } });
        target = { from: editor.state.selection.to, to: editor.state.selection.to };
        draft.current = { ...draft.current, content: editor.getJSON() };
        autosave.current.enqueue(draft.current);
      }
    })();
    uploadTask.current = task;
    try { await task; }
    catch (error) { setMessage(`이미지 업로드 실패: ${error.message}`); }
    finally { uploadTask.current = null; setUploading(false); }
  }
  useEffect(() => { uploadHandler.current = uploadImages; });
  function chooseImage(range) {
    imageTarget.current = { id: selection.id, range };
    imageInput.current?.click();
  }
  function deleteImage(event) {
    const button = event.target.closest('[data-lab-image-delete]');
    if (!button || !editor?.isEditable) return false;
    event.preventDefault(); event.stopPropagation();
    let position = null;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'labImage' && editor.view.nodeDOM(pos)?.contains(button)) { position = pos; return false; }
    });
    if (position !== null) editor.chain().focus().setNodeSelection(position).deleteSelection().run();
    // Retain the uploaded asset so undo and other references continue working.
    return true;
  }
  function rename(title) {
    if (!canEdit || !loaded || leaving || uploading || deleting || !draft.current) return;
    draft.current = { ...draft.current, title };
    const id = draft.current.id;
    setSelection(previous => ({ ...previous, title }));
    setNotes(previous => previous.map(note => note.id === id ? { ...note, title } : note));
    autosave.current?.enqueue(draft.current);
  }
  async function createChildPage(range) {
    if (!canEdit || !loaded || selection.id === 'root' || creating.current || deletingPage.current) return;
    creating.current = true;
    const parentId = selection.id;
    try {
      if (!await finishPending()) return;
      setLeaving(true);
      const page = {
        id: crypto.randomUUID(), parentId, title: '새 페이지',
        content: { type: 'doc', content: [{ type: 'paragraph' }] },
      };
      setMessage('새 페이지를 만드는 중…');
      await fetchApi('/lab/save', { method: 'POST', body: JSON.stringify(page) });
      setNotes(previous => [...previous, { id: page.id, parentId, title: page.title }]);
      setExpanded(previous => new Set([...previous, 'root', parentId]));
      editor.commands.insertContentAt(range, {
        type: 'paragraph', content: [{ type: 'childNote', attrs: { noteId: page.id, title: page.title } }],
      });
      draft.current = { ...draft.current, content: editor.getJSON() };
      autosave.current.enqueue(draft.current);
      await open({ id: page.id, parentId, title: page.title, folder: false }, false, true);
    } catch (error) { setMessage(`새 페이지 생성 실패: ${error.message}`); }
    finally { creating.current = false; setLeaving(false); }
  }
  async function open(item, toggleBranch = false, fromCreation = false) {
    if ((creating.current || deletingPage.current) && !fromCreation) return;
    if (item.id === selection.id && loaded) { if (toggleBranch) toggle(item.id); return; }
    if (!await finishPending()) return;
    if (toggleBranch) toggle(item.id);
    const token = ++request.current;
    setSelection(item); setDirty(false); setLoaded(false); setLoading(item.id !== 'root');
    draft.current = null;
    editor?.commands.setContent('', { emitUpdate: false });
    if (item.id === 'root') { setMessage('왼쪽 폴더 트리에서 문서를 선택하세요.'); return; }
    setMessage('파일을 불러오는 중…');
    try {
      const data = await fetchApi(`/lab/${encodeURIComponent(item.id)}`);
      if (token !== request.current) return;
      // Resolve link labels from the current tree after a child is renamed.
      const resolveTitles = node => {
        if (!node || typeof node !== 'object') return node;
        const linked = node.type === 'childNote' && notes.find(note => note.id === node.attrs?.noteId);
        return { ...node, ...(linked ? { attrs: { ...node.attrs, title: linked.title || '(제목 없음)' } } : {}),
          ...(node.content ? { content: node.content.map(resolveTitles) } : {}) };
      };
      editor?.commands.setContent(resolveTitles(data.content) || '', { emitUpdate: false });
      const title = data.title ?? item.title;
      draft.current = { id: item.id, title, content: editor.getJSON() };
      setSelection(previous => ({ ...previous, title }));
      setNotes(previous => previous.map(note => note.id === item.id ? { ...note, title } : note));
      // A file has its own undo history; never undo into the previous document.
      if (editor) editor.view.updateState(EditorState.create({
        schema: editor.state.schema, doc: editor.state.doc, plugins: editor.state.plugins,
      }));
      setLoaded(true); setMessage('파일을 불러왔습니다.');
    } catch (error) { if (token === request.current) setMessage(`열기 실패: ${error.message}`); }
    finally { if (token === request.current) setLoading(false); }
  }
  async function deleteCurrentPage() {
    if (!canEdit || selection.id === 'root' || creating.current || deletingPage.current) return;
    const targets = new Set([selection.id]);
    let count = 0;
    while (count !== targets.size) {
      count = targets.size;
      notes.forEach(note => { if (targets.has(note.parentId)) targets.add(note.id); });
    }
    if (!window.confirm(`“${selection.title || '제목 없음'}” 페이지와 모든 하위 페이지(총 ${targets.size}개)를 삭제할까요?\n삭제한 페이지는 복구할 수 없습니다.`)) return;
    deletingPage.current = true; setDeleting(true);
    try {
      if (!await finishPending()) return;
      const parentId = notes.find(note => note.id === selection.id)?.parentId;
      const result = await fetchApi(`/lab/delete/${encodeURIComponent(selection.id)}`, { method: 'DELETE' });
      const removed = new Set(result.deletedIds);
      draft.current = null; setDirty(false); setLoaded(false);
      editor.commands.setContent('', { emitUpdate: false });
      setNotes(previous => previous.filter(note => !removed.has(note.id)));
      setExpanded(previous => new Set([...previous].filter(id => !removed.has(id))));
      const parent = notes.find(note => note.id === parentId && !removed.has(note.id));
      await open(parent || { id: 'root', title: '파일탐색기', folder: true }, false, true);
      setMessage(`${removed.size}개 페이지를 삭제했습니다.`);
    } catch (error) { setMessage(`페이지 삭제 실패: ${error.message}`); }
    finally { deletingPage.current = false; setDeleting(false); }
  }
  function toggle(id) {
    setExpanded(previous => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }
  function followChildLink(event) {
    const link = event.target.closest('[data-child-note]');
    if (!link) return;
    if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    const id = link.getAttribute('data-note-id');
    if (!id) return;
    const note = notes.find(item => item.id === id);
    setExpanded(previous => new Set([...previous, 'root', selection.id]));
    open(note || { id, title: link.textContent || '문서', folder: false });
  }
  const noteIds = new Set(notes.map(note => note.id));
  const roots = notes.filter(note => !note.parentId || !noteIds.has(note.parentId));
  const selectedNote = notes.find(note => note.id === selection.id);
  const path = [], visited = new Set();
  let ancestor = selectedNote;
  while (ancestor && !visited.has(ancestor.id)) {
    visited.add(ancestor.id); path.unshift(ancestor.title); ancestor = notes.find(note => note.id === ancestor.parentId);
  }
  const address = `파일탐색기${path.length ? ` \\ ${path.join(' \\ ')}` : ''}`;
  function row(item, depth, expandable = false) {
    const active = selection.id === item.id;
    return <div className="explorer-tree-row" style={{ paddingLeft: depth * 16 + 4 }}>
      {expandable ? <button className="explorer-expander" aria-label={`${item.title} ${expanded.has(item.id) ? '접기' : '펼치기'}`} aria-expanded={expanded.has(item.id)} onClick={() => toggle(item.id)}>{expanded.has(item.id) ? '−' : '+'}</button> : <span className="explorer-tree-spacer"/>}
      <button className={`explorer-node${active ? ' selected' : ''}`} onClick={() => open(item, expandable)} aria-expanded={expandable ? expanded.has(item.id) : undefined} title={item.title} aria-current={active ? 'page' : undefined}>
        <img src={expandable ? folderIcon : '/images/icon/file_lines.png'} alt=""/>
        <span>{item.title || '(제목 없음)'}</span>
      </button>
    </div>;
  }
  function branch(note, depth = 1, parents = new Set()) {
    if (parents.has(note.id)) return null;
    const children = notes.filter(child => child.parentId === note.id);
    const folder = children.length > 0;
    const nextParents = new Set([...parents, note.id]);
    return <div key={note.id}>
      {row({ ...note, folder }, depth, folder)}
      {folder && expanded.has(note.id) && <div className="explorer-branch">

        {children.map(child => branch(child, depth + 1, nextParents))}
      </div>}
    </div>;
  }
  const editable = canEdit && loaded && !leaving && !uploading && !deleting;
  return <AppWindow {...windowProps} title="파일탐색기" icon={folderIcon} className="file-explorer" width={860} height={570}
    onClose={async () => { if (!creating.current && !deletingPage.current && await finishPending()) onClose(); }}
    footer={<div className="explorer-status" role="status"><span>{message}</span><span>{notes.length}개 문서</span><span>{canEdit ? '편집 가능' : '읽기 전용'}</span></div>}>
    <div className="explorer-menubar"><span>파일(F)</span><span>편집(E)</span><span>보기(V)</span><span>도구(T)</span><span>도움말(H)</span></div>
    <div className="explorer-toolbar">
      <div className="explorer-address" title={address}><img src={folderIcon} alt=""/><span>{address}</span></div>
      <button title="상위 폴더" aria-label="상위 폴더" disabled={selection.id === 'root' || leaving} onClick={() => open(notes.find(note => note.id === selectedNote?.parentId) ? { ...notes.find(note => note.id === selectedNote.parentId), folder: true } : { id: 'root', title: '파일탐색기', folder: true })}>↑</button>
      <button title="파일 목록 새로고침" aria-label="파일 목록 새로고침" disabled={loadingTree || leaving} onClick={async () => { if (await finishPending()) loadTree(); }}>↻</button>
      {canEdit && <button type="button" disabled={selection.id === 'root' || !editable} onClick={deleteCurrentPage}>페이지 삭제</button>}
    </div>
    <div className="explorer-panes">
      <aside className="explorer-tree" aria-label="폴더 및 파일 탐색">
        <div className="explorer-pane-heading">폴더</div>
        {row({ id: 'root', title: '파일탐색기', folder: true }, 0, true)}
        {expanded.has('root') && <>
          {loadingTree ? <p className="explorer-tree-message">불러오는 중…</p> : treeError ? <div className="explorer-tree-message" role="alert">{treeError}<button onClick={loadTree}>다시 시도</button></div> : roots.map(note => branch(note))}
          {!loadingTree && !treeError && !notes.length && <p className="explorer-tree-message">저장된 문서가 없습니다.</p>}
          <Link className="explorer-external" to="/lab-wish" onClick={async event => { event.preventDefault(); if (!creating.current && !deletingPage.current && await finishPending()) navigate('/lab-wish'); }}><img src={folderIcon} alt=""/>wish ↗</Link>
        </>}
      </aside>
      <section className="explorer-editor-pane" aria-label="문서 편집기" onClick={event => { if (!deleteImage(event)) followChildLink(event); }} onKeyDown={event => { followChildLink(event); if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') event.preventDefault(); }}>
        <input ref={imageInput} type="file" accept="image/*" multiple hidden aria-label="이미지 파일 선택" onChange={event => {
          const files = Array.from(event.target.files || []); event.target.value = '';
          const target = imageTarget.current;
          if (target?.id === selection.id && files.length) uploadImages(files, target.range);
        }}/>
        <div className="explorer-pane-heading explorer-document-heading"><span>{selection.id === 'root' ? '문서 편집기' : `${selection.title}${dirty ? ' *' : ''}`}</span><span>{selection.id === 'root' ? '' : canEdit ? '온라인 편집' : '읽기 전용'}</span></div>
        {selection.id === 'root' ? <div className="explorer-empty"><span className="explorer-empty-paper" aria-hidden="true">Aa</span><h2>폴더를 선택하세요</h2><p>왼쪽에서 폴더를 펼쳐 문서를 열 수 있습니다.</p><p>선택한 문서는 이곳에서 읽고 편집합니다.</p></div> : <>
          <EditorToolbar editor={editor} editable={editable}/>
          {!canEdit && <div className="explorer-readonly">{user ? '이 계정은 읽기 권한만 있습니다.' : <>편집하려면 <Link to="/login">관리자 로그인</Link>이 필요합니다.</>}</div>}
          {loading ? <p className="explorer-tree-message">문서를 불러오는 중…</p> : !loaded ? <div className="explorer-tree-message" role="alert">{message}<button onClick={() => open(selection)}>다시 시도</button></div> : <><div className="explorer-title-section"><input aria-label="문서 제목" placeholder="제목 없음" value={selection.title} readOnly={!editable} onChange={event => rename(event.target.value)}/></div><EditorContent className={`explorer-editor ${editable ? 'editable' : 'readonly'}`} editor={editor}/><SlashBlockMenu editor={editor} enabled={editable} onCreatePage={createChildPage} onInsertImage={chooseImage}/></>}
        </>}
      </section>
    </div>
  </AppWindow>;
}
