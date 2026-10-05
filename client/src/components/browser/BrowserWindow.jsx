import { useEffect, useRef, useState } from 'react';
import { AppWindow } from '../app-window';
import '../../style/browser.css';
import HelpPage from './HelpPage';
import HomePage from './HomePage';

const pages = [
  { id: 'home', title: '홈', address: '@explorer://home', component: HomePage },
  { id: 'help', title: '파일탐색기 도움말', address: '@explorer://help', component: HelpPage },
];

export default function BrowserWindow({ pageId = 'home', onPageChange, ...windowProps }) {
  const initialPage = pages.some(page => page.id === pageId) ? pageId : 'home';
  const [currentId, setCurrentId] = useState(initialPage);
  const currentRef = useRef(initialPage);
  const [history, setHistory] = useState({ items: [initialPage], index: 0 });
  const currentPage = pages.find(page => page.id === currentId) || pages[0];
  const Page = currentPage.component;

  const navigateTo = id => {
    if (!pages.some(page => page.id === id) || currentRef.current === id) return;
    currentRef.current = id;
    setCurrentId(id);
    setHistory(previous => {
      const items = [...previous.items.slice(0, previous.index + 1), id];
      return { items, index: items.length - 1 };
    });
    onPageChange?.(id);
  };

  useEffect(() => {
    if (!pages.some(page => page.id === pageId) || currentRef.current === pageId) return;
    currentRef.current = pageId;
    setCurrentId(pageId);
    setHistory(previous => {
      const items = [...previous.items.slice(0, previous.index + 1), pageId];
      return { items, index: items.length - 1 };
    });
  }, [pageId]);

  const goToHistory = index => {
    const id = history.items[index];
    if (!id) return;
    currentRef.current = id;
    setCurrentId(id);
    setHistory(previous => ({ ...previous, index }));
    onPageChange?.(id);
  };

  return <AppWindow {...windowProps} title="@ explorer" icon="/images/icon/i_explorer.png" width={900} height={650} className="browser-window"
    footer={<span className="browser-status">{currentPage.title} · @ explorer</span>}>
    <div className="browser-frame">
      <div className="browser-toolbar" aria-label="브라우저 탐색 도구">
        <button type="button" aria-label="뒤로" title="뒤로" disabled={history.index === 0} onClick={() => goToHistory(history.index - 1)}>←</button>
        <button type="button" aria-label="앞으로" title="앞으로" disabled={history.index >= history.items.length - 1} onClick={() => goToHistory(history.index + 1)}>→</button>
        <button type="button" aria-label="홈" title="홈" onClick={() => navigateTo('home')}>⌂</button>
        <label className="browser-address"><span>주소</span><input readOnly value={currentPage.address} aria-label="현재 페이지 주소"/></label>
      </div>
      <div className="browser-layout">
        <nav className="browser-pages" aria-label="페이지 링크">
          <strong>페이지</strong>
          {pages.map(page => <button key={page.id} type="button" className={currentId === page.id ? 'is-current' : ''}
            aria-current={currentId === page.id ? 'page' : undefined} onClick={() => navigateTo(page.id)}>{page.title}</button>)}
        </nav>
        <main className="browser-page" key={currentId}>
          <Page onNavigate={navigateTo}/>
        </main>
      </div>
    </div>
  </AppWindow>;
}
