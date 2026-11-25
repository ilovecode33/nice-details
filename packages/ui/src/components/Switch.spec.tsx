import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { Switch } from './Switch';

function SwitchDemo({ initial = false }: { initial?: boolean }) {
  const [checked, setChecked] = useState(initial);
  return <Switch label="Wifi" checked={checked} onChange={setChecked} />;
}

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
