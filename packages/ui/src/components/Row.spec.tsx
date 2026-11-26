import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { Row } from './Row';
import { expectComponentSnapshot } from '../test-utils/snapshot';

describe('Row', () => {
  test('renders its children in a row', () => {
    render(<Row><span>Item</span></Row>);
    expect(screen.getByText('Item')).toBeInTheDocument();
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <Row>
        <span>Item</span>
      </Row>,
    );
  });
});
