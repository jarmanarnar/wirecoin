import EmblaCarousel from '../../vendor/embla-carousel/embla-carousel.esm.js';

export function createCarousel({ slideCount = 4, rotationDuration = 6000 } = {}) {
  if (!Number.isInteger(slideCount) || slideCount < 1) throw new Error('slideCount must be a positive integer.');
  if (!(rotationDuration > 0)) throw new Error('rotationDuration must be positive.');
  const root = document.createElement('section');
  root.className = 'banner-carousel';
  root.setAttribute('aria-label', 'Featured banners');
  root.setAttribute('aria-roledescription', 'carousel');
  root.innerHTML = '<div class="banner-carousel__viewport" tabindex="0" role="group" aria-label="Banners"><div class="banner-carousel__track"></div></div><div class="banner-carousel__indicators" role="group" aria-label="Choose a banner" hidden></div><p class="banner-carousel__status" role="status"></p>';
  const track = root.querySelector('.banner-carousel__track');
  for (let index = 0; index < slideCount; index++) {
    const slide = document.createElement('div');
    slide.className = 'banner-carousel__slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', (index + 1) + ' of ' + slideCount);
    const panel = document.createElement('div');
    panel.className = 'banner-carousel__panel';
    slide.append(panel);
    track.append(slide);
  }
  const viewport = root.querySelector('.banner-carousel__viewport');
  const indicators = root.querySelector('.banner-carousel__indicators');
  const status = root.querySelector('.banner-carousel__status');
  const controller = new AbortController();
  const on = (element, type, listener) => element.addEventListener(type, listener, { signal: controller.signal });
  let carousel, progress, observer;
  let paused = false;
  let destroyed = false;
  let refreshPlayback = () => {};
  function mount() {
    if (destroyed || carousel) return;
    if (!root.isConnected) throw new Error('Append the carousel before calling mount().');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    root.dataset.ready = 'true';
    carousel = EmblaCarousel(viewport, {
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      containScroll: false,
      breakpoints: { '(prefers-reduced-motion: reduce)': { duration: 0 } },
    });
    
    let activeIndex = -1;
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
    
      on(button, 'click', () => {
        carousel.scrollTo(index, reducedMotion.matches);
        announceSelection();
      });
    
      return { button, fill };
    });
    
    function canRotate() {
      return !destroyed && !reducedMotion.matches && visible && !document.hidden && !paused
        && !hovered && !dragging && !root.contains(document.activeElement);
    }
    
    function syncPlayback() {
      if (destroyed) return;
      if (canRotate()) progress?.play();
      else progress?.pause();
    }
    
    function resetProgress() {
      progress?.cancel();
      progress = undefined;
      if (destroyed || reducedMotion.matches || controls.length < 2) return;
    
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
    
    on(viewport, 'keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowRight') carousel.scrollNext(reducedMotion.matches);
      else if (event.key === 'ArrowLeft') carousel.scrollPrev(reducedMotion.matches);
      else return;
    
      event.preventDefault();
      announceSelection();
    });
    
    on(root, 'pointerenter', event => {
      if (event.pointerType === 'touch') return;
      hovered = true;
      syncPlayback();
    });
    on(root, 'pointerleave', () => {
      hovered = false;
      syncPlayback();
    });
    on(root, 'focusin', syncPlayback);
    on(root, 'focusout', () => queueMicrotask(syncPlayback));
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
    
    on(reducedMotion, 'change', resetProgress);
    on(document, 'visibilitychange', syncPlayback);
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        syncPlayback();
      });
      observer.observe(root);
    }
    
    updateSelection();
    indicators.hidden = false;
    refreshPlayback = syncPlayback;
    
  }
  return {
    element: root, mount,
    setPaused(value) { paused = Boolean(value); refreshPlayback(); },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      progress?.cancel();
      observer?.disconnect();
      controller.abort();
      carousel?.destroy();
      root.remove();
    },
  };
}
