const dialog = document.querySelector('#auth-dialog');
const form = document.querySelector('#auth-form');
const recovery = document.querySelector('#auth-recovery');
const identity = document.querySelector('#auth-identity');
const password = document.querySelector('#auth-password');
const confirmation = document.querySelector('#auth-confirm');
const terms = document.querySelector('#auth-terms');
const feedback = document.querySelector('#auth-feedback');
const hint = document.querySelector('#auth-field-hint');
const tabs = [...document.querySelectorAll('[data-auth-tab]')];
const eyeButtons = [...document.querySelectorAll('[data-password-for]')];
let mode = 'signup';
let opener = null;
let previousOverflow = '';
let pointerStartedOutside = false;

function resetPasswordVisibility() {
  for (const button of eyeButtons) {
    const input = document.getElementById(button.dataset.passwordFor);
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
  document.querySelector('#auth-social-area').hidden = false;
  document.querySelector('#auth-registration').hidden = !signup;
  document.querySelector('#auth-login-options').hidden = signup;
  confirmation.disabled = !signup;
  terms.disabled = !signup;
  identity.type = signup ? 'email' : 'text';
  identity.placeholder = signup ? 'Email' : 'Username or email';
  document.querySelector('#auth-identity-label').textContent = identity.placeholder;
  password.autocomplete = signup ? 'new-password' : 'current-password';
  password.minLength = signup ? 8 : 1;
  password.value = '';
  confirmation.value = '';
  document.querySelector('#auth-submit').textContent = signup ? 'Sign Up' : 'Sign In';
  dialog.setAttribute('aria-label', signup ? 'Sign Up' : 'Sign In');
  document.querySelector('#auth-panel').setAttribute('aria-labelledby', `auth-tab-${mode}`);
  for (const tab of tabs) {
    const selected = tab.dataset.authTab === mode;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
  resetPasswordVisibility();
  validateConfirmation();
  feedback.textContent = '';
}

for (const trigger of document.querySelectorAll('[data-auth-open]')) {
  trigger.addEventListener('click', () => {
    opener = trigger;
    selectMode(trigger.dataset.authOpen);
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    tabs.find(tab => tab.dataset.authTab === mode).focus({ preventScroll: true });
  });
}

for (const tab of tabs) {
  tab.addEventListener('click', () => selectMode(tab.dataset.authTab));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 'signin' : event.key === 'End' ? 'signup' : mode === 'signup' ? 'signin' : 'signup';
    selectMode(next);
    tabs.find(item => item.dataset.authTab === next).focus();
  });
}

document.querySelector('.auth-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
  document.body.style.overflow = previousOverflow;
  form.reset();
  recovery.reset();
  resetPasswordVisibility();
  confirmation.setCustomValidity('');
  hint.textContent = '';
  feedback.textContent = '';
  opener?.focus({ preventScroll: true });
});

function outsideDialog(event) {
  const rect = dialog.getBoundingClientRect();
  return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
}
dialog.addEventListener('pointerdown', event => { pointerStartedOutside = event.target === dialog && outsideDialog(event); });
dialog.addEventListener('click', event => {
  if (pointerStartedOutside && event.target === dialog && outsideDialog(event)) dialog.close();
  pointerStartedOutside = false;
});

for (const button of eyeButtons) {
  button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.passwordFor);
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    button.setAttribute('aria-pressed', String(show));
    button.setAttribute('aria-label', `${show ? 'Hide' : 'Show'} password${input === confirmation ? ' confirmation' : ''}`);
  });
}
password.addEventListener('input', validateConfirmation);
confirmation.addEventListener('input', validateConfirmation);
form.addEventListener('input', () => { feedback.textContent = ''; });
form.addEventListener('submit', event => {
  event.preventDefault();
  validateConfirmation();
  if (!form.reportValidity()) return;
  feedback.textContent = mode === 'signup' ? 'Sign-up preview complete. No account was created.' : 'Sign-in preview complete. No account was accessed.';
  password.value = '';
  confirmation.value = '';
  resetPasswordVisibility();
});

document.querySelector('#auth-forgot').addEventListener('click', () => {
  form.hidden = true;
  recovery.hidden = false;
  document.querySelector('#auth-social-area').hidden = true;
  feedback.textContent = '';
  dialog.setAttribute('aria-label', 'Reset password');
  const recoveryEmail = document.querySelector('#auth-recovery-email');
  recoveryEmail.value = identity.value.includes('@') ? identity.value : '';
  recoveryEmail.focus({ preventScroll: true });
});
document.querySelector('#auth-back').addEventListener('click', () => {
  selectMode('signin');
  document.querySelector('#auth-forgot').focus();
});
recovery.addEventListener('submit', event => {
  event.preventDefault();
  if (recovery.reportValidity()) feedback.textContent = 'Reset preview complete. No email was sent.';
});
for (const button of document.querySelectorAll('[data-social]')) {
  button.addEventListener('click', () => {
    feedback.textContent = `${button.dataset.social} sign-in is a placeholder in this wireframe.`;
  });
}
