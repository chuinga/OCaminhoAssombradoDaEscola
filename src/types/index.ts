// Export types from store
export type { Character, Weapon, Difficulty, GameStatus } from '../store/gameStore';

// Game Entity Types
export interface Player {
  x: number;
  y: number;
  lives: number;
  score: number;
  weapon: WeaponEntity | null;
  isInvulnerable: boolean;
  invulnerabilityTimer: number;
  
  move(direction: 'left' | 'right'): void;
  jump(): void;
  crouch(): void;
  attack(): void;
  takeDamage(): void;
}

export interface Enemy {
  x: number;
  y: number;
  type: 'ghost' | 'bat' | 'vampire' | 'mummy';
  isAlive: boolean;
  
  update(time?: number, delta?: number): void;
  onCollision(): void;
  destroy(): void;
}

export interface WeaponEntity {
  type: 'katana' | 'laser' | 'baseball' | 'bazooka';
  range: number;
  cooldown: number;
  ammunition?: number; // Only for bazooka
  
  attack(x: number, y: number): void;
  canAttack(): boolean;
  getLastAttackTime(): number;
}

// Difficulty Configuration
export interface DifficultyConfig {
  enemySpawnRate: number;    // Enemies per 1000px
  lifeItemSpawnRate: number; // Life items per 1000px
  enemyTypes: string[];      // Available enemy types
}

// API Types
export interface Score {
  scoreId: string;        // UUID primary key
  firstName: string;
  lastName: string;
  score: number;
  character: 'boy' | 'girl';
  weapon: string;
  difficulty: 'easy' | 'medium' | 'impossible';
  createdAt: string;      // ISO timestamp
}

export interface LeaderboardResponse {
  scores: Score[];
  total: number;
}

export interface AllScoresResponse {
  scores: Score[];
  nextToken?: string;
  hasMore: boolean;
}

export interface FilteredLeaderboardResponse {
  scores: Score[];
  total: number;
  filters: {
    difficulty?: 'easy' | 'medium' | 'impossible';
    period?: 'all' | 'weekly' | 'monthly';
  };
}

export interface PlayerStats {
  playerId: string;
  firstName: string;
  lastName: string;
  totalGames: number;
  bestScore: number;
  averageScore: number;
  favoriteCharacter: 'boy' | 'girl';
  favoriteWeapon: string;
  favoritedifficulty: 'easy' | 'medium' | 'impossible';
  completionRate: number; // Percentage of games won
  lastPlayed: string;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface ShareableScore {
  playerName: string;
  score: number;
  character: 'boy' | 'girl';
  weapon: string;
  difficulty: 'easy' | 'medium' | 'impossible';
  rank: number;
  shareUrl: string;
  shareText: string;
}

export interface SubmitScoreRequest {
  firstName: string;
  lastName: string;
  score: number;
  character: 'boy' | 'girl';
  weapon: string;
  difficulty: 'easy' | 'medium' | 'impossible';
}

// Mobile Controls
export interface MobileControls {
  leftSide: {
    moveLeft: TouchButton;
    moveRight: TouchButton;
  };
  rightSide: {
    jump: TouchButton;
    crouch: TouchButton;
    attack: TouchButton;
  };
}

export interface TouchButton {
  x: number;
  y: number;
  width: number;
  height: number;
  isPressed: boolean;
}