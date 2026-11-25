import styles from './Button.module.css';
import { createPortal } from 'react-dom';
import { useId, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import { useDeform } from './Deformable';


/** The Button, including its clipping-safe portalled halo. */

/* ── Button ──────────────────────────────────────────────────────────────── */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'plain';
  size?: 'default' | 'compact';
  icon?: ReactNode;
  block?: boolean;
  /** Directional press/drag deformation. Disabled automatically under reduced motion. */
  deform?: boolean;
  /**
   * Render the button on document.body with CSS Anchor Positioning so neither
   * the button nor its glow is clipped by a scrolling ancestor. A transparent
   * placeholder keeps the layout slot and acts as the anchor. Requires
   * anchor-positioning browser support.
   */
  haloPortal?: boolean;
}

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