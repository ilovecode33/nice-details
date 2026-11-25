import classes from './Skeleton.module.css';
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
export function Skeleton({
  width = '100%',
  height = '16px',
}: {
  width?: string;
  height?: string;
}) {
  return (
    <span
      className={cn('ui-skeleton')}
      aria-hidden="true"
      style={{ width, height } as CSSProperties}
    />
  );
}
