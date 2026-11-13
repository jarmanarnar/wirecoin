import { mountApp } from '../app.js';
import { createButton } from '../components/button/button.js';
import { createLogo } from '../components/logo/logo.js';
import { createHeader } from '../components/header/header.js';
import { createAuthDialog } from '../components/auth/auth.js';
import { createCarousel } from '../components/carousel/carousel.js';

const fixture = document.querySelector('#fixture');
const results = document.querySelector('#results');
const status = document.querySelector('#status');
let passed = 0, failed = 0, currentApp;
const errors = [];
window.addEventListener('error', event => errors.push(event.message));
window.addEventListener('unhandledrejection', event => errors.push(String(event.reason)));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const tick = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function test(name, run) {
  const row = document.createElement('li');
  try {
    await run();
    passed++;
    row.dataset.result = 'pass';
    row.textContent = 'PASS — ' + name;
  } catch (error) {
    failed++;
    row.dataset.result = 'fail';
    row.textContent = 'FAIL — ' + name + ': ' + error.message;
  } finally {
    currentApp?.destroy();
    currentApp = null;
    fixture.replaceChildren();
  }
  results.append(row);
}

const names = ['header', 'logo', 'auth', 'authButtons', 'carousel'];
for (let mask = 0; mask < 32; mask++) {
  const features = Object.fromEntries(names.map((name, index) => [name, Boolean(mask & (1 << index))]));
  await test('Feature combination ' + mask + ': ' + names.filter(name => features[name]).join(', '), async () => {
    currentApp = await mountApp(fixture, { features });
    const count = selector => fixture.querySelectorAll(selector).length;
    assert(count('.top-bar') === Number(features.header), 'Header visibility');
    assert(count('.brand') === Number(features.header && features.logo), 'Logo visibility');
    assert(count('.auth-dialog') === Number(features.auth), 'Auth visibility');
    assert(count('[data-auth-open]') === (features.header && features.auth && features.authButtons ? 2 : 0), 'No orphan auth buttons');
    assert(count('.banner-carousel') === Number(features.carousel), 'Carousel visibility');
    assert(getComputedStyle(fixture.querySelector('main')).top === (features.header ? '72px' : '0px'), 'No leftover header gap');
    if (features.auth) {
      const trigger = fixture.querySelector('[data-auth-open="signin"]');
      if (trigger) trigger.click();
      else currentApp.auth.open('signin');
      assert(currentApp.auth.isOpen && currentApp.auth.element.getAttribute('aria-label') === 'Sign In', 'Sign-in opens independently');
      currentApp.auth.close();
      assert(!currentApp.auth.isOpen, 'Dialog closes');
      assert(document.body.style.overflow === '', 'Scroll lock restored');
    }
    if (features.carousel) {
      fixture.querySelector('[aria-label="Show banner 2"]').click();
      assert(fixture.querySelector('[aria-label="Show banner 2"]').getAttribute('aria-pressed') === 'true', 'Carousel works with any auth/header setting');
    }
    const animations = fixture.getAnimations({ subtree: true });
    currentApp.destroy();
    currentApp.destroy();
    assert(fixture.children.length === 0, 'Destroy removes owned markup');
    assert(animations.every(animation => animation.playState === 'idle'), 'Destroy cancels animations');
    assert(!fixture.style.getPropertyValue('--page-top'), 'Destroy restores layout setting');
    await tick();
  });
}

await test('Remount replaces the previous app and detaches old actions', async () => {
  const first = await mountApp(fixture);
  const oldTrigger = fixture.querySelector('[data-auth-open="signup"]');
  first.auth.open('signup', oldTrigger);
  currentApp = await mountApp(fixture, { features: { auth: false } });
  assert(fixture.querySelectorAll('main').length === 1, 'Single main');
  assert(fixture.querySelectorAll('.top-bar').length === 1, 'Single header');
  assert(document.body.style.overflow === '', 'Open dialog removed without scroll lock');
  oldTrigger.click();
  assert(!fixture.querySelector('dialog'), 'Old trigger cannot reopen auth');
});

await test('Concurrent remount keeps only the latest requested app', async () => {
  const first = mountApp(fixture);
  const second = mountApp(fixture, { features: Object.fromEntries(names.map(name => [name, false])) });
  await first;
  currentApp = await second;
  assert(fixture.children.length === 1 && fixture.firstElementChild.tagName === 'MAIN', 'Only latest app mounted');
});

