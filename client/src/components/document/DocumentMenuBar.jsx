import { useEffect, useId, useRef, useState } from 'react';
import documentIcons from 'virtual:document-icons';

export default function DocumentMenuBar({ canExport, exporting, onExport, maximized, onMaximize, onRestore, onMinimize, onClose, showIcons, canChooseIcon, selectedIcon, onChooseIcon, onHelp }) {
  const [open, setOpen] = useState(null);
  const root = useRef(null);
  const id = useId();
  const menus = [
    { label: '파일(F)', items: [
      { label: '이미지로 내보내기…', icon: '▧', disabled: !canExport || exporting, action: () => onExport('png') },
      { label: 'PDF로 내보내기…', icon: '▤', disabled: !canExport || exporting, action: () => onExport('pdf') },
    ] },
    { label: '보기(V)', items: [
      { label: '최소화(N)', icon: '▁', disabled: !onMinimize, action: onMinimize },
      { label: '최대화(X)', icon: '□', disabled: maximized, action: onMaximize },
      { label: '이전 크기로(R)', icon: '▣', disabled: !maximized, action: onRestore },
      { label: '닫기(C)', icon: '×', separator: true, action: onClose },
    ] },
    ...(showIcons ? [{ label: '아이콘(I)', icons: true, disabled: !canChooseIcon, items: documentIcons.map(icon => ({
      label: icon.name, image: icon.url, checked: icon.url === (selectedIcon || '/images/icon/file_lines.png'), action: () => onChooseIcon(icon.url),
    })) }] : []),
  ];
  useEffect(() => {
    if (open === null) return;
    const dismiss = event => { if (!root.current?.contains(event.target)) setOpen(null); };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('focusin', dismiss);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('focusin', dismiss);
    };
  }, [open]);
  useEffect(() => {
    if (open !== null) root.current?.querySelector('[role="menu"] button:not(:disabled)')?.focus();
  }, [open]);
  function keyDown(event) {
    if (open === null) return;
    if (event.key === 'Escape') {
      event.preventDefault(); event.stopPropagation();
      root.current.querySelectorAll('[aria-haspopup="menu"]')[open]?.focus();
      setOpen(null);
    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const items = [...root.current.querySelectorAll('[role="menu"] button:not(:disabled)')];
      if (!items.length) return;
      const index = items.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowUp' ? -1 : 1) + items.length) % items.length;
      items[next].focus();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); setOpen((open + 1) % menus.length);
    } else if (event.key === 'Tab') setOpen(null);
  }
  return <div className="explorer-menubar" ref={root} onKeyDown={keyDown}>
    {menus.map((menu, index) => <div className="explorer-menu" key={menu.label}>
      <button type="button" disabled={menu.disabled} id={`${id}-trigger-${index}`} className="explorer-menu-trigger" aria-haspopup="menu" aria-expanded={open === index} aria-controls={open === index ? `${id}-menu-${index}` : undefined}
        onClick={() => setOpen(open === index ? null : index)} onPointerEnter={() => { if (open !== null) setOpen(index); }}
        onKeyDown={event => { if (open === null && event.key === 'ArrowDown') { event.preventDefault(); setOpen(index); } }}>{menu.label}</button>
      {open === index && !menu.disabled && <div className={`explorer-menu-popup${menu.icons ? ' explorer-icon-menu' : ''}`} role="menu" id={`${id}-menu-${index}`} aria-labelledby={`${id}-trigger-${index}`}>
        {menu.items.map(item => <div key={item.label}>
          {item.separator && <div className="explorer-menu-separator" role="separator"/>}
          <button type="button" role={menu.icons ? 'menuitemradio' : 'menuitem'} aria-checked={menu.icons ? item.checked : undefined} title={item.label} disabled={item.disabled} onClick={() => { setOpen(null); item.action?.(); }}><span aria-hidden="true">{item.image ? <img src={item.image} alt=""/> : item.icon}</span>{item.label}</button>
        </div>)}
      </div>}
    </div>)}
    <button type="button" className="explorer-menu-trigger" onClick={() => { setOpen(null); onHelp?.(); }}>도움말(H)</button>
  </div>;
}
