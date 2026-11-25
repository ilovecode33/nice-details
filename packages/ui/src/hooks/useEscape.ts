import { useEffect } from 'react';

/**
 * Call `onClose` on document-level Escape keydowns while `active` is true.
 * The listener is added only for the active period and removed on cleanup;
 * it does not prevent default or stop propagation.
 */
export function useEscape(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active, onClose]);
}
