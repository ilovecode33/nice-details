import { beforeEach, describe, expect, test } from '@rstest/core';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';

import { AccentProvider } from './AccentProvider';
import { AccentSwitcher } from './AccentSwitcher';
import { ActionSheet } from './ActionSheet';
import { ActivityIndicator } from './ActivityIndicator';
import { AlertDialog } from './AlertDialog';
import { AspectImage } from './AspectImage';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Banner } from './Banner';
import { Button } from './Button';
import { Card } from './Card';
import { Carousel } from './Carousel';
import { Checkbox } from './Checkbox';
import { Chip } from './Chip';
import { DatePicker } from './DatePicker';
import { Deformable } from './Deformable';
import { Disclosure } from './Disclosure';
import { Divider } from './Divider';
import { DockNavigation } from './DockNavigation';
import { EmptyState } from './EmptyState';
import { Field } from './Field';
import { FloatingBar } from './FloatingBar';
import { FormField } from './FormField';
import { GlassSurface } from './GlassSurface';
import { List } from './List';
import { ListRow } from './ListRow';
import { NavBar } from './NavBar';
import { NumberField } from './NumberField';
import { PhotoGrid } from './PhotoGrid';
import { PhotoViewer } from './PhotoViewer';
import { Popover } from './Popover';
import { PressGlow } from './PressGlow';
import { ProgressBar } from './ProgressBar';
import { RadioGroup } from './RadioGroup';
import { Row } from './Row';
import { SearchBar } from './SearchBar';
import { Segmented } from './Segmented';
import { Select } from './Select';
import { Sheet } from './Sheet';
import { Skeleton } from './Skeleton';
import { SliderRow } from './SliderRow';
import { Stack } from './Stack';
import { Stat } from './Stat';
import { StatusStat } from './StatusStat';
import { Stepper } from './Stepper';
import { Switch } from './Switch';
import { TabBar } from './TabBar';
import { TextArea } from './TextArea';
import { TextInput } from './TextInput';
import { ThemeProvider } from './ThemeProvider';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Thumbnail } from './Thumbnail';
import { Toast } from './Toast';
import { UIFoundation } from './UIFoundation';
import { useAccent } from '../hooks/useAccent';
import { useTheme } from '../hooks/useTheme';

/**
 * Structural snapshots for every public component. These guard the rendered
 * markup — tags, roles, ARIA, data-ui slots and CSS Module class names — so an
 * accidental change is visible in the diff instead of slipping into a release.
 *
 * React's generated ids are replaced with a stable `ID` placeholder: they are
 * an implementation detail of the current render order, not component API.
 */
function expectSnapshot(element: ReactElement) {
  const { baseElement } = render(element);
  const clone = baseElement.cloneNode(true) as HTMLElement;
  for (const node of [clone, ...Array.from(clone.querySelectorAll('*'))]) {
    for (const attribute of Array.from(node.attributes)) {
      // React 19 emits `_r_2_`; older versions (or an identifierPrefix) emit
      // `«r2»` / `r2`. Normalize all three spellings.
      const normalized = attribute.value.replace(/_r_\d+_|«r\d+»|\br\d+\b/g, 'ID');
      if (normalized !== attribute.value) node.setAttribute(attribute.name, normalized);
    }
  }
  expect(clone).toMatchSnapshot();
}

const noop = () => {};

const items = [
  { id: 'a', title: 'First', alt: 'First' },
  { id: 'b', title: 'Second', alt: 'Second' },
];
const segments = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
];

function AccentProbe() {
  const { accent } = useAccent();
  return <span>{accent}</span>;
}

function ThemeProbe() {
  const { theme } = useTheme();
  return <span>{theme}</span>;
}

