import { XP_PER_LEVEL } from './constants';

/**
 * Level metadata for the member journey.
 *
 * XP itself stays linear (300 XP per level) so existing XP and task gates keep
 * working. Everything visual and reward-related lives here so the journey,
 * badges and game read from one source of truth.
 */
export const LEVELS = [
  {
    level: 1,
    name: 'Spark Starter',
    tagline: 'The first flicker of momentum.',
    perk: 'XP Match: 3 daily runs',
    bonusVE: 100,
    tone: 'blue',
    from: '#8aa5ff',
    to: '#3f5bd9',
    glow: '#5f7dff',
    ink: '#e4ecff',
    emblem: 'spark',
    ornament: 'seed',
  },
  {
    level: 2,
    name: 'Loop Explorer',
    tagline: 'You know your way around the loop.',
    perk: 'Bronze profile ring',
    bonusVE: 250,
    tone: 'mint',
    from: '#5ff0c6',
    to: '#0f9c86',
    glow: '#38e0b0',
    ink: '#dcfff6',
    emblem: 'compass',
    ornament: 'seed',
  },
  {
    level: 3,
    name: 'Pulse Seeker',
    tagline: 'Chasing the next signal.',
    perk: 'Silver badge finish',
    bonusVE: 500,
    tone: 'amber',
    from: '#ffd27d',
    to: '#c47a10',
    glow: '#f7b955',
    ink: '#fff3d6',
    emblem: 'bolt',
    ornament: 'spark',
  },
  {
    level: 4,
    name: 'Momentum Maker',
    tagline: 'Small wins are becoming a habit.',
    perk: 'Animated badge aura',
    bonusVE: 800,
    tone: 'violet',
    from: '#c4b5ff',
    to: '#6d3df0',
    glow: '#8b6cff',
    ink: '#f0ebff',
    emblem: 'rocket',
    ornament: 'spark',
  },
  {
    level: 5,
    name: 'Orbit Builder',
    tagline: 'Your routine is in orbit.',
    perk: 'Exclusive Level 5 campaigns',
    bonusVE: 1200,
    tone: 'sky',
    from: '#8fd4ff',
    to: '#1f6fd1',
    glow: '#57b7ff',
    ink: '#e4f5ff',
    emblem: 'orbit',
    ornament: 'orbit',
  },
  {
    level: 6,
    name: 'Signal Master',
    tagline: 'You read the loop like a map.',
    perk: '+1 XP Match run per day',
    bonusVE: 1600,
    tone: 'rose',
    from: '#ffa8b8',
    to: '#c22a51',
    glow: '#ff7088',
    ink: '#ffe9ee',
    emblem: 'crown',
    ornament: 'laurel',
  },
  {
    level: 7,
    name: 'Vault Keeper',
    tagline: 'Rewards follow through.',
    perk: 'Gold badge finish',
    bonusVE: 2000,
    tone: 'emerald',
    from: '#8af0c4',
    to: '#087a5b',
    glow: '#34d399',
    ink: '#ddfff3',
    emblem: 'shield',
    ornament: 'laurel',
  },
  {
    level: 8,
    name: 'Nova Strategist',
    tagline: 'You play the long game.',
    perk: 'Nova profile frame',
    bonusVE: 2500,
    tone: 'fuchsia',
    from: '#f0a8ff',
    to: '#9b1fbd',
    glow: '#e879f9',
    ink: '#fdeaff',
    emblem: 'gem',
    ornament: 'orbit',
  },
  {
    level: 9,
    name: 'Zenith Pilot',
    tagline: 'High orbit, steady hands.',
    perk: '+1 XP Match run per day',
    bonusVE: 3000,
    tone: 'orange',
    from: '#ffc48f',
    to: '#c2560c',
    glow: '#fb923c',
    ink: '#fff0e2',
    emblem: 'flame',
    ornament: 'wings',
  },
  {
    level: 10,
    name: 'Legend of the Loop',
    tagline: 'A name the loop remembers.',
    perk: 'Legendary badge wings',
    bonusVE: 4000,
    tone: 'gold',
    from: '#fff0a3',
    to: '#c58a06',
    glow: '#fde047',
    ink: '#fffbe2',
    emblem: 'trophy',
    ornament: 'wings',
  },
  {
    level: 11,
    name: 'Cosmic Curator',
    tagline: 'Collector of rare signals.',
    perk: 'Cosmic particle trail',
    bonusVE: 5000,
    tone: 'cyan',
    from: '#b6f4ff',
    to: '#0b8fb0',
    glow: '#67e8f9',
    ink: '#e9fdff',
    emblem: 'infinity',
    ornament: 'halo',
  },
  {
    level: 12,
    name: 'VELoop Immortal',
    tagline: 'The loop bends around you.',
    perk: 'Immortal crown & aura',
    bonusVE: 7500,
    tone: 'prism',
    from: '#fff7d6',
    to: '#e4a10d',
    glow: '#ffe27a',
    ink: '#fffdf2',
    emblem: 'star',
    ornament: 'halo',
  },
];

export const MAX_LEVEL = LEVELS.length;

export function levelMeta(level = 1) {
  return LEVELS[Math.min(MAX_LEVEL, Math.max(1, level)) - 1];
}

export function levelRange(level) {
  if (level >= MAX_LEVEL) return `${(MAX_LEVEL - 1) * XP_PER_LEVEL}+ XP`;
  return `${(level - 1) * XP_PER_LEVEL}–${level * XP_PER_LEVEL - 1} XP`;
}

export function levelStatus(level, currentLevel) {
  if (level < currentLevel) return 'complete';
  if (level === currentLevel) return 'current';
  if (level === currentLevel + 1) return 'next';
  return 'locked';
}

export function levelProgressValue(level, currentLevel, xpIntoLevel = 0) {
  if (level < currentLevel) return 1;
  if (level > currentLevel) return 0;
  return Math.max(0, Math.min(1, xpIntoLevel / XP_PER_LEVEL));
}

/** Daily XP Match allowance grows with the member's level. */
export function gameRunsForLevel(level = 1) {
  let runs = 3;
  if (level >= 6) runs += 1;
  if (level >= 9) runs += 1;
  return runs;
}

/** Level-shaped game difficulty. */
export function gameConfigForLevel(level = 1) {
  if (level <= 2) return { pairs: 6, seconds: 60, columns: 4 };
  if (level <= 5) return { pairs: 8, seconds: 58, columns: 4 };
  if (level <= 8) return { pairs: 9, seconds: 54, columns: 6 };
  return { pairs: 10, seconds: 50, columns: 5 };
}
