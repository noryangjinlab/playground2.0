import { useEffect, useId, useRef, useState } from 'react';
import './app-window.css';

function ControlIcon({ type }) {
  return <svg className="app-window-control-icon" viewBox="0 0 10 10" aria-hidden="true" focusable="false" shapeRendering="crispEdges">
    {type === 'minimize' && <path fill="currentColor" d="M1 6h8v2H1z"/>}
    {type === 'maximize' && <path fill="currentColor" fillRule="evenodd" d="M1 1h8v8H1zM2 3v5h6V3z"/>}
    {type === 'restore' && <><path fill="currentColor" d="M3 0h7v7H8V2H3z"/><path fill="currentColor" fillRule="evenodd" d="M0 3h7v7H0zM1 5v4h5V5z"/></>}
    {type === 'close' && <path fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" shapeRendering="geometricPrecision" d="M2 2l6 6M8 2L2 8"/>}
  </svg>;
}

export default function AppWindow({
  title, icon, children, footer, onClose, onMinimize, onActivate,
  zIndex = 10, minimized = false, draggable = true, maximizable = true,
  minimizable = true, closable = true,
  maximized: controlledMaximized, onMaximizedChange,
  width = 720, height = 460, taskbarHeight = 36, className = '',
}) {
  const titleId = useId();
  const windowRef = useRef(null);
  const dragRef = useRef(null);
  const [internalMaximized, setInternalMaximized] = useState(false);
  const maximized = controlledMaximized ?? internalMaximized;
  const setMaximized = value => {
    const next = typeof value === 'function' ? value(maximized) : value;
    if (controlledMaximized === undefined) setInternalMaximized(next);
    onMaximizedChange?.(next);
  };
  const [position, setPosition] = useState(null);

  const startDrag = event => {
    if (!draggable || maximized || event.button !== 0 || event.target.closest('button')) return;
    const rect = windowRef.current.getBoundingClientRect();
    dragRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };
  const moveDrag = event => {
    if (!dragRef.current) return;
    const rect = windowRef.current.getBoundingClientRect();
    setPosition({
      left: Math.max(0, Math.min(window.innerWidth - rect.width, event.clientX - dragRef.current.x)),
      top: Math.max(0, Math.min(window.innerHeight - taskbarHeight - 24, event.clientY - dragRef.current.y)),
    });
  };
  const stopDrag = event => {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  useEffect(() => {
    if (!minimized) windowRef.current?.focus();
  }, [minimized]);

  return (
    <section ref={windowRef} className={`app-window win98-window ${className}${maximized ? ' is-maximized' : ''}`}
      hidden={minimized}
      style={{ '--app-width': `${width}px`, '--app-height': `${height}px`, '--taskbar-height': `${taskbarHeight}px`, ...(!maximized && position ? { ...position, transform: 'none' } : {}), zIndex }}
      onPointerDownCapture={onActivate} onFocusCapture={onActivate} role="dialog" aria-labelledby={titleId} tabIndex={-1}>
      <header className="app-window-titlebar" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={stopDrag} onPointerCancel={stopDrag} onLostPointerCapture={stopDrag}
        onDoubleClick={event => { if (maximizable && !event.target.closest('button')) setMaximized(value => !value); }}>
        <span className="app-window-title" id={titleId}>{icon && <img src={icon} alt="" draggable={false}/>}<span>{title}</span></span>
        <div className="app-window-controls">
          {minimizable && onMinimize && <button type="button" onClick={onMinimize} aria-label={`${title} 최소화`} title="최소화"><ControlIcon type="minimize"/></button>}
          {maximizable && <button type="button" onClick={() => setMaximized(value => !value)} aria-label={`${title} ${maximized ? '원래 크기로' : '최대화'}`} title={maximized ? '원래 크기로' : '최대화'}><ControlIcon type={maximized ? 'restore' : 'maximize'}/></button>}
          {closable && onClose && <button className="app-window-close" type="button" onClick={onClose} aria-label={`${title} 닫기`} title="닫기"><ControlIcon type="close"/></button>}
        </div>
      </header>
      <div className="app-window-content">{children}</div>
      {footer && <footer className="app-window-footer">{footer}</footer>}
    </section>
  );
}
