import { describe, expect, test } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { QrCode } from './QrCode';

describe('QrCode', () => {
  test('renders an accessible QR code', async () => {
    const { container } = render(
      <QrCode value="local-sync-test" label="Pairing code" />,
    );

    expect(screen.getByRole('img', { name: 'Pairing code' })).toBeTruthy();
    await waitFor(() => expect(container.querySelector('svg')).toBeTruthy());
  });
});
