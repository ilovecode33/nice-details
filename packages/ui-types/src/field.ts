export interface FieldState<T = string> {
  value: T;
  touched: boolean;
  error?: string;
}

export type FieldEvent<T = string> =
  | { type: 'change'; value: T }
  | { type: 'blur' }
  | { type: 'error'; message?: string }
  | { type: 'reset'; value?: T };
