const STORAGE_KEY = 'okr-web.device-name';

function platformName(): string {
  if (typeof navigator === 'undefined') return 'Device';
  const ua = navigator.userAgent;
  if (/iPhone|iPod/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (
    /Macintosh|Mac OS X/.test(ua) &&
    typeof navigator.maxTouchPoints === 'number' &&
    navigator.maxTouchPoints > 1
  ) {
    return 'iPad';
  }
  if (/Android/.test(ua)) return 'Android';
  if (/Macintosh|Mac OS X/.test(ua)) return 'Mac';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Device';
}

function browserName(): string {
  if (typeof navigator === 'undefined') return 'Browser';
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return 'Edge';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua)) return 'Safari';
  return 'Browser';
}

/** A readable default such as "Mac · Chrome" or "iPhone · Safari". */
export function defaultDeviceName(): string {
  return `${platformName()} · ${browserName()}`;
}

/** Reads the saved device name, falling back to the platform default. */
export function loadDeviceName(): string {
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim() || defaultDeviceName();
  } catch {
    return defaultDeviceName();
  }
}

/** Persists the device name used in pairing signals. */
export function saveDeviceName(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch {
    /* Storage can be unavailable in private or restricted contexts. */
  }
}
