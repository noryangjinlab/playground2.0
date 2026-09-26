# App window

Reusable desktop window package. Import from `components/app-window`.
`AppWindow` owns its frame, title bar, dragging, maximization, focus on opening,
and responsive sizing. Feature components supply only their content.

```jsx
import { useState } from 'react';
import { AppWindow, useWindowStack } from './components/app-window';

function Desktop() {
  const [status, setStatus] = useState('closed');
  const { bringToFront, windowLayer } = useWindowStack(['notes']);
  const open = () => { setStatus('open'); bringToFront('notes'); };

  return <>
    <button onClick={open}>메모</button>
    {status !== 'closed' && <AppWindow
      title="메모"
      icon="/images/icon/directory_open_1.png"
      width={640}
      height={480}
      minimized={status === 'minimized'}
      zIndex={windowLayer('notes')}
      onActivate={() => bringToFront('notes')}
      onMinimize={() => setStatus('minimized')}
      onClose={() => setStatus('closed')}
      footer={<span>준비</span>}
    >
      <textarea aria-label="메모 내용" />
    </AppWindow>}
  </>;
}
```

- Share one `useWindowStack` instance across all apps on a desktop. Add new app IDs
  to its initial order, or call `bringToFront(id)` to register them on opening.
- `getActiveWindow(id => isVisible)` gives the frontmost visible app. Taskbar clicks
  restore/raise inactive apps and minimize the active app.
- Keep minimized apps mounted using `minimized`; this preserves form contents,
  position and maximization. Unmount on close to reset their state.
- `width`/`height` are initial pixel dimensions, bounded to the viewport.
  `taskbarHeight` defaults to 36. Maximization leaves this area visible.
- `draggable`, `maximizable`, `minimizable`, and `closable` default to true.
  Set each control option to false to hide it independently, for example
  `<AppWindow maximizable={false} minimizable={true} closable={true} ... />`.
  Minimizing and closing also require their `onMinimize`/`onClose` callbacks.
  Disabling `maximizable` also disables title-bar double-click maximization.
  `className` can style feature content without duplicating
  frame rules. `footer` is optional and stays outside the scrolling content.
- Current migrations: DocumentsWindow, the welcome app and AudioPlayer.
  AudioPlayer stays mounted while hidden to retain its audio element and analyzer;
  minimizing preserves playback and closing pauses it.
