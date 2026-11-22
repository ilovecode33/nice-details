import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  computeFrameLighting,
  DEFAULT_LIGHT,
  DEFAULT_WALL_PARAMS,
  type VirtualLight,
  type WallFrame,
} from '@ilovecode33/photo-wall';
import { Button, SliderRow, useLocale } from '@ilovecode33/ui';

const STAGE_ASPECT = 16 / 9;
const FRAME_WIDTH = 24;

const INITIAL_LIGHT: VirtualLight = {
  x: 76,
  y: 18,
  z: 600,
  radius: 48,
  intensity: 1,
};
const INITIAL_FRAME = { x: 32, y: 54, z: 56 };

type Handle = 'light' | 'frame';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * A small sandbox for the Photo Wall's virtual light. The stage is exactly one
 * wall tile, so tile/stage percentages line up with the library's coordinate
 * systems and the solver can be used without any mapping layer.
 */
export function PhotoWallDemo() {
  const { t } = useLocale();
  const stageRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<Handle | null>(null);
  const [light, setLight] = useState<VirtualLight>(INITIAL_LIGHT);
  const [frame, setFrame] = useState(INITIAL_FRAME);

  const frameModel: WallFrame = {
    x: frame.x,
    y: frame.y,
    w: FRAME_WIDTH,
    ratio: 1.3,
    frame: 'walnut',
    z: frame.z,
    tilt: 0,
  };
  const lighting = computeFrameLighting({
    frame: frameModel,
    geometry: { widthPct: FRAME_WIDTH, yPct: frame.y, ratio: 1.3 },
    light,
    params: DEFAULT_WALL_PARAMS,
    aspect: STAGE_ASPECT,
    jitter: 0.5,
  });

  const move = (handle: Handle, x: number, y: number) => {
    if (handle === 'light') setLight((current) => ({ ...current, x, y }));
    else setFrame((current) => ({ ...current, x, y }));
  };

  const positionFromPointer = (event: ReactPointerEvent) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * 100, 2, 98),
      y: clamp(((event.clientY - rect.top) / rect.height) * 100, 2, 98),
    };
  };

  const onPointerDown = (handle: Handle) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic or unsupported pointer capture; dragging still works.
    }
    dragging.current = handle;
    const position = positionFromPointer(event);
    if (position) move(handle, position.x, position.y);
  };

  const onPointerMove = (handle: Handle) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragging.current !== handle) return;
    const position = positionFromPointer(event);
    if (position) move(handle, position.x, position.y);
  };

  const onPointerUp = () => {
    dragging.current = null;
  };

  const onKeyDown = (handle: Handle) => (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 10 : 2;
    const deltas: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const delta = deltas[event.key];
    if (!delta) return;
    event.preventDefault();
    const current = handle === 'light' ? light : frame;
    move(
      handle,
      clamp(current.x + delta[0], 2, 98),
      clamp(current.y + delta[1], 2, 98),
    );
  };

  const handleProps = (handle: Handle) => ({
    onPointerDown: onPointerDown(handle),
    onPointerMove: onPointerMove(handle),
    onPointerUp: onPointerUp,
    onPointerCancel: onPointerUp,
    onKeyDown: onKeyDown(handle),
  });

  // cqw is 1% of the stage width; converting the vertical offset to a
  // percentage of the stage height multiplies by the stage aspect.
  const shadowCenterX = frame.x + lighting.shadowX;
  const shadowCenterY = frame.y + lighting.shadowY * STAGE_ASPECT;

  return (
    <div className="pw-demo">
      <p className="pw-demo__hint" id="pw-demo-hint">
        {t('photoWall.hint')}
      </p>

      <div
        className="pw-demo__stage"
        ref={stageRef}
        style={{
          '--pw-glow-x': `${light.x}%`,
          '--pw-glow-y': `${light.y}%`,
        } as CSSProperties}
      >
        <svg
          className="pw-demo__rays"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line x1={light.x} y1={light.y} x2={frame.x} y2={frame.y} />
          <line
            x1={frame.x}
            y1={frame.y}
            x2={shadowCenterX}
            y2={shadowCenterY}
          />
        </svg>

        <div
          className="pw-demo__frame"
          style={{
            left: `${frame.x}%`,
            top: `${frame.y}%`,
            '--pw-sx': lighting.shadowX,
            '--pw-sy': lighting.shadowY,
            '--pw-sb': lighting.shadowBlur,
            '--pw-sp': lighting.shadowSpread,
            '--pw-sa': lighting.shadowAlpha,
            '--pw-light': lighting.highlight,
          } as CSSProperties}
        >
          <span className="pw-demo__rail pw-demo__rail--top" aria-hidden="true" />
          <span className="pw-demo__rail pw-demo__rail--right" aria-hidden="true" />
          <span className="pw-demo__rail pw-demo__rail--bottom" aria-hidden="true" />
          <span className="pw-demo__rail pw-demo__rail--left" aria-hidden="true" />
          <div className="pw-demo__mat">
            <div className="pw-demo__photo" aria-label={t('photoWall.frameLabel')} role="img">
              ◒
            </div>
          </div>
          <button
            type="button"
            className="pw-demo__handle pw-demo__grip"
            aria-label={t('photoWall.frameHandle')}
            aria-describedby="pw-demo-hint"
            {...handleProps('frame')}
          >
            ✥
          </button>
        </div>

        <button
          type="button"
          className="pw-demo__handle pw-demo__light"
          style={{ left: `${light.x}%`, top: `${light.y}%` }}
          aria-label={t('photoWall.lightHandle')}
          aria-describedby="pw-demo-hint"
          {...handleProps('light')}
        >
          <span className="pw-demo__light-core" aria-hidden="true" />
        </button>
      </div>

      <div className="pw-demo__controls">
        <SliderRow
          label={t('photoWall.frameDepth')}
          min={8}
          max={84}
          step={4}
          value={frame.z}
          fmt={(value) => `${value}px`}
          onChange={(z) => setFrame((current) => ({ ...current, z }))}
        />
        <SliderRow
          label={t('photoWall.lightHeight')}
          min={200}
          max={1200}
          step={50}
          value={light.z}
          fmt={(value) => `${value}px`}
          onChange={(z) => setLight((current) => ({ ...current, z }))}
        />
        <SliderRow
          label={t('photoWall.lightSize')}
          min={12}
          max={96}
          step={4}
          value={light.radius}
          fmt={(value) => `${value}cqw`}
          onChange={(radius) => setLight((current) => ({ ...current, radius }))}
        />
        <div className="pw-demo__footer">
          <span className="pw-demo__readout">
            {t('photoWall.readout')}: {lighting.shadowX.toFixed(1)} /{' '}
            {lighting.shadowY.toFixed(1)} · {lighting.shadowBlur.toFixed(1)}
          </span>
          <Button
            variant="secondary"
            onClick={() => {
              setLight(INITIAL_LIGHT);
              setFrame(INITIAL_FRAME);
            }}
          >
            {t('photoWall.reset')}
          </Button>
        </div>
      </div>
    </div>
  );
}
