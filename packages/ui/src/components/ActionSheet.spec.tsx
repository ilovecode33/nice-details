import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { ActionSheet } from './ActionSheet';

const snapNoop = () => {};

describe('ActionSheet', () => {
  test('lists actions and reports the selected one', () => {
    let picked = '';
    render(
      <ActionSheet
        open
        title="Share"
        onClose={() => {}}
        actions={[{ label: 'Copy link', onSelect: () => (picked = 'copy') }]}
      />,
    );
    expect(screen.getByRole('dialog', { name: 'Share' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    expect(picked).toBe('copy');
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <ActionSheet
        open
        title="Share"
        onClose={snapNoop}
        actions={[{ label: 'Copy link', onSelect: snapNoop }]}
      />,
    );
  });
});
