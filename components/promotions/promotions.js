export function createPromotions({ items = [], dialogId, onSelect = () => {} } = {}) {
  const element = document.createElement('section');
  element.className = 'promotions';
  element.setAttribute('aria-label', 'Promotions');
  const controller = new AbortController();
  items.forEach((promotion, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'promotions__card';
    card.dataset.promotionId = promotion.id;
    card.setAttribute('aria-label', 'Open promotion ' + (index + 1));
    card.setAttribute('aria-haspopup', 'dialog');
    if (dialogId) card.setAttribute('aria-controls', dialogId);
    card.addEventListener('click', () => onSelect(promotion, card), { signal: controller.signal });
    element.append(card);
  });
  return {
    element,
    destroy() { controller.abort(); element.remove(); },
  };
}
