import classes from './EmptyState.module.css';
import { Check, Minus, X } from 'lucide-react';
import { type ReactNode } from 'react';
import { createCn } from '../css';

const cn = createCn(classes);

/** Compact value display: Stat, StatusStat, EmptyState. */
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
