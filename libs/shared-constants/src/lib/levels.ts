export const MAX_LEVEL = 50;

const BASE_XP = 100;
const GROWTH = 1.35;

/**
 * Cumulative XP required to reach each level (index = level).
 * Index 0 unused. Index 1 = 0 (starting level).
 */
export const LEVEL_TABLE: readonly number[] = buildLevelTable();

function buildLevelTable(): readonly number[] {
  const table: number[] = [0, 0];
  for (let level = 2; level <= MAX_LEVEL; level += 1) {
    const previous = table[level - 1];
    const increment = Math.floor(BASE_XP * Math.pow(GROWTH, level - 2));
    table.push(previous + increment);
  }
  return Object.freeze(table);
}

export function computeLevel(xp: number): number {
  if (xp < 0) {
    return 1;
  }
  for (let level = MAX_LEVEL; level >= 1; level -= 1) {
    if (xp >= LEVEL_TABLE[level]) {
      return level;
    }
  }
  return 1;
}

export function xpForLevel(level: number): number {
  const clamped = Math.min(Math.max(level, 1), MAX_LEVEL);
  return LEVEL_TABLE[clamped];
}

export function xpToNext(level: number): number {
  if (level >= MAX_LEVEL) {
    return 0;
  }
  return LEVEL_TABLE[level + 1] - LEVEL_TABLE[level];
}

export function xpInCurrentLevel(xp: number): number {
  const level = computeLevel(xp);
  return xp - LEVEL_TABLE[level];
}