describe('component snapshots', () => {
  // Providers persist theme/accent/locale to storage; clear it so every
  // snapshot always renders the same defaults regardless of test order.
  beforeEach(() => {
    window.localStorage.clear();
    const root = document.documentElement;
    root.removeAttribute('data-theme');
    root.removeAttribute('data-accent');
    root.removeAttribute('lang');
    root.style.cssText = '';
  });

  test('AccentProvider', () => {
    expectSnapshot(
      <ThemeProvider>
        <AccentProvider>
          <AccentProbe />
        </AccentProvider>
      </ThemeProvider>,
    );
  });

  test('AccentSwitcher', () => {
    expectSnapshot(
      <UIFoundation>
        <AccentSwitcher labels={{ group: 'Accent color' }} />
      </UIFoundation>,
    );
  });

  test('ActionSheet', () => {
    expectSnapshot(
      <ActionSheet
        open
        title="Share"
        onClose={noop}
        actions={[{ label: 'Copy link', onSelect: noop }]}
      />,
    );
  });

  test('ActivityIndicator', () => {
    expectSnapshot(<ActivityIndicator label="Loading photos" />);
  });

  test('AlertDialog', () => {
    expectSnapshot(
      <AlertDialog
        open
        title="Delete"
        message="Are you sure?"
        onClose={noop}
        onConfirm={noop}
      />,
    );
  });

  test('AspectImage', () => {
    expectSnapshot(<AspectImage src="/photo.jpg" alt="Mountains" />);
  });

  test('Avatar', () => {
    expectSnapshot(<Avatar name="Ada Lovelace" />);
  });

  test('Badge', () => {
    expectSnapshot(<Badge tone="success">Live</Badge>);
  });

  test('Banner', () => {
    expectSnapshot(<Banner message="Saved" onDismiss={noop} />);
  });

  test('Button', () => {
    expectSnapshot(
      <Button variant="primary" size="compact" haloPortal>
        Save
      </Button>,
    );
  });

  test('Card', () => {
    expectSnapshot(
      <Card title="Album" subtitle="12 photos">
        <p>Content</p>
      </Card>,
    );
  });

  test('Carousel', () => {
    expectSnapshot(
      <Carousel
        items={[
          { id: 'a', alt: 'A' },
          { id: 'b', alt: 'B' },
        ]}
        index={0}
        onIndexChange={noop}
      />,
    );
  });

  test('Checkbox', () => {
    expectSnapshot(<Checkbox checked label="Private" onChange={noop} />);
  });

  test('Chip', () => {
    expectSnapshot(<Chip selected>Favorites</Chip>);
  });

  test('DatePicker', () => {
    expectSnapshot(<DatePicker aria-label="Start date" />);
  });

  test('Deformable', () => {
    expectSnapshot(
      <Deformable>
        <span>Content</span>
      </Deformable>,
    );
  });

  test('Disclosure', () => {
    expectSnapshot(
      <Disclosure title="Details">
        <p>Body</p>
      </Disclosure>,
    );
  });

  test('Divider', () => {
    expectSnapshot(<Divider />);
  });

  test('DockNavigation', () => {
    expectSnapshot(
      <DockNavigation
        label="Site navigation"
        items={[
          { id: 'posts', label: 'Posts', href: '/' },
          { id: 'about', label: 'About', href: '/about' },
        ]}
        activeId="posts"
      />,
    );
  });

  test('EmptyState', () => {
    expectSnapshot(<EmptyState title="No photos" detail="Try another album" />);
  });

  test('Field', () => {
    expectSnapshot(
      <Field label="Title" hint="Shown in the gallery">
        <input aria-label="Title" />
      </Field>,
    );
  });

  test('FloatingBar', () => {
    expectSnapshot(
      <FloatingBar label="Site navigation" collapsible collapsed={false} onCollapsedChange={noop}>
        <a href="/">Posts</a>
      </FloatingBar>,
    );
  });

  test('FormField', () => {
    expectSnapshot(
      <FormField label="Email" error="Required">
        <input aria-label="Email" />
      </FormField>,
    );
  });

  test('GlassSurface', () => {
    expectSnapshot(
      <GlassSurface>
        <span>Glass</span>
      </GlassSurface>,
    );
  });

  test('List', () => {
    expectSnapshot(<List items={items} selectedId="a" label="Albums" />);
  });

  test('ListRow', () => {
    expectSnapshot(
      <ul>
        <ListRow item={items[0]} onSelect={noop} />
      </ul>,
    );
  });

  test('NavBar', () => {
    expectSnapshot(<NavBar title="Album" onBack={noop} />);
  });

  test('NumberField', () => {
    expectSnapshot(<NumberField aria-label="Count" />);
  });

  test('PhotoGrid', () => {
    expectSnapshot(<PhotoGrid items={items} onOpen={noop} />);
  });

  test('PhotoViewer', () => {
    expectSnapshot(
      <PhotoViewer items={[{ id: 'a', alt: 'One' }]} index={0} onIndexChange={noop} onClose={noop} />,
    );
  });

  test('Popover', () => {
    expectSnapshot(
      <Popover open label="Info" onClose={noop}>
        <p>Body</p>
      </Popover>,
    );
  });

  test('PressGlow', () => {
    expectSnapshot(<PressGlow pulse={1} />);
  });

  test('ProgressBar', () => {
    expectSnapshot(<ProgressBar value={40} label="Upload" />);
  });

  test('RadioGroup', () => {
    expectSnapshot(
      <RadioGroup label="Range" options={segments} value="day" onChange={noop} />,
    );
  });

  test('Row', () => {
    expectSnapshot(
      <Row>
        <span>Item</span>
      </Row>,
    );
  });

  test('SearchBar', () => {
    expectSnapshot(<SearchBar value="cat" onChange={noop} onClear={noop} />);
  });

  test('Segmented', () => {
    expectSnapshot(
      <Segmented label="Range" value="day" onChange={noop} options={segments} />,
    );
  });

  test('Select', () => {
    expectSnapshot(
      <Select
        aria-label="Fruit"
        value="apple"
        options={[{ value: 'apple', label: 'Apple' }]}
        onChange={noop}
      />,
    );
  });

  test('Sheet', () => {
    expectSnapshot(
      <Sheet open title="Details" onClose={noop}>
        <p>Body</p>
      </Sheet>,
    );
  });

  test('Skeleton', () => {
    expectSnapshot(<Skeleton />);
  });

  test('SliderRow', () => {
    expectSnapshot(
      <SliderRow label="Volume" min={0} max={10} step={1} value={5} fmt={(v) => `${v}%`} onChange={noop} />,
    );
  });

  test('Stack', () => {
    expectSnapshot(
      <Stack gap="lg">
        <span>One</span>
        <span>Two</span>
      </Stack>,
    );
  });

  test('Stat', () => {
    expectSnapshot(<Stat label="Photos" value={12} />);
  });

  test('StatusStat', () => {
    expectSnapshot(<StatusStat label="Sync" value="OK" status="success" />);
  });

  test('Stepper', () => {
    expectSnapshot(<Stepper label="Quantity" value={3} onChange={noop} />);
  });

  test('Switch', () => {
    expectSnapshot(<Switch label="Wifi" checked={false} onChange={noop} />);
  });

  test('TabBar', () => {
    expectSnapshot(
      <TabBar
        label="Sections"
        items={[
          { value: 'a', label: 'First' },
          { value: 'b', label: 'Second' },
        ]}
        value="a"
        onChange={noop}
      />,
    );
  });

  test('TextArea', () => {
    expectSnapshot(<TextArea aria-label="Notes" />);
  });

  test('TextInput', () => {
    expectSnapshot(<TextInput aria-label="Name" />);
  });

  test('ThemeProvider', () => {
    expectSnapshot(
      <ThemeProvider defaultTheme="dark">
        <ThemeProbe />
      </ThemeProvider>,
    );
  });

  test('ThemeSwitcher', () => {
    expectSnapshot(
      <ThemeProvider>
        <ThemeSwitcher labels={{ group: 'Appearance', system: 'System', light: 'Light', dark: 'Dark' }} />
      </ThemeProvider>,
    );
  });

  test('Thumbnail', () => {
    expectSnapshot(<Thumbnail emoji="★" />);
  });

  test('Toast', () => {
    expectSnapshot(<Toast visible message="Saved" onDismiss={noop} />);
  });

  test('UIFoundation', () => {
    expectSnapshot(
      <UIFoundation>
        <span>App</span>
      </UIFoundation>,
    );
  });
});
