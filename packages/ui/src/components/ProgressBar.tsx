import classes from './ProgressBar.module.css';
import {
  feedbackReducer,
  feedbackSemantics,
  type FeedbackState,
  type FeedbackTone,
} from '@ilovecode33/ui-core';
import { type CSSProperties } from 'react';
import { Check, Info, X } from 'lucide-react';
import { createCn } from '../css';

const cn = createCn(classes);

/**
 * Transient feedback components backed by the `FeedbackState` contract from
 * `@ilovecode33/ui-core`.
 */
export function ProgressBar({
  value,
  max = 100,
  label = 'Progress',
}: {
  value: number;
  max?: number;
  label?: string;
}) {
  const percent = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;
  return (
    <div
      className={cn('ui-progressbar')}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div className={cn('ui-progressbar__track')}>
        <div className={cn('ui-progressbar__fill')} style={{ width: `${percent}%` }} />
      </div>
      <span className={cn('ui-progressbar__value')}>{Math.round(percent)}%</span>
    </div>
  );
}
