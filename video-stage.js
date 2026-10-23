import { waitForPlaybackEnd } from './media-events.js';
import { productById, transitionSource } from './products.js';

function waitForMedia(video, eventName, signal, timeout = 8000) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
    if (eventName === 'loadeddata' && video.readyState >= 2) return resolve();
    if (eventName === 'ended' && video.ended) return resolve();
    const done = () => { cleanup(); resolve(); };
    const fail = () => { cleanup(); reject(new Error('Video could not be played')); };
    const abort = () => { cleanup(); reject(new DOMException('Aborted', 'AbortError')); };
    const timer = timeout ? setTimeout(fail, timeout) : null;
    function cleanup() {
      clearTimeout(timer);
      video.removeEventListener(eventName, done);
      video.removeEventListener('error', fail);
      signal?.removeEventListener('abort', abort);
    }
    video.addEventListener(eventName, done, { once: true });
    video.addEventListener('error', fail, { once: true });
    signal?.addEventListener('abort', abort, { once: true });
  });
}

function firstFrame(video, signal) {
  if (!video.requestVideoFrameCallback) return Promise.resolve();
  return new Promise((resolve, reject) => {
    let frame;
    const finish = () => { cleanup(); resolve(); };
    const abort = () => { cleanup(); reject(new DOMException('Aborted', 'AbortError')); };
    const timer = setTimeout(finish, 1500);
    function cleanup() {
      clearTimeout(timer);
      if (frame !== undefined) video.cancelVideoFrameCallback(frame);
      signal?.removeEventListener('abort', abort);
    }
    frame = video.requestVideoFrameCallback(finish);
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
  });
}

/** Two real video layers: keep the previous image until the next frame is decoded. */
export class VideoStage {
  constructor(element, { reduced = false, onFallback = () => {} } = {}) {
    this.element = element;
    this.videos = [...element.querySelectorAll('video')];
    this.poster = element.querySelector('.scene-poster');
    this.active = -1;
    this.target = 'hoodie';
    this.paused = false;
    this.reduced = reduced;
    this.visible = true;
    this.modeVersion = 0;
    this.fadeTimers = [];
    this.onFallback = onFallback;
  }
  get still() { return this.paused || this.reduced; }
  showPoster(id) {
    this.poster.src = productById[id].poster;
    this.element.dataset.frame = 'poster';
    this.element.dataset.product = id;
    this.videos.forEach(video => { video.pause(); video.classList.remove('is-visible', 'is-outgoing'); });
    this.active = -1;
  }
  async showVideo(src, loop, signal) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    const index = this.active === 0 ? 1 : 0;
    const video = this.videos[index];
    clearTimeout(this.fadeTimers[index]);
    video.pause();
    video.classList.remove('is-visible', 'is-outgoing');
    video.loop = loop;
    video.muted = true;
    video.src = src;
    video.load();
    await waitForMedia(video, 'loadeddata', signal);
    await Promise.race([video.play(), waitForMedia(video, 'playing', signal)]);
    await firstFrame(video, signal);
    if (signal.aborted) { video.pause(); throw new DOMException('Aborted', 'AbortError'); }
    this.videos.forEach((layer, i) => {
      if (i === index) {
        layer.classList.remove('is-outgoing');
        layer.classList.add('is-visible');
      } else {
        layer.classList.remove('is-visible');
        layer.classList.add('is-outgoing');
        layer.pause();
        clearTimeout(this.fadeTimers[i]);
        this.fadeTimers[i] = setTimeout(() => layer.classList.remove('is-outgoing'), 180);
      }
    });
    this.active = index;
    this.element.dataset.frame = loop ? 'idle' : 'transition';
    if (this.still || !this.visible || document.hidden) video.pause();
    return video;
  }
  async start(id) {
    this.target = id;
    this.operation = new AbortController();
    this.ready = (async () => {
      if (this.still) { this.showPoster(id); return; }
      try {
        await this.showVideo(productById[id].idle, true, this.operation.signal);
        this.element.dataset.product = id;
      } catch (error) {
        this.showPoster(id);
        if (error.name !== 'AbortError') this.onFallback();
      }
    })();
    return this.ready;
  }
  async transition(from, to) {
    await this.ready;
    this.target = to;
    this.modeVersion++;
    this.operation?.abort();
    const operation = new AbortController();
    this.operation = operation;
    if (this.still) { this.showPoster(to); return; }
    try {
      const video = await this.showVideo(transitionSource(from, to), false, operation.signal);
      await waitForPlaybackEnd(video, { signal: operation.signal, canAdvance: () => this.visible && !document.hidden && !this.still });
      if (this.still) { this.showPoster(to); return; }
      await this.showVideo(productById[to].idle, true, operation.signal);
      this.element.dataset.product = to;
      this.onFallback(false);
    } catch (error) {
      this.showPoster(to);
      if (error.name !== 'AbortError') this.onFallback();
    }
  }
  setPaused(value) {
    this.paused = value;
    this.updateMode();
  }
  setReduced(value) {
    this.reduced = value;
    this.updateMode();
  }
  updateMode() {
    const version = ++this.modeVersion;
    if (this.still) {
      this.operation?.abort();
      this.showPoster(this.target);
    } else {
      // A new idle operation is safe only after any interrupted transition settles.
      const restart = async () => {
        await this.ready;
        if (this.still || version !== this.modeVersion) return;
        this.operation?.abort();
        this.operation = new AbortController();
        try {
          await this.showVideo(productById[this.target].idle, true, this.operation.signal);
          this.onFallback(false);
        }
        catch (error) { this.showPoster(this.target); if (error.name !== 'AbortError') this.onFallback(); }
      };
      void restart();
    }
  }
  setVisible(value) {
    this.visible = value;
    this.syncPlayback();
  }
  syncPlayback() {
    const video = this.videos[this.active];
    if (!video) return;
    if (this.still || !this.visible || document.hidden) video.pause();
    else video.play().catch(() => { this.showPoster(this.target); this.onFallback(); });
  }
}


