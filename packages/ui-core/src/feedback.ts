import type { FeedbackState, FeedbackEvent, Semantics, PortableComponent } from '@ilovecode33/ui-types';

/**
 * Notification state machine: `show` replaces tone, message, and optional action
 * label and marks the feedback visible; `dismiss` only clears visibility, keeping
 * the last message. There is no queue, so a new `show` overwrites the current one.
 */
export function feedbackReducer(state: FeedbackState, event: FeedbackEvent): FeedbackState {
  switch (event.type) {
    case 'show':
      return {
        tone: event.tone,
        message: event.message,
        visible: true,
        actionLabel: event.actionLabel,
      };
    case 'dismiss':
      return { ...state, visible: false };
  }
}

/**
 * Map feedback state to an ARIA live role: `alert` for `danger`, `status` for all
 * other tones, with the message as label. Visibility is not encoded here.
 */
export function feedbackSemantics(state: FeedbackState): Semantics {
  return { role: state.tone === 'danger' ? 'alert' : 'status', label: state.message };
}

/** Portable definition of Toast/Banner: initial state, reducer, and role mapping. */
export const feedbackContract: PortableComponent<FeedbackState, FeedbackEvent> = {
  name: 'Toast / Banner',
  swiftUI: 'Overlay with accessibility announcement',
  initial: () => ({ tone: 'info', message: '', visible: false }),
  reduce: feedbackReducer,
  semantics: feedbackSemantics,
};
