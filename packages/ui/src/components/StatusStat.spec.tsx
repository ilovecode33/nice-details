import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { StatusStat } from './StatusStat';
describe('StatusStat', () => {
  test('renders a status-specific icon', () => {
    const { container } = render(<StatusStat label="Sync" value="OK" status="success" />);
    expect(container.querySelector('svg.lucide-check')).toBeInTheDocument();
  });
});
