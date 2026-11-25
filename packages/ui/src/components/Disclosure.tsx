import styles from './Disclosure.module.css';
import { disclosureReducer, disclosureSemantics } from '@ilovecode33/ui-core';
import { useId, useState, type ReactNode } from 'react';

/**
 * Renders a disclosure that toggles its content, backed by `DisclosureState`.
 * Controlled when `open` is provided; otherwise it keeps internal state seeded by
 * `defaultOpen`. `onOpenChange` reports the next value in both modes. The body is
 * mounted only while open and linked to the trigger via `aria-controls`/`aria-expanded`.
 */

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

  /**
   * Derives the next open state via `disclosureReducer`; internal state is updated only
   * when uncontrolled, while `onOpenChange` receives the next value in every mode.
   */
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
