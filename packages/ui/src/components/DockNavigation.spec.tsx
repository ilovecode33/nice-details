import { describe, expect, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
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

  test('marks the active item in the expanded dock too', () => {
    render(<DockNavigation label="Dock" items={items} activeId="about" />);
    const strip = document.querySelector<HTMLElement>('[data-ui="dock"]');
    expect(strip?.className).not.toContain('is-collapsed');
    expect(screen.getByRole('link', { name: 'About' }).className).toContain(
      'is-current',
    );
    expect(screen.getByRole('link', { name: 'Posts' }).className).not.toContain(
      'is-current',
    );
  });

  test('keeps the active bubble aligned with its row while the dock wraps and collapses', () => {
    const original = Element.prototype.getBoundingClientRect;
    let collapsed = false;
    let scrollLeft = 0;
    const wrappedItems = [
      { id: 'first', label: 'First' },
      { id: 'second', label: 'Second' },
      { id: 'third', label: 'Third' },
    ];
    Element.prototype.getBoundingClientRect = function () {
      if (this instanceof HTMLElement && this.dataset.ui === 'dock') {
        return new DOMRect(0, 0, 300, collapsed ? 44 : 92);
      }
      if (this instanceof HTMLElement && this.dataset.index !== undefined) {
        const index = Number(this.dataset.index);
        const top = !collapsed && index === 2 ? 48 : 0;
        const left = collapsed ? index * 100 - scrollLeft : index === 2 ? 0 : index * 80;
        return new DOMRect(left, top, 80, 44);
      }
      return original.call(this);
    };

    try {
      const view = render(
        <DockNavigation
          label="Dock"
          items={wrappedItems}
          activeId="third"
          collapsed={collapsed}
        />,
      );

      const getThumb = () => document.querySelector<HTMLElement>('[data-ui="dock__thumb"]');
      expect(getThumb()?.style.top).toBe('48px');
      expect(getThumb()?.style.height).toBe('44px');
      expect(getThumb()?.style.bottom).toBe('auto');

      collapsed = true;
      view.rerender(
        <DockNavigation
          label="Dock"
          items={wrappedItems}
          activeId="third"
          collapsed={collapsed}
        />,
      );
      expect(getThumb()?.style.top).toBe('0px');
      expect(getThumb()?.style.height).toBe('44px');

      const collapsedTrack = document.querySelector<HTMLDivElement>('[data-ui="dock"]');
      if (!collapsedTrack) throw new Error('Expected collapsed dock track');
      scrollLeft = 150;
      collapsedTrack.scrollLeft = scrollLeft;
      fireEvent.scroll(collapsedTrack);
      expect(getThumb()?.style.left).toBe('200px');

      collapsed = false;
      view.rerender(
        <DockNavigation
          label="Dock"
          items={wrappedItems}
          activeId="third"
          collapsed={collapsed}
        />,
      );
      expect(getThumb()?.style.top).toBe('48px');
      expect(getThumb()?.style.height).toBe('44px');
    } finally {
      Element.prototype.getBoundingClientRect = original;
    }
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

  test('drag-selects the item under the pointer', () => {
    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      if (this instanceof HTMLElement && this.dataset.index !== undefined) {
        const index = Number(this.dataset.index);
        return new DOMRect(index * 60, 0, 60, 44);
      }
      if (this instanceof HTMLElement && this.dataset.ui === 'dock') {
        return new DOMRect(0, 0, 180, 44);
      }
      return original.call(this);
    };

    try {
      let selected = '';
      render(
        <DockNavigation
          items={[
            { id: 'one', label: 'One' },
            { id: 'two', label: 'Two' },
          ]}
          activeId="one"
          onSelect={(id) => {
            selected = id;
          }}
        />,
      );
      const dock = document.querySelector<HTMLElement>('[data-ui="dock"]');
      if (!dock) throw new Error('dock missing');
      const one = screen.getByRole('button', { name: 'One' });

      fireEvent.pointerDown(one, {
        pointerId: 7,
        pointerType: 'touch',
        clientX: 30,
        clientY: 20,
      });
      fireEvent.pointerMove(dock, {
        pointerId: 7,
        pointerType: 'touch',
        clientX: 90,
        clientY: 20,
      });
      fireEvent.pointerUp(dock, {
        pointerId: 7,
        pointerType: 'touch',
        clientX: 90,
        clientY: 20,
      });

      expect(selected).toBe('two');
    } finally {
      Element.prototype.getBoundingClientRect = original;
    }
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

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <DockNavigation
        label="Site navigation"
        items={[
          { id: 'posts', label: 'Posts', href: '/' },
          { id: 'about', label: 'About', href: '/about' },
        ]}
        activeId="posts"
      />,
    );
  });
});
