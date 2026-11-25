/** Compact value display: Stat, StatusStat, EmptyState. */
import { Check, Minus, X } from 'lucide-react';
import { type ReactNode } from 'react';
import classes from './styles/display.module.css';
import { createCn } from './css';
const cn = createCn(classes);

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

/**
 * Status colors are fixed (green = success, red = failure) and never follow
 * the decorative mood accent — success must be recognizable in every mood.
 */
export function StatusStat({
  label,
  value,
  status,
}: {
  label: string;
  value: ReactNode;
  status: 'success' | 'danger' | 'neutral';
}) {
  const icon =
    status === 'success' ? <Check /> : status === 'danger' ? <X /> : <Minus />;
  return (
    <div className={cn('ui-status-stat')}>
      <span className={cn(`ui-status-stat__value is-${status}`)}>
        <span className={cn('ui-status-stat__icon')} aria-hidden="true">
          {icon}
        </span>
        {value}
      </span>
      <span className={cn('ui-status-stat__label')}>{label}</span>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  detail,
}: {
  icon?: ReactNode;
  title: string;
  detail?: string;
}) {
  return (
    <div className={cn('ui-empty')}>
      {icon && (
        <div className={cn('ui-empty__icon')} aria-hidden="true">
          {icon}
        </div>
      )}
      <p className={cn('ui-empty__title')}>{title}</p>
      {detail && <p className={cn('ui-empty__detail')}>{detail}</p>}
    </div>
  );
}
