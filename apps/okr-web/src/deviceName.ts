/** Friendly adjective and animal pools for a device's first name. */
const ADJECTIVES = [
  'Amber',
  'Brave',
  'Breezy',
  'Cosmic',
  'Gentle',
  'Golden',
  'Lucky',
  'Mellow',
  'Nimble',
  'Quiet',
  'Rapid',
  'Sunny',
  'Velvet',
  'Witty',
] as const;

const ANIMALS = [
  'Badger',
  'Falcon',
  'Koala',
  'Lynx',
  'Marmot',
  'Narwhal',
  'Otter',
  'Owl',
  'Panda',
  'Puffin',
  'Quokka',
  'Robin',
  'Seal',
  'Wombat',
] as const;

function pick<T>(values: readonly T[]): T {
  const bytes = new Uint8Array(1);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    bytes[0] = Math.floor(Math.random() * 256);
  }
  return values[bytes[0] % values.length] as T;
}

/**
 * A memorable first name such as "Sunny Otter" instead of a platform label.
 * The app stores it on first launch, so it stays stable across visits.
 */
export function randomDeviceName(): string {
  return `${pick(ADJECTIVES)} ${pick(ANIMALS)}`;
}
