import {
  LEVEL_TABLE,
  MAX_LEVEL,
  computeLevel,
  xpForLevel,
  xpInCurrentLevel,
  xpToNext,
} from './levels';

describe('levels', () => {
  it('starts at level 1 with 0 xp', () => {
    expect(computeLevel(0)).toBe(1);
    expect(LEVEL_TABLE[1]).toBe(0);
  });

  it('is monotonically increasing', () => {
    for (let level = 2; level <= MAX_LEVEL; level += 1) {
      expect(LEVEL_TABLE[level]).toBeGreaterThan(LEVEL_TABLE[level - 1]);
    }
  });

  it('computes the correct level for boundary xp values', () => {
    const level5Xp = xpForLevel(5);
    expect(computeLevel(level5Xp)).toBe(5);
    expect(computeLevel(level5Xp - 1)).toBe(4);
  });

  it('caps at MAX_LEVEL', () => {
    expect(computeLevel(LEVEL_TABLE[MAX_LEVEL] + 999_999)).toBe(MAX_LEVEL);
    expect(xpToNext(MAX_LEVEL)).toBe(0);
  });

  it('returns 0 xpInCurrentLevel exactly when leveling up', () => {
    const xp = xpForLevel(10);
    expect(xpInCurrentLevel(xp)).toBe(0);
  });

  it('treats negative xp as level 1', () => {
    expect(computeLevel(-50)).toBe(1);
  });
});
