import { afterEach, beforeEach, describe, expect, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import { Button, Segmented, Switch } from '../components';
import { DockNavigation, type DockNavigationHandle } from '../dock';
import { FloatingBar } from '../floating';
import { Deformable } from '../motion';

function SwitchDemo({ initial = false }: { initial?: boolean }) {
  const [checked, setChecked] = useState(initial);
  return <Switch label="Wifi" checked={checked} onChange={setChecked} />;
}

function SegmentedDemo() {
  const [value, setValue] = useState<'day' | 'week' | 'month'>('day');
  return (
    <Segmented
      label="Range"
      value={value}
      onChange={setValue}
      options={[
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
      ]}
    />
  );
}

describe('Button', () => {
  test('renders its label and fires onClick', () => {
    let clicks = 0;
    render(<Button onClick={() => (clicks += 1)}>Save</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(clicks).toBe(1);
  });

  test('keeps the variant and size classes', () => {
    render(
      <Button variant="primary" size="compact">
        Continue
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Continue' });
    expect(button.className).toContain('ui-btn--primary');
    expect(button.className).toContain('ui-btn--compact');
  });

  test('does not fire when disabled', () => {
    let clicks = 0;
    render(
      <Button disabled onClick={() => (clicks += 1)}>
        Disabled
      </Button>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Disabled' }));
    expect(clicks).toBe(0);
  });

  test('is a submit-less button by default so it never submits a form', () => {
    render(<Button>Neutral</Button>);
    expect(screen.getByRole('button', { name: 'Neutral' })).toHaveAttribute('type', 'button');
  });

  test('portals an anchor-positioned halo while hovered, with a unique anchor name', () => {
    const { unmount } = render(
      <>
        <Button haloPortal>Save</Button>
        <Button haloPortal>Discard</Button>
      </>,
    );
    const save = screen.getByRole('button', { name: 'Save' });
    const discard = screen.getByRole('button', { name: 'Discard' });

    const a1 = getComputedStyle(save).getPropertyValue('anchor-name');
    const a2 = getComputedStyle(discard).getPropertyValue('anchor-name');
    expect(a1).toMatch(/^--btn-halo-/);
    expect(a1).not.toBe(a2);
    expect(document.querySelectorAll('[class*="ui-anchor-halo"]')).toHaveLength(0);

    fireEvent.pointerOver(save);
    const halos = document.querySelectorAll('[class*="ui-anchor-halo"]');
    expect(halos).toHaveLength(1);
    expect(halos[0].parentElement).toBe(document.body);
    expect(getComputedStyle(halos[0]).getPropertyValue('position-anchor')).toBe(a1);
    expect(halos[0]).toHaveAttribute('aria-hidden', 'true');

    fireEvent.pointerOut(save);
    expect(document.querySelectorAll('[class*="ui-anchor-halo"]')).toHaveLength(0);
    unmount();
  });

  test('has no press-point glow layer', () => {
    render(<Button variant="primary">Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    fireEvent.pointerDown(button, { clientX: 50, clientY: 20, pointerType: 'mouse', button: 0 });
    expect(button.querySelector('[class*="ui-glow"]')).toBeNull();
  });

  test('keeps transform feedback without a glow layer', () => {
    render(<Button deform={false}>Quiet</Button>);
    const button = screen.getByRole('button', { name: 'Quiet' });
    fireEvent.pointerDown(button, { clientX: 10, clientY: 10, pointerType: 'mouse', button: 0 });
    expect(button.querySelector('[class*="ui-glow"]')).toBeNull();
  });
});

describe('Deformable press bloom', () => {
  test('shares the same press-point highlight with wrapped content', () => {
    render(
      <Deformable>
        <span>Content</span>
      </Deformable>,
    );
    const surface = document.querySelector('[class*="ui-deform"]') as HTMLElement;
    expect(surface).not.toBeNull();
    expect(surface.querySelector('span[aria-hidden="true"]')).toBeNull();

    fireEvent.pointerDown(surface, { clientX: 20, clientY: 10, pointerType: 'mouse', button: 0 });
    expect(surface.querySelector('span[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});

describe('Switch', () => {
  test('exposes switch semantics and syncs aria-checked with the visual state', () => {
    render(<SwitchDemo />);
    const control = screen.getByRole('switch', { name: 'Wifi' });
    expect(control).toHaveAttribute('aria-checked', 'false');
    expect(control.className).not.toContain('is-on');

    fireEvent.click(control);
    expect(control).toHaveAttribute('aria-checked', 'true');
    expect(control.className).toContain('is-on');

    fireEvent.click(control);
    expect(control).toHaveAttribute('aria-checked', 'false');
    expect(control.className).not.toContain('is-on');
  });
});

describe('Segmented', () => {
  test('marks the current item selected and updates on click', () => {
    render(<SegmentedDemo />);
    const day = screen.getByRole('tab', { name: 'Day' });
    const week = screen.getByRole('tab', { name: 'Week' });

    expect(day).toHaveAttribute('aria-selected', 'true');
    expect(week).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(week);
    expect(week).toHaveAttribute('aria-selected', 'true');
    expect(day).toHaveAttribute('aria-selected', 'false');
  });

  test('moves selection with arrow keys and keeps one tab stop', () => {
    render(<SegmentedDemo />);
    const day = screen.getByRole('tab', { name: 'Day' });
    const week = screen.getByRole('tab', { name: 'Week' });
    const month = screen.getByRole('tab', { name: 'Month' });

    fireEvent.keyDown(day, { key: 'ArrowRight' });
    expect(week).toHaveAttribute('aria-selected', 'true');
    expect(week).toHaveAttribute('tabindex', '0');
    expect(day).toHaveAttribute('tabindex', '-1');

    fireEvent.keyDown(week, { key: 'End' });
    expect(month).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(month, { key: 'Home' });
    expect(day).toHaveAttribute('aria-selected', 'true');
  });

  const rect = (left: number) =>
    ({
      left,
      top: 0,
      width: 100,
      height: 44,
      right: left + 100,
      bottom: 44,
      x: left,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect;

  let restoreGeometry: () => void;
  beforeEach(() => {
    // Patch before render: the pill is measured in a layout effect on mount.
    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      const element = this as HTMLElement;
      if (element.getAttribute('role') === 'tablist') return rect(0);
      const index = Number(element.dataset?.index);
      return rect(Number.isInteger(index) && index >= 0 ? index * 100 : 0);
    };
    restoreGeometry = () => {
      Element.prototype.getBoundingClientRect = original;
    };
  });
  afterEach(() => restoreGeometry());

  function withGeometry() {
    const track = screen.getByRole('tablist', { name: 'Range' });
    const tabs = ['Day', 'Week', 'Month'].map((name) => screen.getByRole('tab', { name }));
    return { track, day: tabs[0], week: tabs[1], month: tabs[2] };
  }

  test('moves the selected pill to the active option with a slide transition', () => {
    render(<SegmentedDemo />);
    const { track, week } = withGeometry();
    const thumb = track.querySelector('[class*="ui-segmented__thumb"]') as HTMLElement;

    expect(thumb.style.transition).toContain('left var(--dur)');
    fireEvent.click(week);
    expect(thumb.style.left).toBe('100px');
    expect(thumb.style.width).toBe('100px');
    expect(week).toHaveAttribute('data-active', 'true');
  });

  test('highlights the pill only when the selected item is hovered', () => {
    render(<SegmentedDemo />);
    const { track, day, week } = withGeometry();
    const sheen = track.querySelector('[class*="ui-segmented__sheen"]') as HTMLElement;

    expect(sheen.className).not.toContain('is-hovered');
    fireEvent.pointerEnter(week);
    expect(sheen.className).not.toContain('is-hovered');
    fireEvent.pointerEnter(day);
    expect(sheen.className).toContain('is-hovered');
    fireEvent.pointerLeave(day);
    expect(sheen.className).not.toContain('is-hovered');
  });

  test('follows the pointer while dragging the pill and snaps on release', async () => {
    render(<SegmentedDemo />);
    const { track, day, week } = withGeometry();
    const thumb = track.querySelector('[class*="ui-segmented__thumb"]') as HTMLElement;

    fireEvent.pointerDown(day, {
      clientX: 10,
      clientY: 20,
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
    });
    expect(thumb.style.transition).toBe('none');
    const spot = thumb.querySelector('[class*="ui-segmented__spot"]') as HTMLElement;
    expect(spot).not.toBeNull();
    expect(spot.style.getPropertyValue('--seg-glow-x')).toBe('10%');
    expect(thumb.querySelector('[class*="ui-segmented__sheen"]')?.className).toContain('is-held');

    fireEvent.pointerMove(day, {
      clientX: 150,
      clientY: 20,
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
    });
    // The pill floats at the pointer; selection only changes on release.
    expect(thumb.style.left).toBe('140px');
    expect(day).toHaveAttribute('aria-selected', 'true');

    fireEvent.pointerUp(day, {
      clientX: 150,
      clientY: 20,
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
    });
    expect(week).toHaveAttribute('aria-selected', 'true');
    expect(thumb.style.left).toBe('100px');
    expect(thumb.style.transition).toContain('left var(--dur)');
    expect(thumb.querySelector('[class*="ui-segmented__sheen"]')?.className).not.toContain(
      'is-held',
    );
    expect(thumb.querySelector('[class*="ui-segmented__spot"]')?.className).not.toContain(
      'is-held',
    );
    // useDeform removes its click-suppression guard on the next tick.
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  test('keeps the pill highlighted after clicking a non-active slot', () => {
    render(<SegmentedDemo />);
    const { track, week } = withGeometry();
    const sheen = track.querySelector('[class*="ui-segmented__sheen"]') as HTMLElement;

    fireEvent.pointerEnter(week);
    fireEvent.click(week, { detail: 1 });
    // Even after the click bloom fades, the pointer is still over the now-active
    // slot, so the pill must stay lit instead of dropping back to rest.
    expect(sheen.className).toContain('is-hovered');
    expect(week).toHaveAttribute('aria-selected', 'true');
  });

  test('clicking another slot slides the pill without a delayed bloom', () => {
    render(<SegmentedDemo />);
    const { track, week } = withGeometry();
    const thumb = track.querySelector('[class*="ui-segmented__thumb"]') as HTMLElement;
    const sheen = thumb.querySelector('[class*="ui-segmented__sheen"]') as HTMLElement;
    const spot = thumb.querySelector('[class*="ui-segmented__spot"]') as HTMLElement;

    fireEvent.pointerEnter(week);
    fireEvent.click(week);

    // No press bloom is left running after the click — the highlight comes
    // purely from the pointer resting on the now-active slot.
    expect(spot.className).not.toContain('is-held');
    expect(sheen.className).not.toContain('is-held');
    expect(sheen.className).toContain('is-hovered');
    expect(thumb.style.left).toBe('100px');
    expect(thumb.style.transition).toContain('left var(--dur)');
  });
});

describe('FloatingBar', () => {
  test('renders a labelled toolbar', () => {
    render(
      <FloatingBar label="Site navigation">
        <a href="/">Posts</a>
      </FloatingBar>,
    );
    expect(screen.getByRole('toolbar', { name: 'Site navigation' })).toBeInTheDocument();
  });

  test('reports collapse changes to a controlled host without mutating locally', () => {
    const changes: boolean[] = [];
    render(
      <FloatingBar
        label="Site navigation"
        collapsible
        collapsed={false}
        onCollapsedChange={(next) => {
          changes.push(next);
        }}
      >
        <a href="/">Posts</a>
      </FloatingBar>,
    );
    const toggle = screen.getByRole('button', { name: 'Collapse' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(toggle);
    expect(changes).toEqual([true]);
    // Still expanded: the host owns the state.
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('expands when the host passes collapsed and the label follows state', () => {
    const changes: boolean[] = [];
    const { rerender } = render(
      <FloatingBar
        collapsible
        collapsed
        collapseLabel="Collapse"
        expandLabel="Expand"
        onCollapsedChange={(next) => changes.push(next)}
      >
        <a href="/">Posts</a>
      </FloatingBar>,
    );
    expect(screen.getByRole('button', { name: 'Expand' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Expand' }));
    expect(changes).toEqual([false]);

    rerender(
      <FloatingBar collapsible collapsed={false} onCollapsedChange={(next) => changes.push(next)}>
        <a href="/">Posts</a>
      </FloatingBar>,
    );
    expect(screen.getByRole('button', { name: 'Collapse' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  test('toggles locally when no host state is supplied', () => {
    render(
      <FloatingBar collapsible label="Dock">
        <a href="/">Posts</a>
      </FloatingBar>,
    );
    const toggle = screen.getByRole('button', { name: 'Collapse' });
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Expand' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});

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
