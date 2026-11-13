// Input modality belongs to the app, so it works even with auth disabled.
export function trackInputModality() {
  const controller = new AbortController();
  const options = { capture: true, signal: controller.signal };
  document.addEventListener('pointerdown', () => {
    document.documentElement.dataset.inputModality = 'pointer';
  }, options);
  document.addEventListener('keydown', event => {
    if (!event.altKey && !event.ctrlKey && !event.metaKey) {
      document.documentElement.dataset.inputModality = 'keyboard';
    }
  }, options);
  return () => controller.abort();
}
