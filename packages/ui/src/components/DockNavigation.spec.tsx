import { describe, expect, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { DockNavigation } from './DockNavigation';
import type { DockNavigationHandle } from '@ilovecode33/ui-types';

describe('DockNavigation', () => {
  const items = [
    { id: 'posts', label: 'Posts', href: '/' },
    { id: 'about', label: 'About', href: '/about' },
  ];

  test('renders links and marks the active route', () => {
    render(<DockNavigation label="Site navigation" items={items} activeId="posts" />);
    expect(screen.getByRole('toolbar', { name: 'Site navigation' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Posts' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'About' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  test('renders buttons when no href is supplied and reports selection', () => {
    let selected = '';
    render(
      <DockNavigation
        items={[
          { id: 'button', label: 'Button' },
          { id: 'layout', label: 'Layout' },
        ]}
        activeId="button"
        onSelect={(id) => {
          selected = id;
        }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Button' })).toHaveAttribute(
      'aria-current',
      'location',
    );
    const button = screen.getByRole('button', { name: 'Layout' });
    expect(button).not.toHaveAttribute('aria-current');
    fireEvent.click(button);
    expect(selected).toBe('layout');
  });

  test('collapses to a scrollable strip with the active item highlighted', () => {
    render(
      <DockNavigation label="Dock" items={items} activeId="about" defaultCollapsed />,
    );
    const strip = document.querySelector<HTMLElement>('[data-ui="dock"]');
    expect(strip?.className).toContain('is-collapsed');
    expect(screen.getByRole('button', { name: 'Expand' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('link', { name: 'About' }).className).toContain('is-current');
    expect(screen.getByRole('link', { name: 'Posts' }).className).not.toContain(
      'is-current',
    );
  });

  test('the imperative handle toggles the dock', () => {
    const ref = createRef<DockNavigationHandle>();
    render(<DockNavigation ref={ref} label="Dock" items={items} />);
    act(() => ref.current?.toggle());
    expect(screen.getByRole('button', { name: 'Expand' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});
