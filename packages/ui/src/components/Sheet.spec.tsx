import { describe, expect, rs, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Sheet } from './Sheet';
import { expectComponentSnapshot } from '../test-utils/snapshot';

const snapNoop = () => {};

function mockMobileViewport() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

function dispatchTransitionEnd(element: HTMLElement, propertyName = 'transform') {
  act(() => {
    const event = new Event('transitionend', { bubbles: true });
    Object.defineProperty(event, 'propertyName', { value: propertyName });
    element.dispatchEvent(event);
  });
}

describe('Sheet', () => {
  test('renders a modal dialog when open and transitions opening -> open on animationend', () => {
    mockMobileViewport();
    render(<Sheet open title="Details" onClose={() => {}}><p>Body</p></Sheet>);
    const dialog = screen.getByRole('dialog', { name: 'Details' });
    const panel = dialog.querySelector('header')!.parentElement as HTMLDivElement;

    expect(dialog).toBeInTheDocument();
    expect(dialog.getAttribute('data-phase')).toBe('opening');
    expect(screen.getByText('Body')).toBeInTheDocument();

    fireEvent.animationEnd(panel);
    expect(dialog.getAttribute('data-phase')).toBe('open');
  });

  test('locks body scroll while open and restores it on close', () => {
    const { rerender } = render(<Sheet open title="Details" onClose={() => {}}><p>Body</p></Sheet>);
    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.paddingRight).toBe('');

    rerender(<Sheet open={false} title="Details" onClose={() => {}}><p>Body</p></Sheet>);
    expect(document.body.style.position).toBe('');
    expect(document.body.style.overflow).toBe('');
  });

  test('drags down on the header to dismiss without re-entering opening', () => {
    mockMobileViewport();
    const onClose = rs.fn();
    render(<Sheet open title="Details" onClose={onClose}><p>Body</p></Sheet>);

    const dialog = screen.getByRole('dialog', { name: 'Details' });
    const header = dialog.querySelector('header')!;
    const panel = header.parentElement as HTMLDivElement;
    panel.getBoundingClientRect = () => ({ height: 400 } as DOMRect);
    header.setPointerCapture = () => {};
    header.hasPointerCapture = () => false;

    fireEvent.animationEnd(panel);
    expect(dialog.getAttribute('data-phase')).toBe('open');

    fireEvent.pointerDown(header, { isPrimary: true, button: 0, pointerId: 1, clientY: 100 });
    expect(dialog.getAttribute('data-phase')).toBe('dragging');

    fireEvent.pointerMove(header, { pointerId: 1, clientY: 220 });
    expect(panel.style.getPropertyValue('--sheet-drag-y')).toBe('120px');

    fireEvent.pointerUp(header, { pointerId: 1, clientY: 220 });
    expect(dialog.getAttribute('data-phase')).toBe('closing');
    expect(panel.style.getPropertyValue('--sheet-drag-y')).toBe('120px');
    expect(onClose).not.toHaveBeenCalled();

    dispatchTransitionEnd(panel);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('snaps back via settling -> open when header drag does not reach the close threshold', () => {
    mockMobileViewport();
    const onClose = rs.fn();
    render(<Sheet open title="Details" onClose={onClose}><p>Body</p></Sheet>);

    const dialog = screen.getByRole('dialog', { name: 'Details' });
    const header = dialog.querySelector('header')!;
    const panel = header.parentElement as HTMLDivElement;
    panel.getBoundingClientRect = () => ({ height: 500 } as DOMRect);
    header.setPointerCapture = () => {};
    header.hasPointerCapture = () => false;

    fireEvent.animationEnd(panel);
    fireEvent.pointerDown(header, { isPrimary: true, button: 0, pointerId: 1, clientY: 100 });
    fireEvent.pointerMove(header, { pointerId: 1, clientY: 116 });
    fireEvent.pointerUp(header, { pointerId: 1, clientY: 116 });

    expect(dialog.getAttribute('data-phase')).toBe('settling');
    expect(onClose).not.toHaveBeenCalled();

    dispatchTransitionEnd(panel);
    expect(dialog.getAttribute('data-phase')).toBe('open');
    expect(panel.style.getPropertyValue('--sheet-drag-y')).toBe('');
  });

  test('swiping down on the body at scrollTop 0 drags the sheet and prevents background pass-through', () => {
    mockMobileViewport();
    const onClose = rs.fn();
    render(<Sheet open title="Details" onClose={onClose}><p>Body</p></Sheet>);

    const dialog = screen.getByRole('dialog', { name: 'Details' });
    const body = screen.getByText('Body').parentElement as HTMLDivElement;
    const panel = body.parentElement as HTMLDivElement;
    panel.getBoundingClientRect = () => ({ height: 400 } as DOMRect);

    fireEvent.touchStart(body, {
      touches: [{ identifier: 1, clientX: 50, clientY: 100 }],
    });
    const moveEvent = new Event('touchmove', { bubbles: true, cancelable: true });
    Object.defineProperty(moveEvent, 'touches', {
      value: [{ identifier: 1, clientX: 50, clientY: 230 }],
    });
    act(() => {
      body.dispatchEvent(moveEvent);
    });

    expect(moveEvent.defaultPrevented).toBe(true);
    expect(dialog.getAttribute('data-phase')).toBe('dragging');
    expect(panel.style.getPropertyValue('--sheet-drag-y')).toBe('130px');

    fireEvent.touchEnd(body, {
      changedTouches: [{ identifier: 1, clientX: 50, clientY: 230 }],
    });
    expect(dialog.getAttribute('data-phase')).toBe('closing');
    dispatchTransitionEnd(panel);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('swiping down on a scrolled body does not hijack scrolling', () => {
    mockMobileViewport();
    const onClose = rs.fn();
    render(<Sheet open title="Details" onClose={onClose}><p>Body</p></Sheet>);

    const dialog = screen.getByRole('dialog', { name: 'Details' });
    const body = screen.getByText('Body').parentElement as HTMLDivElement;
    const panel = body.parentElement as HTMLDivElement;
    fireEvent.animationEnd(panel);
    body.scrollTop = 40;

    fireEvent.touchStart(body, {
      touches: [{ identifier: 1, clientX: 50, clientY: 100 }],
    });
    fireEvent.touchMove(body, {
      touches: [{ identifier: 1, clientX: 50, clientY: 200 }],
    });

    expect(dialog.getAttribute('data-phase')).toBe('open');
    expect(panel.style.getPropertyValue('--sheet-drag-y')).toBe('');
  });

  test('resets to opening phase when reopened', () => {
    mockMobileViewport();
    const onClose = rs.fn();
    const { rerender } = render(<Sheet open title="Details" onClose={onClose}><p>Body</p></Sheet>);

    const dialog = screen.getByRole('dialog', { name: 'Details' });
    const header = dialog.querySelector('header')!;
    const panel = header.parentElement as HTMLDivElement;
    panel.getBoundingClientRect = () => ({ height: 400 } as DOMRect);
    header.setPointerCapture = () => {};
    header.hasPointerCapture = () => false;

    fireEvent.pointerDown(header, { isPrimary: true, button: 0, pointerId: 1, clientY: 100 });
    fireEvent.pointerUp(header, { pointerId: 1, clientY: 250 });
    expect(dialog.getAttribute('data-phase')).toBe('closing');

    rerender(<Sheet open={false} title="Details" onClose={onClose}><p>Body</p></Sheet>);
    rerender(<Sheet open title="Details" onClose={onClose}><p>Body</p></Sheet>);
    expect(screen.getByRole('dialog', { name: 'Details' }).getAttribute('data-phase')).toBe('opening');
  });

  test('matches its structural snapshot', () => {
    mockMobileViewport();
    expectComponentSnapshot(
      <Sheet open title="Details" onClose={snapNoop}>
        <p>Body</p>
      </Sheet>,
    );
  });
});
