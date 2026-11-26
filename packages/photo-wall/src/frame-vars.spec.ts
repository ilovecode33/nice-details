import { describe, expect, test } from '@rstest/core';
import { frameVars } from './frame-vars';
import type { FrameGeometry } from './geometry';
import type { WallFrame, WallStyle } from './tiles';

const frame: WallFrame = {
  x: 12,
  y: 30,
  w: 24,
  ratio: 1.5,
  frame: 'oak',
  z: 8,
  tilt: -1.5,
};

const style: WallStyle = {
  wood: '#573620',
  matTop: '#f4efe8',
  matBottom: '#d8cec0',
  railScale: 1.25,
  sheen: 0.6,
  grainJitter: 2,
  lightJitter: 0.4,
};

const geometry: FrameGeometry = { widthPct: 24, yPct: 42, ratio: 1.5 };

describe('frameVars', () => {
  test('maps frame, style, geometry and lighting to the frame CSS variables', () => {
    const vars = frameVars(frame, style, geometry, '0 1px 2px rgba(0,0,0,0.4)', 0.75);

    expect(vars).toMatchObject({
      '--x': '12%',
      '--y': '42%',
      '--w': '24%',
      '--ratio': '1.5',
      '--z': '8px',
      '--tilt': '-1.5deg',
      '--wood': '#573620',
      '--mat-a': '#f4efe8',
      '--mat-b': '#d8cec0',
      '--sheen': '0.60',
      '--grain-jitter': '2deg',
      '--light': '0.75',
      boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
    });
    expect((vars as Record<string, string>)['--rail']).toBe(
      'calc(clamp(10px, 1.5vw, 26px) * 1.25)',
    );
  });
});
