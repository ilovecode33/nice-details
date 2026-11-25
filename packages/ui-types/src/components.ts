import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react';
import type { Accent } from '@ilovecode33/ui-tokens';
import type { Theme } from './hooks';

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

export interface ThemeSwitcherLabels {
  group?: string;
  system?: string;
  light?: string;
  dark?: string;
}

export interface AccentSwitcherLabels {
  group?: string;
  warmth?: string;
  serenity?: string;
  growth?: string;
  gentle?: string;
  vitality?: string;
}

export interface UIFoundationProps {
  children: ReactNode;
  defaultTheme?: Theme;
  defaultAccent?: Accent;
  /** Controlled locale. */
  locale?: string;
  defaultLocale?: string;
  onLocaleChange?: (locale: string) => void;
  /** Active message map. */
  dictionary?: Record<string, string>;
  /** All locales keyed by locale name; resolved from `locale`. */
  dictionaries?: Record<string, Record<string, string>>;
  /** localStorage key for the locale. Empty string disables persistence. */
  localeStorageKey?: string;
  className?: string;
}

export interface ActionItem {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
}

export interface ListItem<T extends string = string> {
  id: T;
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  expandedContent?: ReactNode;
}

export interface DockItem {
  id: string;
  label: ReactNode;
  /** Renders an anchor instead of a button. */
  href?: string;
  icon?: ReactNode;
}

export interface DockNavigationHandle {
  toggle(): void;
  setCollapsed(collapsed: boolean): void;
}

export interface DockNavigationProps {
  items: readonly DockItem[];
  activeId?: string;
  /** Receives the click event so hosts can implement client-side navigation. */
  onSelect?: (id: string, event: ReactMouseEvent<HTMLElement>) => void;
  label?: string;
  collapsible?: boolean;
  /** Controlled collapse state. */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  collapseLabel?: string;
  expandLabel?: string;
  deform?: boolean;
  className?: string;
}

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SelectOption<T extends string = string> {
  value: T;
  /** May be a ReactNode, e.g. a color swatch plus text */
  label: ReactNode;
  disabled?: boolean;
  /** Visual element on the left of the option, e.g. a color example */
  leading?: ReactNode;
  /** Element on the right; defaults to ✓ when selected */
  trailing?: ReactNode;
  /** Plain text for screen readers when label is a ReactNode */
  textValue?: string;
}

export interface SelectChangeEvent<T extends string> {
  target: { value: T };
}

export interface SelectProps<T extends string = string> {
  options?: SelectOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (event: SelectChangeEvent<T>) => void;
  placeholder?: string;
  /** Alias for aria-label */
  label?: string;
  'aria-label'?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  /** Elastic drag feedback. Defaults to true. */
  deform?: boolean;
  /** Backward compatibility: <option> children */
  children?: ReactNode;
}

export interface RadioOption<T extends string = string> {
  value: T;
  label: string;
}

export interface TabItem<T extends string = string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
}

export interface PhotoItem {
  id: string;
  src?: string;
  alt: string;
  emoji?: ReactNode;
  style?: CSSProperties;
}
