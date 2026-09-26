import { useState } from 'react';

// Keep a bounded stacking order; the taskbar remains above every app.
export function useWindowStack(initialOrder = []) {
  const [order, setOrder] = useState(initialOrder);
  const bringToFront = id => setOrder(previous => previous.at(-1) === id ? previous : [...previous.filter(item => item !== id), id]);
  const windowLayer = id => 10 + Math.max(0, order.indexOf(id));
  const getActiveWindow = isVisible => order.filter(isVisible).at(-1);
  return { bringToFront, windowLayer, getActiveWindow };
}
