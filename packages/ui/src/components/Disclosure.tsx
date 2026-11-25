import styles from './Disclosure.module.css';
import { disclosureReducer, disclosureSemantics, listSemantics } from '@ilovecode33/ui-core';
import { useId, useState, type ReactNode } from 'react';


/** Disclosure and List components backed by `ui-core` contracts. */
/* ── Disclosure ───────────────────────────────────────────────────────────── */

export function Disclosure({
  title,
  children,
  defaultOpen = false,
  open,
  onOpenChange,
}: {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internal, setInternal] = useState(defaultOpen);
  const current = open ?? internal;
  const semantics = disclosureSemantics({ open: current });
  const bodyId = useId();

  const toggle = () => {
    const next = disclosureReducer({ open: current }, { type: 'toggle' }).open;
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
  };

  return (
    <div className={styles['ui-disclosure']}>
      <button
        type="button"
        className={styles['ui-disclosure__trigger']}
        aria-expanded={semantics.expanded}
        aria-controls={bodyId}
        onClick={toggle}
      >
        <span>{title}</span>
        <span className={[styles['ui-disclosure__chevron'], styles[current ? 'is-open' : ''] || ''].filter(Boolean).join(' ')} aria-hidden="true">
          ⌄
        </span>
      </button>
      {current && (
        <div id={bodyId} className={styles['ui-disclosure__body']}>
          {children}
        </div>
      )}
    </div>
  );
}
