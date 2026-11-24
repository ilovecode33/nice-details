/**
 * Anchor-positioned interaction halo.
 *
 * A child's `box-shadow` is clipped by any ancestor with `overflow: auto`.
 * Rendering the glow on `document.body` escapes the clip, and CSS Anchor
 * Positioning keeps it glued to the source element's live geometry — scroll,
 * resize and drag transforms are all tracked by the browser, with no JS
 * position listener. The source stays in the DOM, so focus, Tab order, forms
 * and event bubbling are unaffected.
 *
 * Requires CSS Anchor Positioning (Chrome/Edge 125+, Safari 27+). The caller
 * opts in with `Button`'s `haloPortal` prop.
 */

import { type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { cn } from './css';

export interface AnchorHaloProps {
  /** Unique dashed-ident matching the source element's `anchor-name`. */
  anchorName: string;
  /** Show the halo only while true (hover or active). */
  visible: boolean;
  /** Two-layer glow colours. */
  color?: string;
  softColor?: string;
}

/** Render the glow on document.body, tethered to an element via CSS anchors. */
export function AnchorHalo({
  anchorName,
  visible,
  color,
  softColor,
}: AnchorHaloProps) {
  if (typeof document === 'undefined' || !visible) return null;

  const style = {
    position: 'fixed',
    positionAnchor: anchorName,
    top: 'anchor(top)',
    left: 'anchor(left)',
    width: 'anchor-size(width)',
    height: 'anchor-size(height)',
    '--halo-near': color ?? 'var(--btn-glow)',
    '--halo-far': softColor ?? 'var(--btn-glow-soft)',
  } as CSSProperties;

  return createPortal(
    <span className={cn('ui-anchor-halo')} style={style} aria-hidden="true" />,
    document.body,
  );
}
