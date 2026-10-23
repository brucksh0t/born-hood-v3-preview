/** Require fresh pointer movement after a swap moves the hit areas. */
export function createHoverIntent({onSelect, delay = 200, distance = 12}) {
  let point = null;
  let anchor = null;
  let candidate = null;
  let timer;
  function cancel() { clearTimeout(timer); candidate = null; }
  function track(x,y) {
    point = {x,y};
    if (anchor && Math.hypot(x-anchor.x,y-anchor.y) >= distance) anchor = null;
  }
  return {
    track,
    lock() { anchor = point ? {...point} : null; cancel(); },
    enter(id,x,y) {
      track(x,y);
      if (anchor || candidate === id) return;
      cancel();
      candidate = id;
      timer = setTimeout(() => { candidate = null; onSelect(id); }, delay);
    },
    leave(id) { if (candidate === id) cancel(); },
    cancel,
  };
}
