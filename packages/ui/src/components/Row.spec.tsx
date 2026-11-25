import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Row } from './Row';
describe('Row', () => {
  test('renders its children in a row', () => {
    render(<Row><span>Item</span></Row>);
    expect(screen.getByText('Item')).toBeInTheDocument();
  });
});
