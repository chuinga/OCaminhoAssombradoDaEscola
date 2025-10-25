// Export main game components
export { GameScene } from './scenes/GameScene';
export { createPhaserGame, destroyPhaserGame, gameConfig } from './PhaserGame';

// Export entities
export { Player } from './entities/Player';
export * from './entities';

// Export weapons
export * from './weapons';

// Export types
export type { DifficultyConfig } from '../types';