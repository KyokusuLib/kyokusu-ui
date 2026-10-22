let idCounter = 0;

/**
 * Generates a stable, collision-free id.
 * Math.random()-based ids may collide and differ between server and client,
 * which breaks hydration and aria-* references.
 */
export function createId(prefix = 'k'): string {
  idCounter += 1;
  return `${prefix}-${idCounter.toString(36)}`;
}
