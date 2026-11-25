import type { FeedbackState, FeedbackEvent, Semantics, PortableComponent } from '@ilovecode33/ui-types';

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

export function feedbackSemantics(state: FeedbackState): Semantics {
  return { role: state.tone === 'danger' ? 'alert' : 'status', label: state.message };
}

export const feedbackContract: PortableComponent<FeedbackState, FeedbackEvent> = {
  name: 'Toast / Banner',
  swiftUI: 'Overlay with accessibility announcement',
  initial: () => ({ tone: 'info', message: '', visible: false }),
  reduce: feedbackReducer,
  semantics: feedbackSemantics,
};
