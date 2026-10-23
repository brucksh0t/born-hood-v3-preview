/** Serialize cinematic transitions; coalesce rapid input to the latest intent. */
export function createStageController({ initial, ids, transition, onRequested = () => {}, onSettled = () => {}, onBusy = () => {}, onError = () => {} }) {
  let current = initial;
  let desired = initial;
  let busy = false;
  async function drain() {
    busy = true;
    onBusy(true);
    try {
      while (current !== desired) {
        const target = desired;
        try { await transition(current, target); }
        catch (error) { onError(error, target); }
        current = target;
        if (current === desired) onSettled(current);
      }
    } finally {
      busy = false;
      onBusy(false);
    }
  }
  return {
    get current() { return current; },
    get desired() { return desired; },
    get busy() { return busy; },
    select(id) {
      if (!ids.includes(id)) return;
      desired = id;
      onRequested(id);
      if (!busy && desired !== current) void drain();
    },
  };
}
