const LAST_EVENT_MS: Record<string, number> = {};

/**
 * Prevents event storms when many requests fail at once.
 */
export const emitThrottledWindowEvent = (
  name: string,
  detail: Record<string, unknown>,
  throttleMs: number
) => {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  const last = LAST_EVENT_MS[name] ?? 0;
  if (now - last < throttleMs) return;
  LAST_EVENT_MS[name] = now;
  window.dispatchEvent(new CustomEvent(name, { detail }));
};
