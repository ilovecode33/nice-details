import { describe, expect, test } from '@rstest/core';
import { render } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { PhotoWall, type PhotoWallProps } from './PhotoWall';

const images = [
  { src: '/photos/one.jpg', width: 1200, height: 800 },
  { src: '/photos/two.jpg', width: 800, height: 1200 },
  { src: '/photos/three.jpg', width: 1000, height: 1000 },
  { src: '/photos/four.jpg', width: 1600, height: 900 },
];

const props: PhotoWallProps = {
  images,
  seed: 1234,
  viewportAspect: 16 / 9,
  playing: false,
};

describe('PhotoWall', () => {
  test('renders a framed photo for every tile position in both mirrored passes', () => {
    const { container } = render(<PhotoWall {...props} />);
    // Two generated tiles × four frames per tile × two mirrored passes.
    expect(container.querySelectorAll('[data-wall-frame]')).toHaveLength(16);
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<PhotoWall {...props} />);
  });
});
