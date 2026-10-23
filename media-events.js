/** Wait for real progress, excluding deliberate hidden/offscreen pauses. */
export function waitForPlaybackEnd(video, {signal, canAdvance = () => true, stallMs = 5000, pollMs = 250} = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
    if (video.ended) return resolve();
    let time = video.currentTime;
    let lastProgress = Date.now();
    const finish = () => { cleanup(); resolve(); };
    const fail = () => { cleanup(); reject(new Error('Video playback stalled or failed')); };
    const abort = () => { cleanup(); reject(new DOMException('Aborted', 'AbortError')); };
    const timer = setInterval(() => {
      const now = Date.now();
      if (!canAdvance() || video.currentTime !== time) lastProgress = now;
      time = video.currentTime;
      if (now - lastProgress >= stallMs) fail();
    }, pollMs);
    function cleanup() {
      clearInterval(timer);
      video.removeEventListener('ended', finish);
      video.removeEventListener('error', fail);
      signal?.removeEventListener('abort', abort);
    }
    video.addEventListener('ended', finish, {once:true});
    video.addEventListener('error', fail, {once:true});
    signal?.addEventListener('abort', abort, {once:true});
  });
}
