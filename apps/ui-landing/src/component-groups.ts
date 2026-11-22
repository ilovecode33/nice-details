import type { TranslationKey } from './i18n';

/**
 * Single source of truth for the component index and the demo cards.
 * The table of contents and the group titles are both rendered from this list,
 * so they cannot drift apart. Each `components` entry must have a matching
 * `component-<slug>` anchor in the corresponding demo card.
 */
export interface ComponentGroup {
  readonly id: string;
  readonly title: TranslationKey;
  readonly subtitle: TranslationKey;
  readonly components: readonly string[];
}

export const COMPONENT_GROUPS: readonly ComponentGroup[] = [
  {
    id: 'button',
    title: 'component.button',
    subtitle: 'demo.button.subtitle',
    components: ['Button'],
  },
  {
    id: 'layout',
    title: 'toc.layout',
    subtitle: 'demo.layout.subtitle',
    components: ['Card', 'Stack / Row', 'Divider'],
  },
  {
    id: 'display',
    title: 'toc.display',
    subtitle: 'demo.display.subtitle',
    components: ['Stat', 'StatusStat', 'Badge', 'EmptyState'],
  },
  {
    id: 'selection',
    title: 'toc.selection',
    subtitle: 'demo.selection.subtitle',
    components: [
      'Segmented',
      'Switch',
      'Select',
      'SliderRow',
      'Checkbox',
      'RadioGroup',
      'Chip',
      'Stepper',
    ],
  },
  {
    id: 'forms',
    title: 'toc.forms',
    subtitle: 'demo.forms.subtitle',
    components: [
      'Field',
      'TextInput',
      'FormField',
      'TextArea',
      'NumberField',
      'SearchBar',
      'DatePicker',
    ],
  },
  {
    id: 'navigation',
    title: 'toc.navigation',
    subtitle: 'demo.navigation.subtitle',
    components: ['NavBar', 'TabBar', 'List', 'ListRow', 'Disclosure'],
  },
  {
    id: 'overlays',
    title: 'toc.overlays',
    subtitle: 'demo.overlays.subtitle',
    components: ['Sheet', 'ActionSheet', 'AlertDialog', 'Popover'],
  },
  {
    id: 'feedback',
    title: 'toc.feedback',
    subtitle: 'demo.feedback.subtitle',
    components: ['Toast', 'Banner', 'ActivityIndicator', 'Skeleton', 'ProgressBar'],
  },
  {
    id: 'floating',
    title: 'toc.floating',
    subtitle: 'demo.floating.subtitle',
    components: ['GlassSurface', 'FloatingBar', 'DockNavigation', 'Deformable'],
  },
  {
    id: 'media',
    title: 'toc.media',
    subtitle: 'demo.media.subtitle',
    components: [
      'AspectImage',
      'Thumbnail',
      'Avatar',
      'PhotoGrid',
      'PhotoViewer',
      'Carousel',
    ],
  },
  {
    id: 'photoWall',
    title: 'toc.photoWall',
    subtitle: 'demo.photoWall.subtitle',
    components: ['PhotoWall', 'VirtualLight'],
  },
] as const;

export function componentAnchor(name: string): string {
  return `component-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

export function group(id: string): ComponentGroup {
  const found = COMPONENT_GROUPS.find((item) => item.id === id);
  if (!found) throw new Error(`Unknown component group: ${id}`);
  return found;
}
