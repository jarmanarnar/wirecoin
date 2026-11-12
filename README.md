# WireFrame Casino

A responsive playground for casino UI components. Authentication forms are interactive previews only: they do not create accounts, store credentials, or send email.

## Preview

Published with GitHub Pages: https://jarmanarnar.github.io/wireframe-casino/

## Local development

Run `npm start` and open http://127.0.0.1:4335/.

The site uses plain HTML, CSS and JavaScript with no build step or dependency installation. GitHub Pages serves the root of `main`. `server.mjs` is used only for local development.

## Banner carousel

The playground opens with four empty banners. The layout shows one banner at a time on narrow screens, two on wider screens, and three on large screens. Use the indicators, swipe or drag the banners, or use the arrow keys while the banner area is focused. The active indicator fills over six seconds before the carousel advances. Rotation pauses during interaction and while the account dialog is open, and respects reduced motion.

The carousel uses the local MIT-licensed Embla Carousel 8.6.0 browser module.

## Shared design language

`styles.css` is the single source of truth for colors, typography, corner radii, focus behavior and reusable button styles. `auth.css` uses these same tokens for modal layout and components.

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

The full logo is WireFrameCasino; screens up to 540px show WC. Both use 24px / 900, with Casino or C in pink. The top bar has no bottom border. The modal has no outer border. Its artwork panel stays empty and is hidden up to 640px.

New components must reuse the shared design language. Do not introduce separate palettes or fonts unless the user explicitly requests a design change. Use `button button--primary` for primary actions and `button button--secondary` for secondary buttons; component classes may adjust their layout and size.

Focus remains accessible for keyboard navigation. Account tabs use a text underline instead of a focus outline. Pointer and touch interactions do not show keyboard indicators. Keep the fixed app shell and internal page scrolling.

Push changes to `main` to update the published preview.
