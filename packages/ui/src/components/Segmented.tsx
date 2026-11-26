import type { SegmentOption } from '@ilovecode33/ui-types';
import styles from './Segmented.module.css';
import { tabSemantics } from '@ilovecode33/ui-core';
import type { CSSProperties } from 'react';
import { useSegmentPillDrag } from '../hooks/useSegmentPillDrag';

/**
 * iOS-style segmented control rendering a measured pill over option buttons.
 * Controlled through `value`/`onChange`; slot geometry is measured in a layout
 * effect so the pill mounts at its final size and snaps on drag release.
 * Only the selected pill is draggable; arrow/Home/End keys change selection.
 * Option labels and the optional `label` are supplied by props.
 *
 * The drag engine lives in `useSegmentPillDrag`: the outer pill is a static
 * seat that only owns the slot `left`/`width`, while a persistent inner layer
 * owns the whole visible pill. `translate` carries the damped follow and
 * useDeform's `transform` supplies scale/elastic feedback on that same layer, so
 * the two compose instead of cancelling. Releases are re-based against the new
 * seat so a drag that ends on the last slot never jumps or rebounds.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  deform = true,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
  deform?: boolean;
}) {
  const {
    trackRef,
    thumbRef,
    shiftRef,
    slots,
    activeIndex,
    dragging,
    settling,
    hoveredIndex,
    setHoveredIndex,
    glow,
    handlers,
    thumbStyle,
    shiftStyle,
  } = useSegmentPillDrag({
    values: options.map((option) => option.value),
    value,
    onChange,
    isDisabled: (index) => Boolean(options[index]?.disabled),
    deform,
  });

  const hovered = hoveredIndex !== null && hoveredIndex === activeIndex;
  const dataUi = dragging
    ? 'segmented__thumb segmented__thumb--dragging'
    : settling
      ? 'segmented__thumb segmented__thumb--settling'
      : 'segmented__thumb';

  return (
    <div
      ref={trackRef}
      className={styles['ui-segmented']}
      role="tablist"
      aria-label={label}
      {...handlers}
    >
      {slots && (
        <div
          ref={thumbRef}
          className={styles['ui-segmented__thumb']}
          data-ui={dataUi}
          style={thumbStyle}
        >
          <div
            ref={shiftRef}
            className={styles['ui-segmented__thumb-shift']}
            data-ui="segmented__thumb-shift"
            style={shiftStyle}
          >
            <span
              className={[styles['ui-segmented__sheen'], styles[glow.held ? 'is-held' : ''] || '', styles[hovered ? 'is-hovered' : ''] || ''].filter(Boolean).join(' ')}
              aria-hidden="true"
            />
            <span
              className={[styles['ui-segmented__spot'], styles[glow.held ? 'is-held' : ''] || ''].filter(Boolean).join(' ')}
              style={
                {
                  '--seg-glow-x': `${glow.x}%`,
                  '--seg-glow-y': `${glow.y}%`,
                } as CSSProperties
              }
              aria-hidden="true"
            />
          </div>
        </div>
      )}
      {options.map((o, index) => {
        const semantics = tabSemantics(o, value);
        return (
          <button
            key={o.value}
            type="button"
            role={semantics.role}
            data-index={index}
            data-active={value === o.value}
            aria-selected={semantics.selected}
            aria-disabled={semantics.disabled || undefined}
            aria-label={semantics.label}
            tabIndex={o.value === value ? 0 : -1}
            className={[styles['ui-segmented__item'], styles[value === o.value ? 'is-active' : ''] || ''].filter(Boolean).join(' ')}
            onPointerEnter={() => setHoveredIndex(index)}
            onPointerLeave={() => setHoveredIndex(null)}
            onClick={() => {
              if (o.disabled) return;
              // Just slide the pill to the target. No press bloom: the hover
              // state already lights the pill the moment the pointer is over
              // the now-active slot, so there is no delayed highlight.
              onChange(o.value);
            }}
            onKeyDown={(event) => {
              const current = options.findIndex((item) => item.value === value);
              let next: number | undefined;
              if (event.key === 'ArrowRight') next = (current + 1) % options.length;
              if (event.key === 'ArrowLeft') next = (current - 1 + options.length) % options.length;
              if (event.key === 'Home') next = 0;
              if (event.key === 'End') next = options.length - 1;
              if (next === undefined) return;
              event.preventDefault();
              const option = options[next];
              if (option && !option.disabled) onChange(option.value);
            }}
          >
            {o.icon && <span aria-hidden="true">{o.icon}</span>}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
