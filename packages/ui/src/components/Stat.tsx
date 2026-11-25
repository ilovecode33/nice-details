import classes from './Stat.module.css';
import { Check, Minus, X } from 'lucide-react';
import { type ReactNode } from 'react';
import { createCn } from '../css';

const cn = createCn(classes);

/** Compact value display: Stat, StatusStat, EmptyState. */

export function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: ReactNode;
  tone?: 'accent' | 'success' | 'danger';
}) {
  return (
    <div className={cn('ui-stat')}>
      <strong className={cn(tone ? `ui-stat__value is-${tone}` : 'ui-stat__value')}>
        {value}
      </strong>
      <span className={cn('ui-stat__label')}>{label}</span>
    </div>
  );
}
