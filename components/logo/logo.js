export function createLogo({ href = './' } = {}) {
  const logo = document.createElement('a');
  logo.className = 'brand';
  logo.href = href;
  logo.setAttribute('aria-label', 'WireFrame Casino home');
  logo.innerHTML = '<span class="brand__full" aria-hidden="true">WireFrame<span class="brand__accent">Casino</span></span><span class="brand__short" aria-hidden="true">W<span class="brand__accent">C</span></span>';
  return logo;
}
