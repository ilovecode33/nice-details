export * from './types';
export * from './toggle';
export * from './selection';
export * from './disclosure';
export * from './sheet';
export * from './field';
export * from './list';
export * from './feedback';
export * from './media';
export * from './navigation';
export * from './floating';
export * from './deform';

import { disclosureContract } from './disclosure';
import { feedbackContract } from './feedback';
import { fieldContract } from './field';
import { floatingContract } from './floating';
import { deformContract } from './deform';
import { listContract } from './list';
import { mediaContract, selectionModeContract } from './media';
import { navigationContract } from './navigation';
import { selectionContract } from './selection';
import { sheetContract } from './sheet';
import { toggleContract } from './toggle';
import type { PortableComponent } from './types';

/** Every portable component contract, keyed by its React name. */
export const PORTABLE_COMPONENTS: Record<string, PortableComponent<unknown, unknown>> = {
  Switch: toggleContract,
  Select: selectionContract,
  Disclosure: disclosureContract,
  Sheet: sheetContract,
  FormField: fieldContract,
  List: listContract,
  'Toast / Banner': feedbackContract,
  PhotoViewer: mediaContract,
  SelectionMode: selectionModeContract,
  TabBar: navigationContract,
  FloatingBar: floatingContract,
  Deformable: deformContract,
} as Record<string, PortableComponent<unknown, unknown>>;
