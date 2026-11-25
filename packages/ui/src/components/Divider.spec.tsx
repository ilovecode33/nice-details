import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Divider } from './Divider';
describe('Divider', () => {
  test('renders a horizontal rule', () => {
    render(<Divider />);
    expect(document.querySelector('hr')).toBeInTheDocument();
  });
});
