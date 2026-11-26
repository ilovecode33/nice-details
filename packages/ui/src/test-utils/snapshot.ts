import { expect } from '@rstest/core';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';

/**
 * Render one component and assert its structural snapshot: tags, roles, ARIA,
 * `data-ui` slots and CSS Module classes. React's generated ids are replaced
 * with a stable `ID` placeholder because they are an implementation detail of
 * render order, not component API.
 */
export function expectComponentSnapshot(element: ReactElement): void {
  // Providers persist theme/accent/locale; clear them so the snapshot does not
  // depend on which tests ran before it in the same spec file.
  window.localStorage.clear();
  const root = document.documentElement;
  root.removeAttribute('data-theme');
  root.removeAttribute('data-accent');
  root.removeAttribute('lang');
  root.style.cssText = '';

  const { baseElement } = render(element);
  const clone = baseElement.cloneNode(true) as HTMLElement;
  for (const node of [clone, ...Array.from(clone.querySelectorAll('*'))]) {
    for (const attribute of Array.from(node.attributes)) {
      // React 19 emits `_r_2_`; older versions (or an identifierPrefix) emit
      // `«r2»` / `r2`. Normalize all three spellings.
      const normalized = attribute.value.replace(/_r_\d+_|«r\d+»|\br\d+\b/g, 'ID');
      if (normalized !== attribute.value) node.setAttribute(attribute.name, normalized);
    }
  }
  expect(clone).toMatchSnapshot();
}
