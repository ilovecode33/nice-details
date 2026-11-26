import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { FloatingBar } from './FloatingBar';

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

  const snapNoop = () => {};

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <FloatingBar label="Site navigation" collapsible collapsed={false} onCollapsedChange={snapNoop}>
        <a href="/">Posts</a>
      </FloatingBar>,
    );
  });
});
