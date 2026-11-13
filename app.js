import { siteConfig } from './config.js';
import { trackInputModality } from './core/focus.js';

const mountedApps = new WeakMap();

// This is the only place where independent features are connected.
export async function mountApp(root, overrides = {}) {
  if (!root) throw new Error('An app root is required.');
  mountedApps.get(root)?.destroy();
  const features = { ...siteConfig.features, ...overrides.features };
  const carouselOptions = { ...siteConfig.carousel, ...overrides.carousel };
  const promotionOptions = { ...siteConfig.promotions, ...overrides.promotions };
  const previousPageTop = root.style.getPropertyValue('--page-top');
  const stopTrackingInput = trackInputModality();
  let destroyed = false;
  let header = null, auth = null, actions = null, carousel = null;
  let promotions = null, promotionDialog = null;
  const main = document.createElement('main');
  main.className = 'page-content';
  main.setAttribute('aria-label', 'Component playground');

  function syncModalState() {
    const open = Boolean(auth?.isOpen || promotionDialog?.isOpen);
    carousel?.setPaused(open);
    main.style.overflowY = open ? 'hidden' : '';
  }

  const app = {
    get header() { return header; },
    get auth() { return auth; },
    get carousel() { return carousel; },
    get promotions() { return promotions; },
    get promotionDialog() { return promotionDialog; },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      promotionDialog?.destroy();
      promotions?.destroy();
      auth?.destroy();
      carousel?.destroy();
      actions?.destroy();
      header?.destroy();
      main.remove();
      stopTrackingInput();
      if (previousPageTop) root.style.setProperty('--page-top', previousPageTop);
      else root.style.removeProperty('--page-top');
      if (mountedApps.get(root) === app) mountedApps.delete(root);
    },
  };
  mountedApps.set(root, app);
  try {
    // Disabled features are not imported or initialized.
    const [headerModule, logoModule, authModule, actionsModule, carouselModule, promotionsModule, promotionDialogModule] = await Promise.all([
      features.header ? import('./components/header/header.js') : null,
      features.header && features.logo ? import('./components/logo/logo.js') : null,
      features.auth ? import('./components/auth/auth.js') : null,
      features.header && features.auth && features.authButtons ? import('./components/auth-actions/auth-actions.js') : null,
      features.carousel ? import('./components/carousel/carousel.js') : null,
      features.promotions ? import('./components/promotions/promotions.js') : null,
      features.promotions ? import('./components/promotion-dialog/promotion-dialog.js') : null,
    ]);
    if (destroyed) return app;
    root.style.setProperty('--page-top', features.header ? 'var(--top-bar-height)' : '0px');
    if (authModule) {
      auth = authModule.createAuthDialog({ onOpenChange: syncModalState });
    }
    if (actionsModule) {
      actions = actionsModule.createAuthActions({
        dialogId: auth.element.id,
        onRequestAuth: (mode, trigger) => auth.open(mode, trigger),
      });
    }
    if (headerModule) {
      header = headerModule.createHeader({
        logo: logoModule?.createLogo(),
        actions: actions?.elements,
      });
      root.append(header.element);
    }
    root.append(main);
    if (auth) root.append(auth.element);
    if (carouselModule) {
      carousel = carouselModule.createCarousel(carouselOptions);
      main.append(carousel.element);
      carousel.mount();
    }
    if (promotionsModule) {
      promotionDialog = promotionDialogModule.createPromotionDialog({
        onOpenChange: syncModalState,
        renderContent: promotionOptions.renderContent,
      });
      promotions = promotionsModule.createPromotions({
        items: promotionOptions.items,
        dialogId: promotionDialog.element.id,
        onSelect: (promotion, trigger) => promotionDialog.open(promotion, trigger),
      });
      main.append(promotions.element);
      root.append(promotionDialog.element);
    }
    return app;
  } catch (error) {
    app.destroy();
    throw error;
  }
}
