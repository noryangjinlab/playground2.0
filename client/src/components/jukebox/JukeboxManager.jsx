import { useEffect, useRef, useState } from 'react';
import { fetchApi } from '../../api';
import { AppWindow } from '../app-window';
import './jukebox-manager.css';

export default function JukeboxManager({ onCatalogChange, onClose, zIndex, onActivate }) {
  const [catalog, setCatalog] = useState({ playlists: [], tracks: [] });
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [addingMusic, setAddingMusic] = useState(false);
  const [addingPlaylist, setAddingPlaylist] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const lock = useRef(false);
  const pointerDrag = useRef(null);
  const selected = catalog.playlists.find(item => item.id === selectedId);
  const visibleTracks = catalog.tracks.filter(track => `${track.title} ${track.artist}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));

  useEffect(() => {
    const controller = new AbortController();
    fetchApi('/jukebox', { signal: controller.signal }).then(data => {
      setCatalog(data); setSelectedId(previous => data.playlists.some(item => item.id === previous) ? previous : data.playlists[0]?.id || '');
    }).catch(error => { if (!controller.signal.aborted) setLoadError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload]);

  function publish(next) { setCatalog(next); onCatalogChange(next); }
  async function run(action, message) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setNotice(null);
    try { await action(); setNotice({ text: message, error: false }); }
    catch (error) { setNotice({ text: error.message, error: true }); }
    finally { lock.current = false; setBusy(false); }
  }
  function createPlaylist(event) {
    event.preventDefault();
    const name = new FormData(event.currentTarget).get('name');
    run(async () => {
      const { playlist } = await fetchApi('/jukebox/playlists', { method: 'POST', body: JSON.stringify({ name }) });
      publish({ ...catalog, playlists: [...catalog.playlists, playlist] });
      setSelectedId(playlist.id); setAddingPlaylist(false);
    }, '플레이리스트를 만들었습니다. 음악 보관함의 + 버튼으로 곡을 담아보세요.');
  }
  function uploadMusic(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    run(async () => {
      const file = data.get('file');
      if (!file || !/\.mp3$/i.test(file.name)) throw new Error('MP3 파일만 선택해주세요.');
      if (file.size > 50 * 1024 * 1024) throw new Error('MP3는 최대 50MB까지 업로드할 수 있습니다.');
      const { track } = await fetchApi('/jukebox/tracks', { method: 'POST', body: data });
      publish({ ...catalog, tracks: [...catalog.tracks, track] }); setAddingMusic(false); setQuery('');
    }, '음악 보관함에 등록했습니다. + 버튼으로 원하는 플레이리스트에 담으세요.');
  }
  function replacePlaylist(playlist) {
    publish({ ...catalog, playlists: catalog.playlists.map(item => item.id === playlist.id ? playlist : item) });
  }
  function addTrack(track) {
    setRenaming(false);
    if (!selected) return;
    run(async () => {
      const { playlist } = await fetchApi(`/jukebox/playlists/${selected.id}/items`, { method: 'POST', body: JSON.stringify({ trackId: track.id }) });
      replacePlaylist(playlist);
    }, `「${track.title}」을 플레이리스트에 추가했습니다.`);
  }
  function reorder(fromId, targetIndex) {
    if (!selected || lock.current) return;
    const tracks = [...selected.tracks];
    const from = tracks.findIndex(track => track.id === fromId);
    if (from < 0 || from === targetIndex || targetIndex < 0 || targetIndex >= tracks.length) return;
    tracks.splice(targetIndex, 0, tracks.splice(from, 1)[0]);
    run(async () => {
      const { playlist } = await fetchApi(`/jukebox/playlists/${selected.id}/order`, { method: 'PUT', body: JSON.stringify({ trackIds: tracks.map(track => track.id) }) });
      replacePlaylist(playlist);
    }, '곡 순서를 저장했습니다.');
  }

  function renamePlaylist(event) {
    event.preventDefault();
    const name = new FormData(event.currentTarget).get('name');
    run(async () => {
      const { playlist } = await fetchApi(`/jukebox/playlists/${selected.id}`, { method: 'PATCH', body: JSON.stringify({ name }) });
      replacePlaylist(playlist); setRenaming(false);
    }, '플레이리스트 이름을 변경했습니다.');
  }
  function deletePlaylist() {
    if (!selected || lock.current || !window.confirm(`「${selected.name}」 플레이리스트를 삭제할까요? 음악 보관함과 MP3 파일은 유지됩니다.`)) return;
    run(async () => {
      await fetchApi(`/jukebox/playlists/${selected.id}`, { method: 'DELETE' });
      const playlists = catalog.playlists.filter(item => item.id !== selected.id);
      publish({ ...catalog, playlists }); setSelectedId(playlists[0]?.id || ''); setRenaming(false);
    }, '플레이리스트를 삭제했습니다. 음악 보관함의 곡은 유지됩니다.');
  }
  function removeTrack(track) {
    run(async () => {
      const { playlist } = await fetchApi(`/jukebox/playlists/${selected.id}/items/${track.id}`, { method: 'DELETE' });
      replacePlaylist(playlist);
    }, `「${track.title}」을 목록에서 뺐습니다. 보관함에서 다시 추가할 수 있습니다.`);
  }

  function startPointerDrag(event, track) {
    if (busy || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerDrag.current = { id: track.id, x: event.clientX, y: event.clientY, target: -1, moved: false };
  }
  function movePointerDrag(event) {
    const drag = pointerDrag.current;
    if (!drag) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 5) return;
    drag.moved = true; setDraggedId(drag.id);
    const row = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-jm-index]');
    if (row && event.currentTarget.closest('ol')?.contains(row)) {
      drag.target = Number(row.dataset.jmIndex);
      setDropTarget(selected.tracks[drag.target].id);
      const list = row.parentElement;
      const bounds = list.getBoundingClientRect();
      if (event.clientY > bounds.bottom - 32) list.scrollTop += 12;
      if (event.clientY < bounds.top + 32) list.scrollTop -= 12;
    } else { drag.target = -1; setDropTarget(null); }
  }
  function endPointerDrag(event, cancelled = false) {
    const drag = pointerDrag.current;
    pointerDrag.current = null;
    if (!cancelled && drag?.moved && drag.target >= 0) reorder(drag.id, drag.target);
    setDraggedId(null); setDropTarget(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return <AppWindow title="jukebox — MP3 관리자" icon="/images/icon/audio_cd.png" width={1040} height={640}
    className="jukebox-manager" minimizable={false} closable={!busy} onClose={onClose} zIndex={zIndex} onActivate={onActivate}
    footer={<div className={`jm-status${notice?.error ? ' is-error' : ''}`} role={notice?.error ? 'alert' : 'status'}>
      {busy ? '저장 중…' : notice?.text || '플레이리스트를 선택하고 음악을 담으세요. 곡 순서는 드래그하면 자동 저장됩니다.'}
    </div>}>
    <div className="jm-heading"><strong>음악 & 플레이리스트</strong><span>MP3 보관함과 재생 순서를 한곳에서 관리하세요.</span></div>
    {loading ? <p className="jm-empty" role="status">음악 목록을 불러오는 중…</p> : loadError ? <div className="jm-empty" role="alert">{loadError}<button onClick={() => { setLoading(true); setLoadError(''); setReload(value => value + 1); }}>다시 시도</button></div> :
      <div className="jm-columns" aria-busy={busy}>
        <section className="jm-panel jm-library" aria-label="음악 보관함">
          <div className="jm-panel-heading"><h2>음악 보관함 <small>{catalog.tracks.length}</small></h2><button disabled={busy} onClick={() => setAddingMusic(value => !value)} aria-expanded={addingMusic}>+ 음악 추가</button></div>
          {addingMusic && <form className="jm-form" onSubmit={uploadMusic}><fieldset disabled={busy}><legend>새 MP3 등록</legend>
            <label>제목<input name="title" required maxLength={200} autoFocus /></label>
            <label>아티스트<input name="artist" required maxLength={200} /></label>
            <label>MP3 파일 · 최대 50MB<input name="file" type="file" accept=".mp3,audio/mpeg" required /></label>
            <div className="jm-form-actions"><button type="button" onClick={() => setAddingMusic(false)}>취소</button><button type="submit">업로드</button></div>
          </fieldset></form>}
          <label className="jm-search">음악 검색<input type="search" placeholder="제목 또는 아티스트" value={query} onChange={event => setQuery(event.target.value)} /></label>
          <p className="jm-hint">{selected ? `+ 버튼 → 「${selected.name}」에 추가` : '먼저 플레이리스트를 만들어주세요.'}</p>
          <ul className="jm-list jm-library-list">{visibleTracks.map(track => {
            const included = selected?.tracks.some(item => item.id === track.id);
            return <li className="jm-track" key={track.id}><span className="jm-music-icon" aria-hidden="true">♪</span><div className="jm-track-info"><strong>{track.title}</strong><span>{track.artist}</span></div>
              <button className="jm-add" disabled={busy || !selected || included} aria-label={included ? `${track.title} 추가됨` : `${track.title} 플레이리스트에 추가`} title={included ? '이미 추가된 곡' : '선택한 플레이리스트에 추가'} onClick={() => addTrack(track)}>{included ? '✓' : '+'}</button>
            </li>;
          })}{!visibleTracks.length && <li className="jm-empty">{query ? '검색 결과가 없습니다.' : '음악 추가 버튼으로 MP3를 등록하세요.'}</li>}</ul>
        </section>
        <section className="jm-panel jm-playlists" aria-label="플레이리스트 목록">
          <div className="jm-panel-heading"><h2>플레이리스트 <small>{catalog.playlists.length}</small></h2><button disabled={busy} onClick={() => setAddingPlaylist(value => !value)} aria-expanded={addingPlaylist}>+ 추가</button></div>
          {addingPlaylist && <form className="jm-form" onSubmit={createPlaylist}><fieldset disabled={busy}><legend>플레이리스트 추가</legend><label>이름<input name="name" required maxLength={200} autoFocus /></label><div className="jm-form-actions"><button type="button" onClick={() => setAddingPlaylist(false)}>취소</button><button type="submit">만들기</button></div></fieldset></form>}
          <ul className="jm-list">{catalog.playlists.map(item => <li key={item.id}><button className={`jm-playlist-button${item.id === selectedId ? ' is-selected' : ''}`} aria-pressed={item.id === selectedId} disabled={busy} onClick={() => { setSelectedId(item.id); setDraggedId(null); setDropTarget(null); }}><span>{item.name}</span><small>{item.tracks.length}곡</small></button></li>)}
            {!catalog.playlists.length && <li className="jm-empty">나만의 플레이리스트를 만들어보세요.</li>}</ul>
        </section>
        <section className="jm-panel jm-order" aria-label="플레이리스트 곡 순서">
          <div className="jm-panel-heading"><h2>{selected?.name || '플레이리스트를 선택하세요'}<small>{selected ? `${selected.tracks.length}곡` : ''}</small></h2></div>
          {selected && <div className="jm-playlist-actions"><button disabled={busy} onClick={() => setRenaming(value => !value)} aria-expanded={renaming}>이름 수정</button><button disabled={busy} onClick={deletePlaylist}>플레이리스트 삭제</button></div>}
          {selected && renaming && <form key={selected.id} className="jm-form" onSubmit={renamePlaylist}><fieldset disabled={busy}><legend>플레이리스트 이름 수정</legend><label>이름<input name="name" defaultValue={selected.name} required maxLength={200} autoFocus /></label><div className="jm-form-actions"><button type="button" onClick={() => setRenaming(false)}>취소</button><button type="submit">저장</button></div></fieldset></form>}
          <p className="jm-hint">⠿ 곡을 드래그하여 순서 변경 · 자동 저장<br />화살표 버튼으로도 순서를 바꿀 수 있습니다.</p>
          <ol className="jm-list">{selected?.tracks.map((track, index) => <li key={track.id} data-jm-index={index}
            className={`jm-track jm-sortable${draggedId === track.id ? ' is-dragging' : ''}${dropTarget === track.id && draggedId !== track.id ? ' is-drop-target' : ''}`}
            draggable={!busy} onDragStart={event => { if (busy) { event.preventDefault(); return; } event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', track.id); setDraggedId(track.id); }}
            onDragOver={event => { if (draggedId && !busy) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDropTarget(track.id); } }}
            onDrop={event => { event.preventDefault(); if (draggedId) reorder(draggedId, index); setDraggedId(null); setDropTarget(null); }}
            onDragEnd={() => { setDraggedId(null); setDropTarget(null); }}>
            <button className="jm-grip" disabled={busy} aria-label={`${track.title} 순서 드래그`} title="드래그하여 순서 변경"
              onPointerDown={event => startPointerDrag(event, track)} onPointerMove={movePointerDrag} onPointerUp={event => endPointerDrag(event)} onPointerCancel={event => endPointerDrag(event, true)} onLostPointerCapture={event => endPointerDrag(event, true)}>⠿</button>
            <span className="jm-number">{index + 1}</span><div className="jm-track-info"><strong>{track.title}</strong><span>{track.artist}</span></div>
            <div className="jm-move"><button disabled={busy || index === 0} aria-label={`${track.title} 위로 이동`} onClick={() => reorder(track.id, index - 1)}>↑</button><button disabled={busy || index === selected.tracks.length - 1} aria-label={`${track.title} 아래로 이동`} onClick={() => reorder(track.id, index + 1)}>↓</button><button disabled={busy} aria-label={`${track.title} 목록에서 빼기`} title="목록에서 빼기 (MP3 유지)" onClick={() => removeTrack(track)}>−</button></div>
          </li>)}{!selected?.tracks.length && <li className="jm-empty">{selected ? '아직 곡이 없습니다. 음악 보관함에서 + 버튼을 눌러 곡을 담으세요.' : '플레이리스트를 선택하면 곡이 표시됩니다.'}</li>}</ol>
        </section>
      </div>}
  </AppWindow>;
}
