import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  computeFrameLightingMulti,
  computeWallGlows,
  formatFrameShadow,
  formatWallGlow,
  DEFAULT_LIGHT,
  DEFAULT_WALL_PARAMS,
  type FrameKind,
  type VirtualLight,
} from '@ilovecode33/photo-wall';
import { Button, Segmented, SliderRow, useLocale } from '@ilovecode33/ui';

/** The sandbox stage is one wall tile; its aspect feeds the light solver. */
const STAGE_ASPECT = 4 / 3;
const FRAME_WIDTH = 22;

interface DemoFrame {
  id: string;
  x: number;
  y: number;
  z: number;
  kind: FrameKind;
  glyph: string;
}

interface DemoLight extends VirtualLight {
  id: string;
}

type DragTarget = { type: 'light' | 'frame'; id: string };

const INITIAL_LIGHTS: DemoLight[] = [
  { ...DEFAULT_LIGHT, id: 'l1', x: 20, y: 12, glowColor: '255, 244, 214' },
  {
    ...DEFAULT_LIGHT,
    id: 'l2',
    x: 50,
    y: 10,
    z: 480,
    radius: 38,
    intensity: 0.65,
    glowColor: '214, 232, 255',
  },
  {
    ...DEFAULT_LIGHT,
    id: 'l3',
    x: 80,
    y: 16,
    z: 420,
    radius: 30,
    intensity: 0.5,
    glowColor: '255, 224, 196',
  },
];

