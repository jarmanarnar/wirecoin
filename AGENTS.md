# WireFrame Casino project instructions

- Every new or edited component must match the existing site. Use the shared color, type and radius tokens in styles.css; do not create a component-specific palette or font family.
- Preserve the approved black / deep purple / pink language. New visual directions require an explicit user request; reference sites provide behavior or structure, not permission to copy their colors.
- Reuse the button and button--primary / button--secondary classes. Component CSS may change layout and size, while colors and interaction states come from the shared styles.
- If the user requests a global design change, update shared tokens and check the header, sign-in, sign-up and recovery views together.
- Preserve the centered account tabs, the empty promotional panel, the responsive wordmark, the 72px fixed header and the internal page scroll.
- Preserve keyboard focus visibility and the suppression of keyboard outlines after touch or pointer input.
- Account tabs must never have a focus outline. Their keyboard focus indicator is a text underline only.
- The modal has no outer border. Keep the subtle field borders and internal dividers separate from the modal edge.
- Keep borders subdued and form fields black. Use the shared low-contrast border tokens, including field focus, instead of bright pink borders or glow effects. Reserve prominent pink fills for primary actions and active tabs.
- Check desktop and narrow mobile views after layout changes. Keep README.md in sync with approved design decisions.

## Component architecture

- Always implement UI as independent components under components/<name>/ with their own behavior/markup and CSS. Keep shared tokens in styles.css and reuse components/button for standard actions.
- app.js is the composition layer. Features communicate through passed callbacks or methods; never query another feature's DOM or import its implementation.
- Expose optional features through config.js. Disabled components must not initialize listeners, observers or animations. Omit dependent triggers and remove reserved layout space where appropriate.
- Composite components expose destroy() to remove their markup and clean up listeners, observers, animations and temporary global state. Leaf element factories must not install global listeners.
- Keep the third-party directory for external libraries and licenses. Do not mix application code into third-party or modify the library to style our components.
- Verify feature-off combinations, remount/cleanup and the default desktop/mobile appearance for structural changes. The browser regression checks are at tests/components.html.
