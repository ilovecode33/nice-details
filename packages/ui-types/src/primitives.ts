import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

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

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  padded?: boolean;
}