const INITIAL_FRAMES: DemoFrame[] = [
  { id: 'a', x: 20, y: 64, z: 56, kind: 'walnut', glyph: '◒' },
  { id: 'b', x: 50, y: 30, z: 28, kind: 'oak', glyph: '✿' },
  { id: 'c', x: 80, y: 62, z: 76, kind: 'black', glyph: '≈' },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * A small sandbox for the Photo Wall's virtual lights. The stage is exactly one
 * wall tile, so tile/stage percentages line up with the library's coordinate
 * systems and the solver can be used without any mapping layer.
 */
export function PhotoWallDemo() {
  const { t } = useLocale();
  const stageRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<DragTarget | null>(null);
  const [lights, setLights] = useState<DemoLight[]>(INITIAL_LIGHTS);
  const [frames, setFrames] = useState<DemoFrame[]>(INITIAL_FRAMES);
  const [selectedFrameId, setSelectedFrameId] = useState(INITIAL_FRAMES[0].id);
  const [selectedLightId, setSelectedLightId] = useState(INITIAL_LIGHTS[0].id);

  const selectedFrame = frames.find((item) => item.id === selectedFrameId) ?? frames[0];
  const frameIndex = frames.indexOf(selectedFrame);
  const selectedLight = lights.find((item) => item.id === selectedLightId) ?? lights[0];
  const lightIndex = lights.indexOf(selectedLight);

  const lightingFor = (item: DemoFrame, index: number) =>
    computeFrameLightingMulti({
      frame: {
        x: item.x,
        y: item.y,
        w: FRAME_WIDTH,
        ratio: 1.3,
        frame: item.kind,
        z: item.z,
        tilt: 0,
      },
      geometry: { widthPct: FRAME_WIDTH, yPct: item.y, ratio: 1.3 },
      lights,
      params: DEFAULT_WALL_PARAMS,
      aspect: STAGE_ASPECT,
      jitter: 0.35 + index * 0.15,
    });

  const selectedLighting = lightingFor(selectedFrame, frameIndex);
  const selectedShadow = selectedLighting.shadows[lightIndex];

  const move = (target: DragTarget, x: number, y: number) => {
    if (target.type === 'light') {
      setLights((current) =>
        current.map((item) =>
          item.id === target.id
            ? { ...item, x: clamp(x, 3, 97), y: clamp(y, 3, 97) }
            : item,
        ),
      );
      return;
    }
    setFrames((current) =>
      current.map((item) =>
        item.id === target.id
          ? { ...item, x: clamp(x, 12, 88), y: clamp(y, 12, 88) }
          : item,
      ),
    );
  };

  const positionFromPointer = (event: ReactPointerEvent) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    };
  };

  const isDragging = (target: DragTarget) => {
    const active = dragging.current;
    return !!active && active.type === target.type && active.id === target.id;
  };

  const onPointerDown = (target: DragTarget) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic or unsupported pointer capture; dragging still works.
    }
    dragging.current = target;
    if (target.type === 'frame') setSelectedFrameId(target.id);
    else setSelectedLightId(target.id);
    const position = positionFromPointer(event);
    if (position) move(target, position.x, position.y);
  };

  const onPointerMove = (target: DragTarget) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isDragging(target)) return;
    const position = positionFromPointer(event);
    if (position) move(target, position.x, position.y);
  };

  const onPointerUp = () => {
    dragging.current = null;
  };

  const onKeyDown = (target: DragTarget) => (event: ReactKeyboardEvent<HTMLButtonElement>) => {
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
    const current =
      target.type === 'light'
        ? lights.find((item) => item.id === target.id)
        : frames.find((item) => item.id === target.id);
    if (!current) return;
    move(target, current.x + delta[0], current.y + delta[1]);
  };

  const handleProps = (target: DragTarget) => ({
    onPointerDown: onPointerDown(target),
    onPointerMove: onPointerMove(target),
    onPointerUp: onPointerUp,
    onPointerCancel: onPointerUp,
    onKeyDown: onKeyDown(target),
  });

  const updateSelectedFrame = (patch: Partial<DemoFrame>) => {
    setFrames((current) =>
      current.map((item) => (item.id === selectedFrame.id ? { ...item, ...patch } : item)),
    );
  };

  const updateSelectedLight = (patch: Partial<DemoLight>) => {
    setLights((current) =>
      current.map((item) => (item.id === selectedLight.id ? { ...item, ...patch } : item)),
    );
  };

  // cqw is 1% of the stage width; converting the vertical offset to a
  // percentage of the stage height multiplies by the stage aspect.
  const rays = lights.flatMap((light, index) => {
    const shadow = selectedLighting.shadows[index];
    return [
      { x1: light.x, y1: light.y, x2: selectedFrame.x, y2: selectedFrame.y },
      {
        x1: selectedFrame.x,
        y1: selectedFrame.y,
        x2: selectedFrame.x + shadow.shadowX,
        y2: selectedFrame.y + shadow.shadowY * STAGE_ASPECT,
      },
    ];
  });

  return (
    <div className="pw-demo">
      <p className="pw-demo__hint" id="pw-demo-hint">
        {t('photoWall.hint')}
      </p>

      <div
        className="pw-demo__stage"
        ref={stageRef}
        style={
          {
            aspectRatio: STAGE_ASPECT,
            backgroundImage: `${formatWallGlow(computeWallGlows(lights))}, linear-gradient(160deg, #f6efe1, #e4d9c6 70%, #cdbfa8)`,
          } as CSSProperties
        }
      >
        <svg
          className="pw-demo__rays"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {rays.map((ray, index) => (
            <line key={index} {...ray} />
          ))}
        </svg>

        {frames.map((item, index) => {
          const lighting = lightingFor(item, index);
          return (
            <div
              key={item.id}
              className="pw-demo__frame"
              data-kind={item.kind}
              style={
                {
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  width: `${FRAME_WIDTH}%`,
                  boxShadow: formatFrameShadow(lighting.shadows),
                  '--pw-light': lighting.highlight,
                } as CSSProperties
              }
            >
              <span className="pw-demo__rail pw-demo__rail--top" aria-hidden="true" />
              <span className="pw-demo__rail pw-demo__rail--right" aria-hidden="true" />
              <span className="pw-demo__rail pw-demo__rail--bottom" aria-hidden="true" />
              <span className="pw-demo__rail pw-demo__rail--left" aria-hidden="true" />
              <div className="pw-demo__mat">
                <div className="pw-demo__photo" aria-label={t('photoWall.frameLabel')} role="img">
                  {item.glyph}
                </div>
              </div>
              <button
                type="button"
                className={`pw-demo__handle pw-demo__grip ${item.id === selectedFrame.id ? 'is-selected' : ''}`}
                aria-label={`${t('photoWall.frameHandle')} ${index + 1}`}
                aria-describedby="pw-demo-hint"
                {...handleProps({ type: 'frame', id: item.id })}
              >
                ✥
              </button>
            </div>
          );
        })}

        {lights.map((item, index) => {
          const color = item.glowColor ?? '255, 250, 236';
          return (
            <button
              key={item.id}
              type="button"
              className={`pw-demo__handle pw-demo__light ${item.id === selectedLight.id ? 'is-selected' : ''}`}
              style={
                {
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  '--pw-light-color': color,
                } as CSSProperties
              }
              aria-label={`${t('photoWall.lightHandle')} ${index + 1}`}
              aria-describedby="pw-demo-hint"
              {...handleProps({ type: 'light', id: item.id })}
            >
              <span className="pw-demo__light-core" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <div className="pw-demo__controls">
        <div className="pw-demo__selectors">
          <Segmented
            label={t('photoWall.selectedFrame')}
            value={selectedFrameId}
            onChange={setSelectedFrameId}
            options={frames.map((item, index) => ({
              value: item.id,
              label: `${t('photoWall.frame')} ${index + 1}`,
            }))}
          />
          <Segmented
            label={t('photoWall.selectedLight')}
            value={selectedLightId}
            onChange={setSelectedLightId}
            options={lights.map((item, index) => ({
              value: item.id,
              label: `${t('photoWall.light')} ${index + 1}`,
            }))}
          />
        </div>
        <SliderRow
          label={t('photoWall.frameDepth')}
          min={8}
          max={84}
          step={4}
          value={selectedFrame.z}
          fmt={(value) => `${value}px`}
          onChange={(z) => updateSelectedFrame({ z })}
        />
        <SliderRow
          label={t('photoWall.lightHeight')}
          min={200}
          max={1200}
          step={50}
          value={selectedLight.z}
          fmt={(value) => `${value}px`}
          onChange={(z) => updateSelectedLight({ z })}
        />
        <SliderRow
          label={t('photoWall.lightSize')}
          min={12}
          max={96}
          step={4}
          value={selectedLight.radius}
          fmt={(value) => `${value}cqw`}
          onChange={(radius) => updateSelectedLight({ radius })}
        />
        <div className="pw-demo__footer">
          <span className="pw-demo__readout">
            {t('photoWall.readout')}: {selectedShadow.shadowX.toFixed(1)} /{' '}
            {selectedShadow.shadowY.toFixed(1)} · {selectedShadow.shadowBlur.toFixed(1)}
          </span>
          <Button
            variant="secondary"
            onClick={() => {
              setLights(INITIAL_LIGHTS);
              setFrames(INITIAL_FRAMES);
              setSelectedFrameId(INITIAL_FRAMES[0].id);
              setSelectedLightId(INITIAL_LIGHTS[0].id);
            }}
          >
            {t('photoWall.reset')}
          </Button>
        </div>
      </div>
    </div>
  );
}
