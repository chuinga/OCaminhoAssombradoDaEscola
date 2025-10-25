// Export types from store
export type { Character, Weapon, Difficulty, GameStatus } from '../store/gameStore';

// Game Entity Types
export interface Player {
  x: number;
  y: number;
  lives: number;
  score: number;
  weapon: WeaponEntity;
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
  
  update(): void;
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