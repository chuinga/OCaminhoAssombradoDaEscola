// Game State Types
export interface GameState {
  // Player data
  firstName: string;
  lastName: string;
  character: 'boy' | 'girl' | null;
  weapon: 'katana' | 'laser' | 'baseball' | 'bazooka' | null;
  difficulty: 'easy' | 'medium' | 'impossible' | null;
  
  // Game progress
  lives: number;
  score: number;
  gameStatus: 'menu' | 'playing' | 'paused' | 'finished';
  
  // Actions
  setPlayerName: (firstName: string, lastName: string) => void;
  setCharacter: (character: 'boy' | 'girl') => void;
  setWeapon: (weapon: 'katana' | 'laser' | 'baseball' | 'bazooka') => void;
  setDifficulty: (difficulty: 'easy' | 'medium' | 'impossible') => void;
  updateLives: (lives: number) => void;
  updateScore: (score: number) => void;
  setGameStatus: (status: 'menu' | 'playing' | 'paused' | 'finished') => void;
  resetGame: () => void;
}

// Game Entity Types
export interface Player {
  x: number;
  y: number;
  lives: number;
  score: number;
  weapon: Weapon;
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

export interface Weapon {
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