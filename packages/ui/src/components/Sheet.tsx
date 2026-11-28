import buttonClasses from './Button.module.css';
import styles from './Sheet.module.css';
import {
  createSheetMachine,
  sheetSemantics,
  type SheetMachineContext,
  type SheetMachineEvent,
} from '@ilovecode33/ui-core';
import type { SheetPhase } from '@ilovecode33/ui-types';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type AnimationEvent as ReactAnimationEvent,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type TransitionEvent as ReactTransitionEvent,
} from 'react';
import { X } from 'lucide-react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const BODY_DRAG_SLOP = 6;
const PHASE_FALLBACK_MS = 300;
const sheetMachine = createSheetMachine();

function isDesktopViewport(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(min-width: 768px)').matches
  );
}

function hasScrollableAncestor(target: EventTarget | null, boundary: HTMLElement): boolean {
  let node = target instanceof Element ? target : null;
  while (node && node !== boundary) {
    if (node.scrollHeight > node.clientHeight && node.scrollTop > 0) {
      return true;
    }
    node = node.parentElement;
  }
  return false;
}

/**
 * Modal sheet rendering a scrim, panel, title, close button, and children.
 * Controlled by `open`; the scrim, close button, and Escape call `onClose`.
 * Focus moves to the close button on open and is restored on close.
 * `title` and `closeLabel` come from props; the close label defaults to English.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  style,
  closeLabel = 'Close',
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
  closeLabel?: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const bodyTouchRef = useRef<{
    id: number;
    startX: number;
    startY: number;
    startTime: number;
    panelHeight: number;
    active: boolean;
  } | null>(null);
  const onCloseRef = useRef(onClose);
  const reducedMotion = usePrefersReducedMotion();
  const reducedMotionRef = useRef(reducedMotion);
  onCloseRef.current = onClose;
  reducedMotionRef.current = reducedMotion;

  const machineRef = useRef<{ state: SheetPhase; context: SheetMachineContext } | null>(null);
  if (machineRef.current === null) {
    const initialContext = sheetMachine.createContext();
    machineRef.current = open
      ? sheetMachine.transition('closed', initialContext, { type: 'open', reducedMotion })
      : { state: 'closed', context: initialContext };
  }
  const [phase, setPhase] = useState<SheetPhase>(machineRef.current.state);

  const clearDragStyles = useCallback(() => {
    panelRef.current?.style.removeProperty('--sheet-drag-y');
    sheetRef.current?.style.removeProperty('--sheet-scrim-opacity');
  }, []);

  const dispatch = useCallback((event: SheetMachineEvent) => {
    const current = machineRef.current!;
    const next = sheetMachine.transition(current.state, current.context, event);
    machineRef.current = next;
    if (next.state !== current.state) {
      setPhase(next.state);
    }
    return next;
  }, []);

  useEffect(() => {
    const current = machineRef.current!.state;
    if (open && current === 'closed') {
      dispatch({ type: 'open', reducedMotion: reducedMotionRef.current });
    } else if (!open && current !== 'closed') {
      dispatch({ type: 'close' });
      clearDragStyles();
    }
  }, [open, dispatch, clearDragStyles]);

  useEffect(() => {
    if (phase === 'open' || phase === 'closed') {
      clearDragStyles();
    }
  }, [phase, clearDragStyles]);

  useEffect(() => {
    if (phase !== 'opening' && phase !== 'settling' && phase !== 'closing') return;
    const timer = window.setTimeout(() => {
      if (phase === 'opening') {
        dispatch({ type: 'entered' });
      } else if (phase === 'settling') {
        dispatch({ type: 'settled' });
      } else if (phase === 'closing') {
        dispatch({ type: 'exited' });
        onCloseRef.current();
      }
    }, PHASE_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [phase, dispatch]);

  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const previousRootOverflow = root.style.overflow;
    const previousBody = {
      left: body.style.left,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
      position: body.style.position,
      right: body.style.right,
      top: body.style.top,
      width: body.style.width,
    };
    const scrollbarWidth =
      root.clientWidth > 0 ? Math.max(0, window.innerWidth - root.clientWidth) : 0;
    const bodyPaddingRight = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;

    root.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${bodyPaddingRight + scrollbarWidth}px`;
    }

    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.left = previousBody.left;
      body.style.overflow = previousBody.overflow;
      body.style.paddingRight = previousBody.paddingRight;
      body.style.position = previousBody.position;
      body.style.right = previousBody.right;
      body.style.top = previousBody.top;
      body.style.width = previousBody.width;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      restoreRef.current?.focus();
    };
  }, [open]);

  const applyDragStyles = useCallback((offset: number, panelHeight: number) => {
    const sheet = sheetRef.current;
    const panel = panelRef.current;
    if (!panel) return;
    panel.style.setProperty('--sheet-drag-y', `${offset}px`);
    if (sheet) {
      const opacity = Math.max(0.25, 1 - (offset / Math.max(1, panelHeight)) * 0.75);
      sheet.style.setProperty('--sheet-scrim-opacity', String(opacity));
    }
  }, []);

  const finishDrag = useCallback(
    (y: number, time: number, cancelled: boolean) => {
      const next = cancelled
        ? dispatch({ type: 'dragCancel', reducedMotion: reducedMotionRef.current })
        : dispatch({ type: 'dragEnd', y, time, reducedMotion: reducedMotionRef.current });

      if (next.state === 'closed') {
        clearDragStyles();
        onCloseRef.current();
      } else if (next.state === 'open') {
        clearDragStyles();
      }
    },
    [dispatch, clearDragStyles],
  );

  useEffect(() => {
    const body = bodyRef.current;
    if (!open || !body) return;

    const onTouchStart = (event: TouchEvent) => {
      const currentPhase = machineRef.current!.state;
      if (
        event.touches.length !== 1 ||
        currentPhase === 'closing' ||
        currentPhase === 'closed' ||
        isDesktopViewport() ||
        body.scrollTop > 0 ||
        hasScrollableAncestor(event.target, body)
      ) {
        bodyTouchRef.current = null;
        return;
      }

      const panel = panelRef.current;
      if (!panel) return;

      const touch = event.touches[0];
      bodyTouchRef.current = {
        id: touch.identifier,
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: event.timeStamp,
        panelHeight: panel.getBoundingClientRect().height,
        active: false,
      };
    };

    const onTouchMove = (event: TouchEvent) => {
      const state = bodyTouchRef.current;
      if (!state) return;

      const touch = Array.from(event.touches).find((item) => item.identifier === state.id);
      if (!touch) return;

      const dx = touch.clientX - state.startX;
      const dy = touch.clientY - state.startY;

      if (!state.active) {
        if (Math.hypot(dx, dy) < BODY_DRAG_SLOP) return;
        if (dy <= 0 || Math.abs(dx) > dy || body.scrollTop > 0) {
          bodyTouchRef.current = null;
          return;
        }
        const entered = dispatch({
          type: 'dragStart',
          startY: state.startY,
          startTime: state.startTime,
          panelHeight: state.panelHeight,
        });
        if (entered.state !== 'dragging') {
          bodyTouchRef.current = null;
          return;
        }
        state.active = true;
      }

      event.preventDefault();
      const moved = dispatch({ type: 'dragMove', y: touch.clientY });
      applyDragStyles(moved.context.offset, moved.context.panelHeight);
    };

    const onTouchEnd = (event: TouchEvent) => {
      const state = bodyTouchRef.current;
      if (!state) return;

      const touch = Array.from(event.changedTouches).find((item) => item.identifier === state.id);
      if (!touch) return;

      bodyTouchRef.current = null;
      if (!state.active) return;

      finishDrag(touch.clientY, event.timeStamp, event.type === 'touchcancel');
    };

    body.addEventListener('touchstart', onTouchStart, { passive: true });
    body.addEventListener('touchmove', onTouchMove, { passive: false });
    body.addEventListener('touchend', onTouchEnd, { passive: true });
    body.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      bodyTouchRef.current = null;
      body.removeEventListener('touchstart', onTouchStart);
      body.removeEventListener('touchmove', onTouchMove);
      body.removeEventListener('touchend', onTouchEnd);
      body.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [open, dispatch, applyDragStyles, finishDrag]);

  const onHandlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    const currentPhase = machineRef.current!.state;
    if (
      !event.isPrimary ||
      event.button !== 0 ||
      currentPhase === 'closing' ||
      currentPhase === 'closed' ||
      isDesktopViewport() ||
      (event.target as HTMLElement).closest('button')
    ) {
      return;
    }

    const panel = panelRef.current;
    if (!panel) return;

    const panelHeight = panel.getBoundingClientRect().height;
    const next = dispatch({
      type: 'dragStart',
      startY: event.clientY,
      startTime: event.timeStamp,
      panelHeight,
    });
    if (next.state !== 'dragging') return;

    activePointerIdRef.current = event.pointerId;
    applyDragStyles(0, panelHeight);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const onHandlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (activePointerIdRef.current !== event.pointerId) return;
    if (machineRef.current!.state !== 'dragging') return;

    const next = dispatch({ type: 'dragMove', y: event.clientY });
    applyDragStyles(next.context.offset, next.context.panelHeight);
  };

  const onHandlePointerEnd = (
    event: ReactPointerEvent<HTMLElement>,
    cancelled = false,
  ) => {
    if (activePointerIdRef.current !== event.pointerId) return;

    activePointerIdRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    finishDrag(event.clientY, event.timeStamp, cancelled);
  };

  const onPanelAnimationEnd = (event: ReactAnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && machineRef.current!.state === 'opening') {
      dispatch({ type: 'entered' });
    }
  };

  const onPanelTransitionEnd = (event: ReactTransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== 'transform') return;
    const currentPhase = machineRef.current!.state;
    if (currentPhase === 'closing') {
      dispatch({ type: 'exited' });
      onCloseRef.current();
    } else if (currentPhase === 'settling') {
      dispatch({ type: 'settled' });
    }
  };

  if (!open) return null;
  const semantics = sheetSemantics({ presented: open }, typeof title === 'string' ? title : undefined);
  return (
    <div
      ref={sheetRef}
      className={styles['ui-sheet']}
      data-phase={phase}
      role={semantics.role}
      aria-modal={semantics.modal}
      aria-label={semantics.label}
    >
      <div className={styles['ui-sheet__scrim']} onClick={() => onCloseRef.current()} />
      <div
        ref={panelRef}
        className={styles['ui-sheet__panel']}
        style={style}
        onAnimationEnd={onPanelAnimationEnd}
        onTransitionEnd={onPanelTransitionEnd}
      >
        <div
          className={styles['ui-sheet__grabber']}
          aria-hidden="true"
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerEnd}
          onPointerCancel={(event) => onHandlePointerEnd(event, true)}
        />
        <header
          className={styles['ui-sheet__head']}
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerEnd}
          onPointerCancel={(event) => onHandlePointerEnd(event, true)}
        >
          <h2>{title}</h2>
          <button
            ref={closeRef}
            type="button"
            className={[buttonClasses['ui-btn'], buttonClasses['ui-btn--plain'], buttonClasses['ui-btn--compact']].filter(Boolean).join(' ')}
            aria-label={closeLabel}
            onClick={onClose}
          >
            <span className={buttonClasses['ui-btn__icon']} aria-hidden="true">
              <X />
            </span>
          </button>
        </header>
        <div ref={bodyRef} className={styles['ui-sheet__body']}>{children}</div>
      </div>
    </div>
  );
}
