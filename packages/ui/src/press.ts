/**
 * Touch gestures that compete with page scrolling (drag to open a Select,
 * drag to flip a Switch) stay dormant until this long press. Before it, the
 * browser keeps native scrolling, so a swipe that starts on the control scrolls
 * the page instead of activating it.
 */
export const LONG_PRESS_MS = 450;
