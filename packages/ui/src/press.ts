/**
 * Touch gestures that compete with page scrolling stay dormant until a long
 * press. Before it, the browser keeps native scrolling, so a swipe that starts
 * on the control scrolls the page instead of activating it. A Select waits a
 * little longer because opening a list is a bigger commitment; a Switch arms
 * sooner so dragging its knob feels responsive.
 */
export const SELECT_LONG_PRESS_MS = 450;
export const SWITCH_LONG_PRESS_MS = 250;
