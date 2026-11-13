import { createButton } from '../button/button.js';
import { authTemplate } from './auth-template.js';

export function createAuthDialog({ onOpenChange = () => {} } = {}) {
  const template = document.createElement('template');
  template.innerHTML = authTemplate;
  const dialog = template.content.firstElementChild;
  const controller = new AbortController();
  const on = (element, type, listener) => element.addEventListener(type, listener, { signal: controller.signal });
  let destroyed = false;
  let opened = false;
  const replaceButton = (slot, options) => dialog.querySelector('[data-button-slot="' + slot + '"]').replaceWith(createButton(options));
  replaceButton('submit', { label: 'Sign Up', type: 'submit', className: 'auth-submit', attributes: { id: 'auth-submit' } });
  replaceButton('recovery', { label: 'Send reset link', type: 'submit', className: 'auth-submit' });
  for (const [provider, glyph] of [['Facebook', 'f'], ['Google', 'G']]) {
    const button = createButton({ variant: 'secondary', className: 'auth-social', attributes: {
      'aria-label': 'Continue with ' + provider, 'data-social': provider,
    } });
    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    if (provider === 'Facebook') icon.className = 'auth-facebook';
    icon.textContent = glyph;
    button.append(icon);
    dialog.querySelector('[data-button-slot="' + provider + '"]').replaceWith(button);
  }
  const form = dialog.querySelector('#auth-form');
  const recovery = dialog.querySelector('#auth-recovery');
  const identity = dialog.querySelector('#auth-identity');
  const password = dialog.querySelector('#auth-password');
  const confirmation = dialog.querySelector('#auth-confirm');
  const terms = dialog.querySelector('#auth-terms');
  const feedback = dialog.querySelector('#auth-feedback');
  const hint = dialog.querySelector('#auth-field-hint');
  const tabs = [...dialog.querySelectorAll('[data-auth-tab]')];
  const eyeButtons = [...dialog.querySelectorAll('[data-password-for]')];
  let mode = 'signup';
  let opener = null;
  let previousOverflow = '';
  let pointerStartedOutside = false;
  
  function resetPasswordVisibility() {
    for (const button of eyeButtons) {
      const input = dialog.querySelector('#' + button.dataset.passwordFor);
      input.type = 'password';
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', input === confirmation ? 'Show password confirmation' : 'Show password');
    }
  }
  
  function validateConfirmation() {
    const mismatch = mode === 'signup' && confirmation.value && confirmation.value !== password.value;
    confirmation.setCustomValidity(mismatch ? 'Passwords do not match.' : '');
    hint.textContent = mismatch ? 'Passwords do not match.' : '';
  }
  
  function selectMode(next) {
    mode = next;
    const signup = mode === 'signup';
    form.hidden = false;
    recovery.hidden = true;
    dialog.querySelector('#auth-social-area').hidden = false;
    dialog.querySelector('#auth-registration').hidden = !signup;
    dialog.querySelector('#auth-login-options').hidden = signup;
    confirmation.disabled = !signup;
    terms.disabled = !signup;
    identity.type = signup ? 'email' : 'text';
    identity.placeholder = signup ? 'Email' : 'Username or email';
    dialog.querySelector('#auth-identity-label').textContent = identity.placeholder;
    password.autocomplete = signup ? 'new-password' : 'current-password';
    password.minLength = signup ? 8 : 1;
    password.value = '';
    confirmation.value = '';
    dialog.querySelector('#auth-submit').textContent = signup ? 'Sign Up' : 'Sign In';
    dialog.setAttribute('aria-label', signup ? 'Sign Up' : 'Sign In');
    dialog.querySelector('#auth-panel').setAttribute('aria-labelledby', `auth-tab-${mode}`);
    for (const tab of tabs) {
      const selected = tab.dataset.authTab === mode;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }
    resetPasswordVisibility();
    validateConfirmation();
    feedback.textContent = '';
  }
  
  function open(next = 'signup', trigger = null) {
    if (destroyed) return;
    selectMode(next === 'signin' ? 'signin' : 'signup');
    if (!dialog.open) {
      opener = trigger || document.activeElement;
      previousOverflow = document.body.style.overflow;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      opened = true;
      onOpenChange(true);
    }
    tabs.find(tab => tab.dataset.authTab === mode).focus({ preventScroll: true });
  }
  
  for (const tab of tabs) {
    on(tab, 'click', () => selectMode(tab.dataset.authTab));
    on(tab, 'keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 'signin' : event.key === 'End' ? 'signup' : mode === 'signup' ? 'signin' : 'signup';
      selectMode(next);
      tabs.find(item => item.dataset.authTab === next).focus();
    });
  }
  
  on(dialog.querySelector('.auth-close'), 'click', () => close());
  function finishClose() {
    if (!opened || dialog.open) return;
    opened = false;
    document.body.style.overflow = previousOverflow;
    form.reset();
    recovery.reset();
    resetPasswordVisibility();
    confirmation.setCustomValidity('');
    hint.textContent = '';
    feedback.textContent = '';
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
    onOpenChange(false);
  }
  function close() {
    if (dialog.open) dialog.close();
    finishClose();
  }
  on(dialog, 'close', finishClose);
  
  function outsideDialog(event) {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  }
  on(dialog, 'pointerdown', event => { pointerStartedOutside = event.target === dialog && outsideDialog(event); });
  on(dialog, 'click', event => {
    if (pointerStartedOutside && event.target === dialog && outsideDialog(event)) close();
    pointerStartedOutside = false;
  });
  
  for (const button of eyeButtons) {
    on(button, 'click', () => {
      const input = dialog.querySelector('#' + button.dataset.passwordFor);
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      button.setAttribute('aria-pressed', String(show));
      button.setAttribute('aria-label', `${show ? 'Hide' : 'Show'} password${input === confirmation ? ' confirmation' : ''}`);
    });
  }
  on(password, 'input', validateConfirmation);
  on(confirmation, 'input', validateConfirmation);
  on(form, 'input', () => { feedback.textContent = ''; });
  on(form, 'submit', event => {
    event.preventDefault();
    validateConfirmation();
    if (!form.reportValidity()) return;
    feedback.textContent = mode === 'signup' ? 'Sign-up preview complete. No account was created.' : 'Sign-in preview complete. No account was accessed.';
    password.value = '';
    confirmation.value = '';
    resetPasswordVisibility();
  });
  
  on(dialog.querySelector('#auth-forgot'), 'click', () => {
    form.hidden = true;
    recovery.hidden = false;
    dialog.querySelector('#auth-social-area').hidden = true;
    feedback.textContent = '';
    dialog.setAttribute('aria-label', 'Reset password');
    const recoveryEmail = dialog.querySelector('#auth-recovery-email');
    recoveryEmail.value = identity.value.includes('@') ? identity.value : '';
    recoveryEmail.focus({ preventScroll: true });
  });
  on(dialog.querySelector('#auth-back'), 'click', () => {
    selectMode('signin');
    dialog.querySelector('#auth-forgot').focus();
  });
  on(recovery, 'submit', event => {
    event.preventDefault();
    if (recovery.reportValidity()) feedback.textContent = 'Reset preview complete. No email was sent.';
  });
  for (const button of dialog.querySelectorAll('[data-social]')) {
    on(button, 'click', () => {
      feedback.textContent = `${button.dataset.social} sign-in is a placeholder in this wireframe.`;
    });
  }
  
  return {
    element: dialog, open, close,
    get isOpen() { return dialog.open; },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      close();
      controller.abort();
      dialog.remove();
    },
  };
}
