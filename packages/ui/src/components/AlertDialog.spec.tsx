import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { AlertDialog } from './AlertDialog';

const snapNoop = () => {};

describe('AlertDialog', () => {
  test('renders the message and fires the confirm action', () => {
    let confirmed = false;
    render(
      <AlertDialog open title="Delete" message="Are you sure?" onClose={() => {}} onConfirm={() => (confirmed = true)} />,
    );
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(confirmed).toBe(true);
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <AlertDialog
        open
        title="Delete"
        message="Are you sure?"
        onClose={snapNoop}
        onConfirm={snapNoop}
      />,
    );
  });
});
