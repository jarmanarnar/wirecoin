export function createLogo({ href = './' } = {}) {
  const logo = document.createElement('a');
  logo.className = 'brand';
  logo.href = href;
  logo.setAttribute('aria-label', 'WireCoin home');
  logo.innerHTML = '<span class="brand__full" aria-hidden="true">Wire<span class="brand__accent">Coin</span></span><span class="brand__short" aria-hidden="true">W<span class="brand__accent">C</span></span>';
  return logo;
}
