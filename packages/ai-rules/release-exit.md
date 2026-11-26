# Release exit criteria

Scope: Applies to the shared @ilovecode33/ui library.

- [ ] `bunx turbo run typecheck build --filter=@ilovecode33/ui` is green.
- [ ] The landing page has been checked at **375px (phone)** and **1280px (desktop)**.
- [ ] Tab through the whole page: order is correct, focus ring is visible, no trapped focus.
- [ ] Switch between light / dark / system: no flashing or wrong tokens.
- [ ] Check all five accent colors for sufficient text contrast.
- [ ] With reduced motion enabled, animations stop.
- [ ] Measure the main touch targets in the browser inspector (≥ 44px).
- [ ] `dist/index.js`, `dist/index.d.ts`, and `dist/styles.css` are all produced.
- [ ] Breaking changes are recorded in the commit message / changelog.
