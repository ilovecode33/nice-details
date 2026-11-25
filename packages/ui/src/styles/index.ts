import c0 from '../components/ActionSheet.module.css';
import c1 from '../components/ActivityIndicator.module.css';
import c2 from '../components/AlertDialog.module.css';
import c3 from '../components/AspectImage.module.css';
import c4 from '../components/Avatar.module.css';
import c5 from '../components/Badge.module.css';
import c6 from '../components/Banner.module.css';
import c7 from '../components/Button.module.css';
import c8 from '../components/Card.module.css';
import c9 from '../components/Carousel.module.css';
import c10 from '../components/Checkbox.module.css';
import c11 from '../components/Chip.module.css';
import c12 from '../components/DatePicker.module.css';
import c13 from '../components/Deformable.module.css';
import c14 from '../components/Disclosure.module.css';
import c15 from '../components/Divider.module.css';
import c16 from '../components/DockNavigation.module.css';
import c17 from '../components/EmptyState.module.css';
import c18 from '../components/Field.module.css';
import c19 from '../components/FloatingBar.module.css';
import c20 from '../components/FormField.module.css';
import c21 from '../components/GlassSurface.module.css';
import c22 from '../components/List.module.css';
import c23 from '../components/ListRow.module.css';
import c24 from '../components/NavBar.module.css';
import c25 from '../components/NumberField.module.css';
import c26 from '../components/PhotoGrid.module.css';
import c27 from '../components/PhotoViewer.module.css';
import c28 from '../components/Popover.module.css';
import c29 from '../components/PressGlow.module.css';
import c30 from '../components/ProgressBar.module.css';
import c31 from '../components/RadioGroup.module.css';
import c32 from '../components/Row.module.css';
import c33 from '../components/SearchBar.module.css';
import c34 from '../components/Segmented.module.css';
import c35 from '../components/Select.module.css';
import c36 from '../components/Sheet.module.css';
import c37 from '../components/Skeleton.module.css';
import c38 from '../components/SliderRow.module.css';
import c39 from '../components/Stack.module.css';
import c40 from '../components/Stat.module.css';
import c41 from '../components/StatusStat.module.css';
import c42 from '../components/Stepper.module.css';
import c43 from '../components/Switch.module.css';
import c44 from '../components/TabBar.module.css';
import c45 from '../components/TextArea.module.css';
import c46 from '../components/TextInput.module.css';
import c47 from '../components/ThemeSwitcher.module.css';
import c48 from '../components/Thumbnail.module.css';
import c49 from '../components/Toast.module.css';
import c50 from '../components/UIFoundation.module.css';
import c51 from './base.module.css';
import c52 from './console.module.css';
import c53 from './utilities.module.css';

const classes: Record<string,string> = {
  ...c0,
  ...c1,
  ...c2,
  ...c3,
  ...c4,
  ...c5,
  ...c6,
  ...c7,
  ...c8,
  ...c9,
  ...c10,
  ...c11,
  ...c12,
  ...c13,
  ...c14,
  ...c15,
  ...c16,
  ...c17,
  ...c18,
  ...c19,
  ...c20,
  ...c21,
  ...c22,
  ...c23,
  ...c24,
  ...c25,
  ...c26,
  ...c27,
  ...c28,
  ...c29,
  ...c30,
  ...c31,
  ...c32,
  ...c33,
  ...c34,
  ...c35,
  ...c36,
  ...c37,
  ...c38,
  ...c39,
  ...c40,
  ...c41,
  ...c42,
  ...c43,
  ...c44,
  ...c45,
  ...c46,
  ...c47,
  ...c48,
  ...c49,
  ...c50,
  ...c51,
  ...c52,
  ...c53,
};

/** Map space-separated class names through the CSS Modules for public `cn()`. */
export function cn(names: string): string {
  return names
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => classes[name] ?? name)
    .join(' ');
}
