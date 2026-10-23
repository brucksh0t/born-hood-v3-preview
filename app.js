import {catalog,productCard} from './catalog.js';
import {readMotionPaused,saveMotionPaused} from './motion-preference.js';
import { products, productById, sceneLayout } from './products.js';
import { createStageController } from './stage-state.js';
import { VideoStage } from './video-stage.js';
import { createHoverIntent } from './hover-intent.js';

document.documentElement.classList.add('js');
const $ = selector => document.querySelector(selector);
const hero = $('.hero');
const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const hoverCapable = matchMedia('(hover: hover) and (pointer: fine)');
let paused = readMotionPaused();
let fallback = false;
const hoverIntent = createHoverIntent({ onSelect: id => select(id) });
document.addEventListener('pointermove', event => hoverIntent.track(event.clientX, event.clientY), { passive: true });

$('.product-selector').innerHTML = products.map(p => `<button class="product-button" type="button" data-select="${p.id}" aria-pressed="${p.id === 'hoodie'}"><span class="product-index">${p.number}</span><span>${p.short}</span></button>`).join('');
$('.product-hotspots').innerHTML = products.map(p => `<button class="product-hotspot" type="button" data-select="${p.id}" aria-label="Bring ${p.name.toLowerCase()} to the front" aria-pressed="${p.id === 'hoodie'}"><span class="hotspot-marker" aria-hidden="true">+</span></button>`).join('');
$('.collection-pieces').innerHTML = ['signature-premium-hoodie','signature-crown-tee','signature-snapback','street-212','samurai-46','crown-227'].map(id=>catalog.find(p=>p.id===id)).filter(Boolean).map(productCard).join('');

function updateMotionControl() {
  const button = $('.motion-toggle');
  const still = paused || reduced.matches || fallback;
  button.setAttribute('aria-pressed', String(still));
  button.disabled = reduced.matches;
  const label = reduced.matches ? 'Reduced motion' : fallback ? 'Retry motion' : paused ? 'Play motion' : 'Pause motion';
  button.setAttribute('aria-label', label);
  button.querySelector('span').textContent = label;
}
const stage = new VideoStage($('.scene'), {
  reduced: reduced.matches,
  onFallback(failed = true) {
    fallback = failed;
    $('.media-status').textContent = failed ? 'Still view · motion unavailable' : '';
    updateMotionControl();
  },
});

function showProduct(id, announce = true) {
  const product = productById[id];
  $('#active-number').textContent = product.number;
  $('#active-role').textContent = product.role;
  $('#active-name').textContent = product.name;
  $('#active-tagline').textContent = product.tagline;
  $('#active-description').textContent = product.description;
  $('#explore-piece').href = product.shopHref;
  $('#explore-piece').childNodes[0].textContent = product.shopLabel+' ';
  $('.scene-poster').alt = `${product.name} in front, with the other two Born Hood pieces behind it on a red-lit subway platform`;

  for (const button of document.querySelectorAll('.product-hotspot')) {
    const [left, top, width, height] = sceneLayout[id][button.dataset.select];
    Object.assign(button.style, { left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` });
  }
  if (announce) $('#selection-status').textContent = `${product.name}. ${product.tagline}`;
}
const controller = createStageController({
  initial: 'hoodie', ids: products.map(p => p.id),
  transition: (from, to) => stage.transition(from, to),
  onRequested(id) {
    document.querySelectorAll('[data-select]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.select === id)));
  },
  onSettled: showProduct,
  onBusy(busy) { hero.classList.toggle('is-transitioning', busy); hero.dataset.busy = String(busy); },
  onError(_error, id) { stage.showPoster(id); },
});
showProduct('hoodie', false);
stage.setPaused(paused); void stage.start('hoodie');

function select(id) { hoverIntent.lock(); controller.select(id); }
for (const button of document.querySelectorAll('[data-select]')) {
  button.addEventListener('click', () => select(button.dataset.select));
  const considerHover = event => {
    if (!hoverCapable.matches || event.pointerType !== 'mouse') return;
    hoverIntent.enter(button.dataset.select, event.clientX, event.clientY);
  };
  button.addEventListener('pointerenter', considerHover);
  button.addEventListener('pointermove', considerHover);
  button.addEventListener('pointerleave', () => hoverIntent.leave(button.dataset.select));
}
const selectors = [...document.querySelectorAll('.product-button')];
selectors.forEach((button, index) => button.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  let next;
  if (event.key === 'ArrowRight') next = (index + 1) % products.length;
  if (event.key === 'ArrowLeft') next = (index - 1 + products.length) % products.length;
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = products.length - 1;
  if (next === undefined) return;
  event.preventDefault();
  selectors[next].focus({ preventScroll: true });
  select(products[next].id);
}));
for (const button of document.querySelectorAll('[data-stage]')) {
  button.addEventListener('click', event => {
    event.preventDefault();
    stage.setVisible(true);
    select(button.dataset.stage);
    window.dispatchEvent(new Event('showdrop'));
    selectors[products.findIndex(p => p.id === button.dataset.stage)].focus({ preventScroll: true });
  });
}

$('.motion-toggle').addEventListener('click', () => {
  if (fallback) { fallback = false; paused = false; $('.media-status').textContent = ''; }
  else paused = !paused;
  saveMotionPaused(paused); stage.setPaused(paused); window.dispatchEvent(new CustomEvent('bornhood-motion',{detail:{paused}}));
  updateMotionControl();
});
reduced.addEventListener('change', () => { stage.setReduced(reduced.matches); updateMotionControl(); });
updateMotionControl();
document.addEventListener('visibilitychange', () => stage.syncPlayback());

const visibility = new IntersectionObserver(entries => {
  for (const entry of entries) stage.setVisible(entry.isIntersecting && document.body.dataset.dropActive !== 'false');
}, { threshold: 0.05 });
visibility.observe(hero);
const reveal = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); reveal.unobserve(entry.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(element => reveal.observe(element));



window.addEventListener('dropvisibility',event=>stage.setVisible(event.detail));




