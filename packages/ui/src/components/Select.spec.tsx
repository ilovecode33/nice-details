import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Select } from './Select';
import { expectComponentSnapshot } from '../test-utils/snapshot';

const snapNoop = () => {};

describe('Select', () => {
  test('opens the list and chooses an option', () => {
    let chosen = '';
    render(
      <Select
        aria-label="Fruit"
        value=""
        options={[{ value: 'apple', label: 'Apple' }]}
        onChange={(e) => (chosen = e.target.value)}
      />,
    );
    fireEvent.click(screen.getByRole('combobox', { name: 'Fruit' }));
    fireEvent.click(screen.getByRole('option', { name: 'Apple' }));
    expect(chosen).toBe('apple');
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <Select
        aria-label="Fruit"
        value="apple"
        options={[{ value: 'apple', label: 'Apple' }]}
        onChange={snapNoop}
      />,
    );
  });

  const renderSelect = () =>
    render(
      <Select
        aria-label="Fruit"
        value=""
        options={[{ value: 'apple', label: 'Apple' }]}
        onChange={snapNoop}
      />,
    );

  /** The component listens for move/up on document, outside the React tree. */
  const pointer = {
    pointerId: 1,
    pointerType: 'mouse',
    button: 0,
  } as const;

  /** Makes hit-testing deterministic; returns a restore function. */
  const stubElementFromPoint = (element: Element | null) => {
    const original = document.elementFromPoint;
    document.elementFromPoint = () => element;
    return () => {
      document.elementFromPoint = original;
    };
  };

  test('opens upward when dragged above the trigger', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });

    fireEvent.pointerDown(trigger, { ...pointer, clientY: 200 });
    fireEvent.pointerMove(document, { ...pointer, clientY: 150 });
    fireEvent.pointerUp(document, { ...pointer, clientY: 150 });

    expect(screen.getByRole('listbox')).toHaveAttribute(
      'data-ui',
      'select__menu select__menu--up',
    );
  });

  test('opens downward when dragged below the trigger', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });

    fireEvent.pointerDown(trigger, { ...pointer, clientY: 150 });
    fireEvent.pointerMove(document, { ...pointer, clientY: 200 });
    fireEvent.pointerUp(document, { ...pointer, clientY: 200 });

    const menu = screen.getByRole('listbox');
    expect(menu).toHaveAttribute('data-ui', 'select__menu');
    expect(menu.getAttribute('data-ui')).not.toContain('select__menu--up');
  });

  test('the synthetic click after a drag does not close the menu', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });

    fireEvent.pointerDown(trigger, { ...pointer, clientY: 200 });
    fireEvent.pointerMove(document, { ...pointer, clientY: 150 });
    fireEvent.pointerUp(document, { ...pointer, clientY: 150 });
    fireEvent.click(trigger);

    expect(screen.getByRole('listbox')).not.toBeNull();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('a sub-threshold movement still behaves like a plain click', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });

    fireEvent.pointerDown(trigger, { ...pointer, clientY: 150 });
    fireEvent.pointerMove(document, { ...pointer, clientY: 154 });
    fireEvent.pointerUp(document, { ...pointer, clientY: 154 });

    expect(screen.queryByRole('listbox')).toBeNull();

    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toHaveAttribute('data-ui', 'select__menu');

    fireEvent.click(trigger);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  test('ArrowUp opens upward and ArrowDown opens downward', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });

    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    expect(screen.getByRole('listbox')).toHaveAttribute(
      'data-ui',
      'select__menu select__menu--up',
    );

    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toHaveAttribute('data-ui', 'select__menu');
  });

  test('a horizontal drag does not open the list', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });

    fireEvent.pointerDown(trigger, { ...pointer, clientX: 100, clientY: 150 });
    fireEvent.pointerMove(document, { ...pointer, clientX: 260, clientY: 150 });
    fireEvent.pointerUp(document, { ...pointer, clientX: 260, clientY: 150 });

    expect(screen.queryByRole('listbox')).toBeNull();
  });

  test('a mostly-horizontal diagonal drag does not open the list', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });

    fireEvent.pointerDown(trigger, { ...pointer, clientX: 100, clientY: 200 });
    fireEvent.pointerMove(document, { ...pointer, clientX: 220, clientY: 160 });
    fireEvent.pointerUp(document, { ...pointer, clientX: 220, clientY: 160 });

    expect(screen.queryByRole('listbox')).toBeNull();
  });

  test('a mostly-vertical diagonal drag opens upward', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });

    fireEvent.pointerDown(trigger, { ...pointer, clientX: 100, clientY: 200 });
    fireEvent.pointerMove(document, { ...pointer, clientX: 130, clientY: 120 });
    fireEvent.pointerUp(document, { ...pointer, clientX: 130, clientY: 120 });

    expect(screen.getByRole('listbox')).toHaveAttribute(
      'data-ui',
      'select__menu select__menu--up',
    );
  });

  test('a horizontal drag does not flip an already-open downward menu', () => {
    renderSelect();
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });

    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toHaveAttribute('data-ui', 'select__menu');

    fireEvent.pointerDown(trigger, { ...pointer, clientX: 100, clientY: 150 });
    fireEvent.pointerMove(document, { ...pointer, clientX: 260, clientY: 150 });
    fireEvent.pointerUp(document, { ...pointer, clientX: 260, clientY: 150 });

    expect(screen.getByRole('listbox')).toHaveAttribute('data-ui', 'select__menu');
  });

  test('dragging from the trigger onto an option selects it and closes', () => {
    let chosen = '';
    render(
      <Select
        aria-label="Fruit"
        value=""
        options={[
          { value: 'apple', label: 'Apple' },
          { value: 'banana', label: 'Banana' },
        ]}
        onChange={(e) => (chosen = e.target.value)}
      />,
    );
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });

    fireEvent.pointerDown(trigger, { ...pointer, clientY: 100 });
    fireEvent.pointerMove(document, { ...pointer, clientY: 160 });
    const banana = screen.getByRole('option', { name: 'Banana' });
    const restore = stubElementFromPoint(banana);
    try {
      fireEvent.pointerMove(document, { ...pointer, clientY: 220 });
      fireEvent.pointerUp(document, { ...pointer, clientY: 220 });
    } finally {
      restore();
    }

    expect(chosen).toBe('banana');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  test('sliding inside an open menu selects the option under the pointer', () => {
    let chosen = '';
    render(
      <Select
        aria-label="Fruit"
        value=""
        options={[
          { value: 'apple', label: 'Apple' },
          { value: 'banana', label: 'Banana' },
        ]}
        onChange={(e) => (chosen = e.target.value)}
      />,
    );
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    fireEvent.click(trigger);

    const apple = screen.getByRole('option', { name: 'Apple' });
    const banana = screen.getByRole('option', { name: 'Banana' });
    fireEvent.pointerDown(apple, { ...pointer, clientX: 100, clientY: 200 });
    const restore = stubElementFromPoint(banana);
    try {
      fireEvent.pointerMove(document, { ...pointer, clientX: 100, clientY: 260 });
      fireEvent.pointerUp(document, { ...pointer, clientX: 100, clientY: 260 });
    } finally {
      restore();
    }

    expect(chosen).toBe('banana');
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
