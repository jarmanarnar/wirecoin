import { createButton } from '../button/button.js';

// No dialog lookup: the caller decides what these actions do.
export function createAuthActions({ onRequestAuth, dialogId = 'auth-dialog' }) {
  const controller = new AbortController();
  const elements = [['signin', 'Sign In', 'secondary'], ['signup', 'Join Now', 'primary']]
    .map(([mode, label, variant]) => {
      const button = createButton({
        label, variant,
        attributes: { 'data-auth-open': mode, 'aria-haspopup': 'dialog', 'aria-controls': dialogId },
      });
      button.addEventListener('click', event => onRequestAuth(mode, event.currentTarget), { signal: controller.signal });
      return button;
    });
  return { elements, destroy() { controller.abort(); elements.forEach(element => element.remove()); } };
}
