import type { ButtonProps } from '@ilovecode33/ui-types';
export type { ButtonProps } from '@ilovecode33/ui-types';
import styles from './Button.module.css';
import { createPortal } from 'react-dom';
import { useId, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import { useDeform } from '../hooks/useDeform';



/** The Button, including its clipping-safe portalled halo. */

/* ── Button ──────────────────────────────────────────────────────────────── */
export function Button({
  variant = 'secondary',
  size = 'default',
  icon,
  block,
  deform = true,
  haloPortal = false,
  className = '',
  style,
  children,
  ...rest
}: ButtonProps) {
  // Buttons keep vertical page scrolling; horizontal drags still deform them.
  const motion = useDeform({ enabled: deform, touchAction: 'pan-y' });
  // A unique dashed-ident per button so multiple portalled buttons never bind
  // to the same anchor. useId() contains ':' which is invalid in an ident.
  const anchorName = `--btn-halo-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`;
  const classes = [styles['ui-btn'], styles[`ui-btn--${variant}`], styles[`ui-btn--${size}`], styles[block ? 'ui-btn--block' : ''] || '', styles[haloPortal ? 'ui-btn--portal' : ''] || '', className].filter(Boolean).join(' ');

  const content = (
    <>
      {icon && (
        <span className={styles['ui-btn__icon']} aria-hidden="true">
          {icon}
        </span>
      )}
      {children && <span>{children}</span>}
    </>
  );

  if (haloPortal && typeof document !== 'undefined') {
    // The whole button (not just its shadow) lives on document.body, so the
    // button and its glow always move together — even when dragged past the
    // scroll container's edge. A transparent placeholder holds the layout slot
    // and is the anchor the button is tethered to via CSS Anchor Positioning.
    const button = (
      <button
        type="button"
        className={classes}
        style={
          {
            position: 'fixed',
            positionAnchor: anchorName,
            top: 'anchor(top)',
            left: 'anchor(left)',
            width: 'anchor-size(width)',
            height: 'anchor-size(height)',
            ...motion.style,
            ...style,
          } as CSSProperties
        }
        {...rest}
        {...motion.handlers}
      >
        {content}
      </button>
    );
    return (
      <>
        <span
          className={styles['ui-btn-placeholder']}
          style={{ anchorName } as CSSProperties}
          aria-hidden="true"
        />
        {createPortal(button, document.body)}
      </>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      style={{ ...motion.style, ...style }}
      {...rest}
      {...motion.handlers}
    >
      {content}
    </button>
  );
}
