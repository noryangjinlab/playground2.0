// Keep snapshots immutable and serialize requests so an older save cannot win.
export function createDebouncedDocumentSave(write, status, delay = 600) {
  let pending = null, timer = null, running = false, disposed = false, failures = 0;
  let waiters = [];
  const settle = error => {
    const current = waiters; waiters = [];
    current.forEach(({ resolve, reject }) => error ? reject(error) : resolve());
  };
  const schedule = (ms = delay) => {
    clearTimeout(timer);
    timer = setTimeout(() => { timer = null; run(); }, ms);
  };
  async function run() {
    if (disposed || running || !pending) return;
    const snapshot = pending; pending = null; running = true;
    status('saving');
    try {
      await write(snapshot);
      failures = 0;
      if (!disposed) status(pending ? 'pending' : 'saved');
    } catch (error) {
      pending ||= snapshot;
      failures++;
      if (!disposed) status('error', error);
      if (failures <= 2 && !disposed) schedule(1500);
      else { clearTimeout(timer); timer = null; settle(error); }
    } finally {
      running = false;
      if (!disposed && pending && !timer && failures <= 2) schedule();
      if (!pending && !running) settle();
    }
  }
  return {
    enqueue(snapshot) { pending = snapshot; failures = 0; status('pending'); schedule(); },
    wait() {
      if (!pending && !running) return Promise.resolve();
      if (pending && !timer && !running) { failures = 0; schedule(); }
      return new Promise((resolve, reject) => waiters.push({ resolve, reject }));
    },
    dispose() { disposed = true; clearTimeout(timer); },
  };
}