await test('Auth validation, recovery, tabs and password controls survive separation', async () => {
  currentApp = await mountApp(fixture, { features: { carousel: false } });
  const dialog = currentApp.auth.element;
  const get = id => dialog.querySelector('#auth-' + id);
  currentApp.auth.open('signup');
  get('identity').value = 'preview@example.com';
  get('password').value = 'Preview123';
  get('confirm').value = 'Different123';
  get('confirm').dispatchEvent(new Event('input', { bubbles: true }));
  assert(!get('confirm').validity.valid && get('field-hint').textContent, 'Mismatch validation');
  get('confirm').value = 'Preview123';
  get('confirm').dispatchEvent(new Event('input', { bubbles: true }));
  get('terms').checked = true;
  get('form').requestSubmit();
  assert(get('feedback').textContent.includes('No account was created'), 'Sign-up demo');
  get('tab-signin').click();
  assert(get('confirm').disabled && get('terms').disabled && get('registration').hidden, 'Inactive fields excluded');
  get('password').value = 'demo';
  dialog.querySelector('[data-password-for="auth-password"]').click();
  assert(get('password').type === 'text', 'Password reveal');
  get('form').requestSubmit();
  assert(get('feedback').textContent.includes('No account was accessed'), 'Sign-in demo');
  get('forgot').click();
  assert(!get('recovery').hidden && get('recovery-email').value === 'preview@example.com', 'Recovery opens with email');
  get('recovery').requestSubmit();
  assert(get('feedback').textContent.includes('No email was sent'), 'Recovery demo');
  get('back').click();
  assert(get('recovery').hidden && !get('form').hidden, 'Recovery returns to sign-in');
  dialog.querySelector('[data-social="Google"]').click();
  assert(get('feedback').textContent.includes('Google'), 'Social preview');
  get('tab-signin').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  assert(get('tab-signup').getAttribute('aria-selected') === 'true', 'Keyboard tabs');
  currentApp.auth.close();
});

await test('Dialog pauses and releases carousel playback through app callbacks', async () => {
  currentApp = await mountApp(fixture);
  await tick();
  const root = currentApp.carousel.element;
  const animation = root.querySelector('.banner-carousel__fill').getAnimations()[0]
    || root.getAnimations({ subtree: true }).find(item => item.effect.target.classList.contains('banner-carousel__fill'));
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    assert(!animation, 'Reduced motion has no autoplay');
    return;
  }
  assert(animation, 'Progress animation exists');
  currentApp.auth.open('signup');
  const pausedTime = animation.currentTime;
  await sleep(120);
  assert(animation.playState === 'paused' && Math.abs(animation.currentTime - pausedTime) < 1, 'Paused while dialog open');
  currentApp.auth.close();
  await tick();
  assert(animation.playState === 'running', 'Playback resumes after close');
});

await test('Leaf controls and standalone features work without app siblings', async () => {
  let clicks = 0;
  const button = createButton({ label: 'Preview', onClick: () => clicks++ });
  fixture.append(button, createLogo());
  button.click();
  button.disabled = true;
  button.click();
  assert(clicks === 1, 'Disabled shared button blocks clicks');
  const header = createHeader({ actions: [createButton({ label: 'Independent action' })] });
  fixture.append(header.element);
  assert(!header.element.querySelector('.brand'), 'Header accepts unrelated content without logo/auth');
  header.destroy();
  const auth = createAuthDialog();
  fixture.append(auth.element);
  auth.open('signin');
  assert(auth.isOpen, 'Auth without header/carousel');
  auth.destroy();
  const carousel = createCarousel();
  fixture.append(carousel.element);
  carousel.mount();
  carousel.element.querySelector('[aria-label="Show banner 2"]').click();
  assert(carousel.element.querySelector('[aria-pressed="true"]').getAttribute('aria-label') === 'Show banner 2', 'Carousel without auth');
  carousel.destroy();
});

await tick();
await test('No uncaught errors during mounting, interaction or teardown', async () => {
  assert(errors.length === 0, errors.join('; '));
});
status.textContent = passed + ' passed, ' + failed + ' failed';
status.dataset.complete = 'true';
status.dataset.failed = String(failed);
document.title = (failed ? 'FAIL' : 'PASS') + ' — Component checks';
