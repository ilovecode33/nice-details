import { describe, expect, test } from '@rstest/core';
import { fireEvent, render } from '@testing-library/react';
import { useDeform } from './useDeform';

describe('useDeform', () => {
  test('sets glow variables from the press point and clears them on release', () => {
    function Probe() {
      const { handlers, style, state } = useDeform();
      return <div data-active={String(state.active)} style={style} {...handlers} />;
    }
    const { container } = render(<Probe />);
    const surface = container.firstElementChild as HTMLElement;
    fireEvent.pointerDown(surface, { clientX: 20, clientY: 10, pointerType: 'mouse', button: 0 });
    expect(surface.style.getPropertyValue('--glow-x')).toBeTruthy();
    expect(surface.dataset.active).toBe('true');
    fireEvent.pointerUp(surface, { clientX: 20, clientY: 10, pointerType: 'mouse', button: 0 });
    expect(surface.dataset.active).toBe('false');
  });
});
