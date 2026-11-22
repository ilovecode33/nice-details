import type { PortableComponent, Semantics } from './types';

export type FeedbackTone = 'info' | 'success' | 'danger';

export interface FeedbackState {
  tone: FeedbackTone;
  message: string;
  visible: boolean;
  actionLabel?: string;
}

export type FeedbackEvent =
  | { type: 'show'; tone: FeedbackTone; message: string; actionLabel?: string }
  | { type: 'dismiss' };

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
