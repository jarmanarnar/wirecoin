import EmblaCarousel from './vendor/embla-carousel/embla-carousel.esm.js';

const root = document.querySelector('.banner-carousel');
const viewport = root.querySelector('.banner-carousel__viewport');
const indicators = root.querySelector('.banner-carousel__indicators');
const status = root.querySelector('.banner-carousel__status');
const dialog = document.querySelector('#auth-dialog');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const rotationDuration = 6000;

root.dataset.ready = 'true';
const carousel = EmblaCarousel(viewport, {
  loop: true,
  align: 'start',
  slidesToScroll: 1,
  containScroll: false,
  breakpoints: { '(prefers-reduced-motion: reduce)': { duration: 0 } },
});

let activeIndex = -1;
let progress;
let hovered = false;
let dragging = false;
let visible = !('IntersectionObserver' in window);

const controls = carousel.slideNodes().map((slide, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'banner-carousel__indicator';
  button.setAttribute('aria-label', `Show banner ${index + 1}`);

  const mark = document.createElement('span');
  mark.className = 'banner-carousel__mark';
  mark.setAttribute('aria-hidden', 'true');
  const fill = document.createElement('span');
  fill.className = 'banner-carousel__fill';
  mark.append(fill);
  button.append(mark);
  indicators.append(button);

  button.addEventListener('click', () => {
    carousel.scrollTo(index, reducedMotion.matches);
    announceSelection();
  });

  return { button, fill };
});

function canRotate() {
  return !reducedMotion.matches && visible && !document.hidden && !dialog.open
    && !hovered && !dragging && !root.contains(document.activeElement);
}

function syncPlayback() {
  if (canRotate()) progress?.play();
  else progress?.pause();
}

function resetProgress() {
  progress?.cancel();
  progress = undefined;
  if (reducedMotion.matches) return;

  progress = controls[activeIndex].fill.animate([
    { transform: 'scaleX(0)' },
    { transform: 'scaleX(1)' },
  ], { duration: rotationDuration, fill: 'forwards' });
  progress.onfinish = () => {
    if (canRotate()) carousel.scrollNext();
  };
  syncPlayback();
}

function updateSelection() {
  const index = carousel.selectedScrollSnap();
  if (index === activeIndex) return;

  activeIndex = index;
  controls.forEach(({ button }, position) => {
    button.setAttribute('aria-pressed', String(position === index));
  });
  resetProgress();
  if (dragging) announceSelection();
}

function announceSelection() {
  status.textContent = `Banner ${activeIndex + 1} of ${controls.length}`;
}

viewport.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === 'ArrowRight') carousel.scrollNext(reducedMotion.matches);
  else if (event.key === 'ArrowLeft') carousel.scrollPrev(reducedMotion.matches);
  else return;

  event.preventDefault();
  announceSelection();
});

root.addEventListener('pointerenter', event => {
  if (event.pointerType === 'touch') return;
  hovered = true;
  syncPlayback();
});
root.addEventListener('pointerleave', () => {
  hovered = false;
  syncPlayback();
});
root.addEventListener('focusin', syncPlayback);
root.addEventListener('focusout', () => queueMicrotask(syncPlayback));
carousel.on('select', updateSelection);
carousel.on('reInit', updateSelection);
carousel.on('pointerDown', () => {
  dragging = true;
  syncPlayback();
});
carousel.on('pointerUp', () => {
  dragging = false;
  syncPlayback();
});

reducedMotion.addEventListener('change', resetProgress);
document.addEventListener('visibilitychange', syncPlayback);
new MutationObserver(syncPlayback).observe(dialog, { attributes: true, attributeFilter: ['open'] });
if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncPlayback();
  }).observe(root);
}

updateSelection();
indicators.hidden = false;
