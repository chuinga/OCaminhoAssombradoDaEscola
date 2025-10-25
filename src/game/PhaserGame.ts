import * as Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';

/**
 * Phaser game configuration
 */
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container', // DOM element ID where game will be mounted
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300, x: 0 },
      debug: false, // Set to true for physics debugging
    },
  },
  scene: [GameScene],
  render: {
    antialias: false,
    pixelArt: true, // Better for pixel art sprites
  },
};

/**
 * Create and return a new Phaser game instance
 */
export function createPhaserGame(config?: Partial<Phaser.Types.Core.GameConfig>): Phaser.Game {
  const finalConfig = { ...gameConfig, ...config };
  return new Phaser.Game(finalConfig);
}

/**
 * Destroy a Phaser game instance
 */
export function destroyPhaserGame(game: Phaser.Game): void {
  if (game) {
    game.destroy(true);
  }
}