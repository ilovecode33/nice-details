import { describe, test } from '@rstest/core';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { WallImageSlot } from './WallImageSlot';

describe('WallImageSlot', () => {
  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<WallImageSlot src="/photos/one.jpg" className="photo" />);
  });
});
