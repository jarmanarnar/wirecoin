import { createButton } from '../button/button.js';

let nextDialogId = 0;

export function createPromotionDialog({ onOpenChange = () => {}, renderContent } = {}) {
  const dialog = document.createElement('dialog');
  dialog.id = 'promotion-dialog-' + (++nextDialogId);
  dialog.className = 'promotion-dialog';
  dialog.setAttribute('aria-label', 'Promotion');
  const content = document.createElement('div');
  content.className = 'promotion-dialog__content';
  const closeButton = createButton({
    variant: 'secondary',
    className: 'promotion-dialog__close',
    attributes: { 'aria-label': 'Close promotion' },
  });
  closeButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  dialog.append(content, closeButton);
  const controller = new AbortController();
  const on = (target, type, listener) => target.addEventListener(type, listener, { signal: controller.signal });
  let opened = false, destroyed = false, pointerStartedOutside = false;
  let opener = null, currentPromotion = null;

  function open(promotion, trigger = null) {
    if (destroyed || !promotion) return;
    const rendered = renderContent?.(promotion);
    content.replaceChildren();
    if (rendered) content.append(rendered);
    else {
      const artwork = document.createElement('div');
      artwork.className = 'promotion-dialog__artwork';
      artwork.setAttribute('aria-hidden', 'true');
      const body = document.createElement('div');
      body.className = 'promotion-dialog__body';
      body.setAttribute('aria-hidden', 'true');
      content.append(artwork, body);
    }
    currentPromotion = promotion;
    dialog.dataset.promotionId = promotion.id;
    if (!dialog.open) {
      opener = trigger || document.activeElement;
      dialog.showModal();
      opened = true;
      onOpenChange(true);
    }
    closeButton.focus({ preventScroll: true });
  }

  function finishClose() {
    if (!opened || dialog.open) return;
    opened = false;
    pointerStartedOutside = false;
    currentPromotion = null;
    delete dialog.dataset.promotionId;
    content.replaceChildren();
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
    onOpenChange(false);
  }

  function close() {
    if (dialog.open) dialog.close();
    finishClose();
  }

  function outside(event) {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  }

  on(closeButton, 'click', close);
  on(dialog, 'cancel', event => { event.preventDefault(); close(); });
  on(dialog, 'close', finishClose);
  on(dialog, 'pointerdown', event => { pointerStartedOutside = event.target === dialog && outside(event); });
  on(dialog, 'click', event => {
    if (pointerStartedOutside && event.target === dialog && outside(event)) close();
    pointerStartedOutside = false;
  });
  return {
    element: dialog, open, close,
    get isOpen() { return dialog.open; },
    get promotion() { return currentPromotion; },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      close();
      controller.abort();
      dialog.remove();
    },
  };
}
