import baseClasses from './base.module.css';
import buttonClasses from './button.module.css';
import layoutClasses from './layout.module.css';
import segmentedClasses from './segmented.module.css';
import controlsClasses from './controls.module.css';
import selectClasses from './select.module.css';
import displayClasses from './display.module.css';
import sheetClasses from './sheet.module.css';
import consoleClasses from './console.module.css';
import themeClasses from './theme.module.css';
import utilitiesClasses from './utilities.module.css';
import navigationClasses from './navigation.module.css';
import listClasses from './list.module.css';
import formsClasses from './forms.module.css';
import feedbackClasses from './feedback.module.css';
import mediaClasses from './media.module.css';
import motionClasses from './motion.module.css';
import floatingClasses from './floating.module.css';
import dockClasses from './dock.module.css';

/** Merged class table for the public `cn` used by consuming apps. */
const classes: Record<string, string> = {
  ...baseClasses,
  ...buttonClasses,
  ...layoutClasses,
  ...segmentedClasses,
  ...controlsClasses,
  ...selectClasses,
  ...displayClasses,
  ...sheetClasses,
  ...consoleClasses,
  ...themeClasses,
  ...utilitiesClasses,
  ...navigationClasses,
  ...listClasses,
  ...formsClasses,
  ...feedbackClasses,
  ...mediaClasses,
  ...motionClasses,
  ...floatingClasses,
  ...dockClasses,
};

/**
 * Map space-separated class names through the CSS Modules. Unknown names are
 * kept as-is, so app-level global classes can still be passed by consumers.
 */
export function cn(names: string): string {
  return names
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => classes[name] ?? name)
    .join(' ');
}
