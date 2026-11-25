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
