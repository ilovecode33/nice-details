import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { QrScanner } from './QrScanner';

const labels = {
  scanning: 'Point the camera at the QR code.',
  camera: 'Camera preview',
  unavailable: 'Camera access is not available in this browser.',
  insecure: 'Camera scanning requires HTTPS or localhost.',
  permission: 'Allow camera access to scan the code.',
  error: 'Could not read the camera.',
  success: 'Code scanned.',
};

describe('QrScanner', () => {
  test('reports when camera access is unavailable', async () => {
    render(<QrScanner onScan={() => {}} labels={labels} />);
    expect(await screen.findByRole('alert')).toBeTruthy();
  });
});
