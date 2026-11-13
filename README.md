# WireFrame Casino

A responsive playground for casino UI components. Authentication forms are interactive previews only: they do not create accounts, store credentials, or send email.

## Preview

Published with GitHub Pages: https://jarmanarnar.github.io/wireframe-casino/

## Local development

Run `npm start` and open http://127.0.0.1:4335/.

The site uses plain HTML, CSS and JavaScript with no build step or dependency installation. GitHub Pages serves the root of `main`. `server.mjs` is used only for local development.

## Banner carousel

The playground opens with four empty banners. The layout shows one banner at a time on narrow screens, two on wider screens, and three on large screens. Use the indicators, swipe or drag the banners, or use the arrow keys while the banner area is focused. The active indicator fills over six seconds before the carousel advances. Rotation pauses during interaction and while an account or promotion dialog is open, and respects reduced motion.

The carousel uses the local MIT-licensed Embla Carousel 8.6.0 browser module.

## Promotions

Four empty promotion cards sit below the carousel, with no visible text, imagery or placeholder copy. The cards form a compact centered row, with a 4:3 aspect ratio, 12px gaps and a maximum width of 120px per card. They shrink on phones and wrap when needed, within the same gutters and width as the carousel.

Each card opens its matching promotion in a borderless popup with empty artwork and content areas. Close using the X, Escape or the backdrop; focus returns to the card. Background scrolling and carousel rotation pause while a dialog is open.

Set the promotion list in `config.js` under `promotions.items`. Each item has a stable `id`. Future popup content can be supplied with `promotions.renderContent(promotion)`, which returns a DOM element for that item; the default stays empty.

## Shared design language

`styles.css` is the single source of truth for colors, typography, corner radii and focus behavior. It imports each component’s CSS. Shared button styles live in `components/button/button.css`; all other components reuse those styles and the shared tokens.

| Role | Value |
| --- | --- |
| Page and empty artwork panel | `#13010F` |
| Top bar and form fields | `#000000` |
| Modal surface | 40% page color mixed with black |
| Primary accent | `#FF78DF` |
| Primary hover / pressed | `#FF96E7` / `#EE62CD` |
| Text on primary | `#280121` |
| Main text | `#FFFFFF` |
| Muted / subtle text | White at 72% / 60% opacity |
| Border | `#805375` at 40% opacity |
| Border hover / field focus | `#B47AA6` at 55% opacity |
| Subtle divider | `#805375` at 20% opacity |
| Secondary hover / pressed | `#3F1336` / `#501C45` |
| Font | Arial, sans-serif |
| Type sizes | 11, 12, 14, 16, 20, 24px |
| Control corners | 8px |
| Header height | 72px |

The full logo is WireFrameCasino; screens up to 540px show WC. Both use 24px / 900, with Casino or C in pink. The top bar has no bottom border. The modal has no outer border or vertical divider between the artwork panel and the form. Its artwork panel stays empty and is hidden up to 640px.

New components must reuse the shared design language. Do not introduce separate palettes or fonts unless the user explicitly requests a design change. Use `button button--primary` for primary actions and `button button--secondary` for secondary buttons; component classes may adjust their layout and size.

Focus remains accessible for keyboard navigation. Account tabs use a text underline instead of a focus outline. Pointer and touch interactions do not show keyboard indicators. Keep the fixed app shell and internal page scrolling.

Push changes to `main` to update the published preview.

## Independent components

| Path | Responsibility |
| --- | --- |
| `config.js` | Feature visibility, carousel settings and promotion data |
| `app.js` | Composes components and connects their callbacks |
| `main.js` | Starts the page |
| `components/header/` | Header layout; accepts logo and action elements |
| `components/logo/` | Responsive full wordmark / WC |
| `components/button/` | Shared primary and secondary button factory and styles |
| `components/auth-actions/` | Sign In / Join Now buttons; calls the supplied callback |
| `components/auth/` | Dialog template, behavior and styles |
| `components/carousel/` | Banner layout, interaction and rotation |
| `components/promotions/` | Empty promotion cards; reports selections through a callback |
| `components/promotion-dialog/` | Independent promotion popup, content slot and close/focus behavior |
| `core/focus.js` | App-wide pointer/keyboard focus behavior |
| `third-party/embla-carousel/` | Unmodified external carousel engine and MIT license |

### Turn features on or off

Edit `features` in `config.js`, using `true` or `false`, then reload the preview. Publish the config change to update GitHub Pages.

- `header`: the entire header; disabling it also removes the reserved 72px space.
- `logo`: the logo inside the header.
- `authButtons`: Sign In / Join Now inside the header.
- `auth`: the account dialog. Disabling it also omits its header buttons.
- `carousel`: all banners, indicators and carousel behavior.
- `promotions`: all promotion cards and their popup.

These are UI composition switches, not security or account-access controls. Shared CSS remains available; disabled feature modules are not initialized. The defaults keep all current features enabled.

### Component contract

Leaf components `createButton()` and `createLogo()` return elements. Composite components return `element` (or `elements`) plus `destroy()`. The carousel must be appended before `mount()` so it can measure its width. It exposes `setPaused(boolean)`; the dialog exposes `open(mode, trigger)`, `close()` and an `onOpenChange` callback. Neither feature looks up the other in the DOM.

`mountApp(root, overrides)` creates one app shell and returns its controller. Remounting the same root destroys the previous instance first. `destroy()` removes owned markup, aborts listeners, cancels animations, disconnects observers and restores any dialog scroll lock. Call it before discarding an app or component. Account markup uses the `auth-*` IDs: mount one account dialog per document.

New features belong in their own `components/<name>/` directory. Keep cross-feature coordination in `app.js` and use the existing shared button and design tokens.

### Verification

With the local server running, open http://127.0.0.1:4335/tests/components.html.
The browser checks all 64 feature combinations, safe teardown/remount, independent component use, account flows, promotion selection/close/focus, and carousel pause/resume. The result must show zero failures. Also inspect the main page at desktop and mobile widths after visual changes.
