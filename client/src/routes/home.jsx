import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import AudioPlayer from '../components/AudioPlayer';
import DocumentsWindow from '../components/DocumentsWindow';
import AuthWindow from '../components/AuthWindow';
import { AppWindow, useWindowStack } from '../components/app-window';
import '../style/desktop.css';

const iconFiles = {
  computer: 'my_computer.png',
  folder: 'directory_open_1.png',
  music: 'audio_cd.png',
  net: 'i_explorer.png',
  login: 'users_key.png'
};

function Icon({ type }) {
  return <img className="desktop-icon-art" src={`/images/icon/${iconFiles[type]}`} alt="" draggable={false}/>;
}
export default function Home({ audioState, onAudioChange }) {
  const [welcomeState, setWelcomeState] = useState('closed');
  const [documentsState, setDocumentsState] = useState('closed');
  const [authState, setAuthState] = useState('closed');
  const { bringToFront, windowLayer, getActiveWindow } = useWindowStack(['welcome', 'documents', 'music', 'auth']);
  const activeWindow = getActiveWindow(id => id === 'welcome' ? welcomeState === 'open' : id === 'documents' ? documentsState === 'open' : id === 'auth' ? authState === 'open' : audioState === 2);
  const openWelcome = () => { setWelcomeState('open'); bringToFront('welcome'); };
  const openDocuments = () => { setDocumentsState('open'); bringToFront('documents'); };
  const openAuth = () => { setAuthState('open'); bringToFront('auth'); };
  const [now, setNow] = useState(() => new Date());
  const [selected, setSelected] = useState([]);
  const [selectionBox, setSelectionBox] = useState(null);
  const desktopRef = useRef(null);
  const dragRef = useRef(null);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const openMusic = () => { onAudioChange(2); bringToFront('music'); };
  const startSelection = event => {
    if (event.button !== 0 || !event.isPrimary || event.target.closest('a, button, .win98-window, .desktop-jukebox, .win98-taskbar')) return;
    event.preventDefault();
    dragRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId, initial: selected, additive: event.ctrlKey || event.metaKey || event.shiftKey };
    if (!dragRef.current.additive) setSelected([]);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const updateSelection = event => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const box = { left: Math.min(drag.x, event.clientX), top: Math.min(drag.y, event.clientY), width: Math.abs(event.clientX - drag.x), height: Math.abs(event.clientY - drag.y) };
    if (box.width < 3 && box.height < 3) return;
    setSelectionBox(box);
    const hits = [...desktopRef.current.querySelectorAll('[data-desktop-icon]')].filter(icon => {
      const rect = icon.getBoundingClientRect();
      return rect.left <= box.left + box.width && rect.right >= box.left && rect.top <= box.top + box.height && rect.bottom >= box.top;
    }).map(icon => icon.dataset.desktopIcon);
    setSelected([...new Set([...(drag.additive ? drag.initial : []), ...hits])]);
  };
  const finishSelection = event => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
    if (event.type === 'pointercancel') setSelected(dragRef.current.initial);
    dragRef.current = null;
    setSelectionBox(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const selectIcon = (event, id, action) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      event.preventDefault();
      setSelected(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);
      return;
    }
    setSelected([id]);
    action?.();
  };
  const iconClass = id => `desktop-shortcut${selected.includes(id) ? ' is-selected' : ''}`;
  return <main ref={desktopRef} className="win98-desktop" onPointerDown={startSelection} onPointerMove={updateSelection} onPointerUp={finishSelection} onPointerCancel={finishSelection} onLostPointerCapture={finishSelection}>
    {selectionBox && <div className="desktop-selection-box" style={selectionBox} aria-hidden="true"/>}
    <nav className="desktop-shortcuts" aria-label="바탕화면 바로가기">
      <button data-desktop-icon="computer" className={iconClass('computer')} onClick={event => selectIcon(event, 'computer', openWelcome)}><Icon type="computer"/><span>내 컴퓨터</span></button>
      <button data-desktop-icon="folder" className={iconClass('folder')} onClick={event => selectIcon(event, 'folder', openDocuments)}><Icon type="folder"/><span>파일탐색기</span></button>
      <button data-desktop-icon="music" className={iconClass('music')} onClick={event => selectIcon(event, 'music', openMusic)}><Icon type="music"/><span>jukebox</span></button>
      <button data-desktop-icon="net" className={iconClass('net')} onClick={event => selectIcon(event, 'net', openMusic)}><Icon type="net"/><span>@ explorer</span></button>
      <button data-desktop-icon="login" className={iconClass('login')} onClick={event => selectIcon(event, 'login', openAuth)}><Icon type="login"/><span>로그인 체계</span></button>
    </nav>
    <div className="desktop-workspace">
      {welcomeState !== 'closed' && <AppWindow title="noryangjinLAB — Welcome" icon="/images/icon/my_computer.png" height={560} minimized={welcomeState === 'minimized'} zIndex={windowLayer('welcome')} onActivate={() => bringToFront('welcome')} onMinimize={() => setWelcomeState('minimized')} onClose={() => setWelcomeState('closed')}>
        <div className="window-menubar"><span>noryangjinLAB에 오신 것을 환영합니다</span><span className="window-version">v2.1.3</span></div>
        <div className="welcome-body">
          <div className="welcome-heading"><Icon type="computer"/><div><p>Welcome ...</p><h1>All Manufactured by noryangjinLAB™</h1></div></div>
          <p className="welcome-description">
            released on 2023.05.21<br/>
            서울특별시 동작구 노들로 2길 7<br/>
            Tel) 010-8681-0930<br/>
            Mail) hlawliet113@gmail.com
          </p>
          <div className="notice-paper"><h2>NOTICE</h2>
            <article><strong>웹사이트 업데이트</strong>
            <p>noryangjinlab 2.0 패치 — 웹사이트 UI 및 기능이 전면 업데이트 되었습니다.</p>
            </article>
            <article><strong>연구실 이전 안내</strong>
            <p>2026.02.20일 부로 연구실이 노량진에서 이전합니다. 호스팅 중인 서비스들이 일시적으로 중단될 예정입니다.</p>
            </article>
            <article><strong>라이브 공연 안내</strong>
            <p>2026.03.21 · 18:00 · 홍대 스윙홀<br/>Electric Fan Harp on LIVE<br/>입장료: 현장 15,000원 / 예매 10,000원</p>
            </article>
            <article><strong>새 라이브 공연 안내</strong>
            <p>(NEW) 2027.03 라이브가 계획되어 있습니다.<br/>
            Dyson V10 Vacuum Guitar on LIVE</p>
            </article>
          </div>
          <div className="welcome-actions"><Link to="/lab/f4134acb-f0db-4934-9c18-0f90065d4711" className="win98-button">패치노트 보기</Link></div>
        </div>
        <footer className="window-status"><span>No copyright ⓒ 2023 noryangjinlab. All rights not reserved.</span><span>Last update 2026.09.26</span></footer>
      </AppWindow>}
    </div>
    <AudioPlayer props={audioState} onSend={onAudioChange} zIndex={windowLayer('music')} onActivate={() => bringToFront('music')}/>
    {documentsState !== 'closed' && <DocumentsWindow minimized={documentsState === 'minimized'} zIndex={windowLayer('documents')} onActivate={() => bringToFront('documents')} onMinimize={() => setDocumentsState('minimized')} onClose={() => setDocumentsState('closed')}/>}
    {authState !== 'closed' && <AuthWindow minimized={authState === 'minimized'} zIndex={windowLayer('auth')} onActivate={() => bringToFront('auth')} onMinimize={() => setAuthState('minimized')} onClose={() => setAuthState('closed')}/>}
    <footer className="win98-taskbar">
      {authState !== 'closed' && <button className={`win98-button task-button ${activeWindow === 'auth' ? 'pressed' : ''}`} onClick={() => activeWindow === 'auth' ? setAuthState('minimized') : openAuth()}><Icon type="login"/><span>로그인 체계</span></button>}
      {documentsState !== 'closed' && <button className={`win98-button task-button ${activeWindow === 'documents' ? 'pressed' : ''}`} onClick={() => activeWindow === 'documents' ? setDocumentsState('minimized') : openDocuments()}><Icon type="folder"/><span>파일탐색기</span></button>}
      {welcomeState !== 'closed' && <button className={`win98-button task-button ${activeWindow === 'welcome' ? 'pressed' : ''}`} onClick={() => activeWindow === 'welcome' ? setWelcomeState('minimized') : openWelcome()}><Icon type="computer"/><span>Welcome</span></button>}
      {audioState !== 1 && <button className={`win98-button task-button music-task ${activeWindow === 'music' ? 'pressed' : ''}`} onClick={() => activeWindow === 'music' ? onAudioChange(0) : openMusic()}><Icon type="music"/><span>Jukebox.exe</span></button>}
      <time className="system-tray" dateTime={now.toISOString()}>
        <span className="tray-date">{now.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
        <span>{now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
      </time>
    </footer>
  </main>;
}
