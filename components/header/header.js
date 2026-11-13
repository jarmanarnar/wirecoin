// The header owns layout only. Its contents are supplied by the app.
export function createHeader({ logo = null, actions = [] } = {}) {
  const element = document.createElement('header');
  element.className = 'top-bar';
  element.setAttribute('aria-label', 'Top bar');
  if (logo) element.append(logo);
  element.append(...actions);
  return { element, destroy() { element.remove(); } };
}
