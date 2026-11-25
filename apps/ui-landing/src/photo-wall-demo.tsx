import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  DEFAULT_LIGHT,
  DEFAULT_WALL_PARAMS,
  PhotoWall,
  type VirtualLight,
  type WallParams,
} from '@ilovecode33/photo-wall';
import '@ilovecode33/photo-wall/styles.css';
import { Button, Segmented, SliderRow, useLocale } from '@ilovecode33/ui';

/** A square stage gives a taller canvas: lights above, framed prints below. */
const STAGE_ASPECT = 1;

/** Frames stay in the lower band so the upper area is free for the lights. */
const WALL_PARAMS: WallParams = {
  ...DEFAULT_WALL_PARAMS,
  count: 3,
  safeTop: 52,
  safeBottom: 96,
  verticalJitter: 2,
  maxFrameHeight: 38,
  minFrameHeight: 18,
};

interface DemoLight extends VirtualLight {
  id: string;
}

const INITIAL_LIGHTS: DemoLight[] = [
  { ...DEFAULT_LIGHT, id: 'l1', x: 30, y: 10, glowColor: '255, 244, 214' },
  {
    ...DEFAULT_LIGHT,
    id: 'l2',
    x: 50,
    y: 8,
    z: 480,
    radius: 38,
    intensity: 0.65,
    glowColor: '214, 232, 255',
  },
  {
    ...DEFAULT_LIGHT,
    id: 'l3',
    x: 70,
    y: 12,
    z: 420,
    radius: 30,
    intensity: 0.5,
    glowColor: '255, 224, 196',
  },
];

function artwork(from: string, to: string, accent: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="460"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="640" height="460" fill="url(#g)"/><circle cx="180" cy="150" r="120" fill="${accent}" opacity="0.45"/><circle cx="470" cy="330" r="170" fill="${accent}" opacity="0.22"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const PHOTOS = [
  artwork('#2b5876', '#4e4376', '#f7d08a'),
  artwork('#b23a0a', '#ff9a76', '#ffe6b0'),
  artwork('#1d6b4f', '#8fd694', '#f3e6b3'),
  artwork('#6a1b9a', '#c4a8f0', '#ffe0e0'),
  artwork('#8a6a00', '#d7ff5f', '#fff4c2'),
  artwork('#16324f', '#5a7d00', '#e8f0a0'),
].map((src, index) => ({ id: `p${index}`, src, width: 640, height: 460 }));

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Light x is tile-percent; a tile is 1.64× the stage and starts at -32%. */
const lightToStageX = (x: number) => 1.64 * x - 32;
const stageXToLight = (x: number) => (x + 32) / 1.64;

/**
 * The real Photo Wall renderer with a few lights layered on top. Frames are
 * generated and panned by the library, so the demo uses exactly the same
 * rails, mat, wood grain, lighting and shadows as the fullscreen display.
 */
export function PhotoWallDemo() {
  const { t } = useLocale();
  const stageRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<string | null>(null);
  const [lights, setLights] = useState<DemoLight[]>(INITIAL_LIGHTS);
  const [selectedLightId, setSelectedLightId] = useState(INITIAL_LIGHTS[0].id);
  const [params, setParams] = useState<WallParams>(WALL_PARAMS);

  const selectedLight = lights.find((item) => item.id === selectedLightId) ?? lights[0];

  const moveLight = (id: string, stageX: number, stageY: number) => {
    setLights((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              x: clamp(stageXToLight(stageX), 5, 95),
              y: clamp(stageY, 2, 42),
            }
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

  const onPointerDown = (id: string) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic or unsupported pointer capture; dragging still works.
    }
    dragging.current = id;
    setSelectedLightId(id);
    const position = positionFromPointer(event);
    if (position) moveLight(id, position.x, position.y);
  };

  const onPointerMove = (id: string) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragging.current !== id) return;
    const position = positionFromPointer(event);
    if (position) moveLight(id, position.x, position.y);
  };

  const onPointerUp = () => {
    dragging.current = null;
  };

  const onKeyDown = (id: string) => (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 2 : 1;
    const deltas: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const delta = deltas[event.key];
    if (!delta) return;
    event.preventDefault();
    moveLight(id, lightToStageX(selectedLight.x) + delta[0] * 1.64, selectedLight.y + delta[1]);
  };

  const updateSelectedLight = (patch: Partial<DemoLight>) => {
    setLights((current) =>
      current.map((item) => (item.id === selectedLight.id ? { ...item, ...patch } : item)),
    );
  };

  return (
    <div className="pw-demo">
      <p className="pw-demo__hint" id="pw-demo-hint">
        {t('photoWall.hint')}
      </p>

      <div
        className="pw-demo__stage"
        ref={stageRef}
        style={{ aspectRatio: STAGE_ASPECT } as CSSProperties}
      >
        <PhotoWall
          images={PHOTOS}
          params={params}
          seed={7}
          lights={lights}
          speed={2}
          playing
        />

        {lights.map((item, index) => {
          const color = item.glowColor ?? '255, 250, 236';
          return (
            <button
              key={item.id}
              type="button"
              className={`pw-demo__handle pw-demo__light ${item.id === selectedLight.id ? 'is-selected' : ''}`}
              style={
                {
                  left: `${clamp(lightToStageX(item.x), 2, 98)}%`,
                  top: `${item.y}%`,
                  '--pw-light-color': color,
                } as CSSProperties
              }
              aria-label={`${t('photoWall.lightHandle')} ${index + 1}`}
              aria-describedby="pw-demo-hint"
              onPointerDown={onPointerDown(item.id)}
              onPointerMove={onPointerMove(item.id)}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={onKeyDown(item.id)}
            >
              <span className="pw-demo__light-core" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <div className="pw-demo__controls">
        <Segmented
          label={t('photoWall.selectedLight')}
          value={selectedLightId}
          onChange={setSelectedLightId}
          options={lights.map((item, index) => ({
            value: item.id,
            label: `${t('photoWall.light')} ${index + 1}`,
          }))}
        />
        <SliderRow
          label={t('photoWall.frameDepth')}
          min={8}
          max={120}
          step={4}
          value={params.zMax}
          fmt={(value) => `${value}px`}
          onChange={(zMax) => setParams((current) => ({ ...current, zMax }))}
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
          <span className="pw-demo__readout">{t('photoWall.readout')}: {lights.length}</span>
          <Button
            variant="secondary"
            onClick={() => {
              setLights(INITIAL_LIGHTS);
              setParams(WALL_PARAMS);
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
