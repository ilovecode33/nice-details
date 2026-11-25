import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { PhotoViewer } from './PhotoViewer';
describe('PhotoViewer', () => {
  test('shows the position and closes on request', () => {
    let closed = false;
    render(
      <PhotoViewer items={[{ id: 'a', alt: 'One' }]} index={0} onIndexChange={() => {}} onClose={() => (closed = true)} />,
    );
    expect(screen.getByText('1 / 1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(closed).toBe(true);
  });
});
