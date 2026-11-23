import { describe, expect, test } from '@rstest/core';
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

  test('blooms from the press point and replays on the next press', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    button.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        width: 200,
        height: 40,
        right: 200,
        bottom: 40,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    expect(button.querySelector('span[aria-hidden="true"]')).toBeNull();

    fireEvent.pointerDown(button, { clientX: 50, clientY: 20, pointerType: 'mouse', button: 0 });
    expect(button.style.getPropertyValue('--glow-x')).toBe('25%');
    expect(button.style.getPropertyValue('--glow-y')).toBe('50%');
    const first = button.querySelector('span[aria-hidden="true"]');
    expect(first).not.toBeNull();
    expect(first).toHaveAttribute('aria-hidden', 'true');

    fireEvent.pointerDown(button, { clientX: 150, clientY: 20, pointerType: 'mouse', button: 0 });
    expect(button.style.getPropertyValue('--glow-x')).toBe('75%');
    expect(button.querySelector('span[aria-hidden="true"]')).not.toBe(first);
  });

  test('does not bloom when press feedback is disabled', () => {
    render(<Button deform={false}>Quiet</Button>);
    const button = screen.getByRole('button', { name: 'Quiet' });
    fireEvent.pointerDown(button, { clientX: 10, clientY: 10, pointerType: 'mouse', button: 0 });
    expect(button.querySelector('span[aria-hidden="true"]')).toBeNull();
    expect(button.style.getPropertyValue('--glow-x')).toBe('50%');
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

  function withGeometry() {
    const track = screen.getByRole('tablist', { name: 'Range' });
    const tabs = ['Day', 'Week', 'Month'].map((name) => screen.getByRole('tab', { name }));
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
    track.getBoundingClientRect = () => rect(0);
    tabs.forEach((tab, index) => {
      tab.getBoundingClientRect = () => rect(index * 100);
    });
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

  test('deforms the pill and switches options while dragging', async () => {
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
    expect(thumb.style.getPropertyValue('--glow-x')).toBe('10%');
    expect(thumb.querySelector('span[aria-hidden="true"]')).not.toBeNull();

    fireEvent.pointerMove(day, {
      clientX: 150,
      clientY: 20,
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
    });
    expect(week).toHaveAttribute('aria-selected', 'true');

    fireEvent.pointerUp(day, {
      clientX: 150,
      clientY: 20,
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
    });
    expect(week).toHaveAttribute('aria-selected', 'true');
    expect(thumb.style.transition).toContain('left var(--dur)');
    // useDeform removes its click-suppression guard on the next tick.
    await new Promise((resolve) => setTimeout(resolve, 0));
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
