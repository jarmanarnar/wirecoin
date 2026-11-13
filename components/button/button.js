export function createButton({
  label = '', variant = 'primary', type = 'button',
  className = '', attributes = {}, disabled = false, onClick,
} = {}) {
  if (!['primary', 'secondary'].includes(variant)) throw new Error('Unknown button variant: ' + variant);
  const button = document.createElement('button');
  button.type = type;
  button.className = ['button', 'button--' + variant, className].filter(Boolean).join(' ');
  button.textContent = label;
  button.disabled = disabled;
  for (const [name, value] of Object.entries(attributes)) button.setAttribute(name, String(value));
  if (onClick) button.addEventListener('click', onClick);
  return button;
}
