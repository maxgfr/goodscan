/**
 * localStorage that never throws. Every project page of maxgfr.github.io shares one
 * origin, so one localStorage: another site can fill it, or the browser can block it.
 * A read then gives nothing, a write says whether it was kept.
 */
export function readItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
