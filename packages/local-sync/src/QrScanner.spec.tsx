import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { QrScanner } from './QrScanner';

describe('QrScanner', () => {
  test('reports when camera access is unavailable', async () => {
    render(<QrScanner onScan={() => {}} />);
    expect(await screen.findByRole('alert')).toBeTruthy();
  });
});
