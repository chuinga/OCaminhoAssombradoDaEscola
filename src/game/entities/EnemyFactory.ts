import { Ghost } from './Ghost';
import { Bat } from './Bat';
import { Vampire } from './Vampire';
import { Mummy } from './Mummy';
import { BaseEnemy } from './Enemy';

export type EnemyType = 'ghost' | 'bat' | 'vampire' | 'mummy';

/**
 * Factory class for creating enemy instances
 * Helps with enemy spawning in game scenes
 */
export class EnemyFactory {
  /**
   * Create an enemy of the specified type
   * @param scene - Phaser scene
   * @param x - X position
   * @param y - Y position  
   * @param type - Enemy type to create
   * @param texture - Optional texture override
   * @returns Enemy instance
   */
  static createEnemy(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    type: EnemyType,
    texture?: string
  ): BaseEnemy {
    switch (type) {
      case 'ghost':
        return new Ghost(scene, x, y, texture);
      case 'bat':
        return new Bat(scene, x, y, texture);
      case 'vampire':
        return new Vampire(scene, x, y, texture);
      case 'mummy':
        return new Mummy(scene, x, y, texture);
      default:
        throw new Error(`Unknown enemy type: ${type}`);
    }
  }
  
  /**
   * Get enemy spawn height based on type
   * Floating enemies spawn higher, ground enemies spawn at ground level
   * @param type - Enemy type
   * @param groundY - Ground level Y position
   * @returns Appropriate Y position for enemy type
   */
  static getSpawnHeight(type: EnemyType, groundY: number): number {
    switch (type) {
      case 'ghost':
        return groundY - 100; // Float above ground
      case 'bat':
        return groundY - 80;  // Float slightly lower than ghost
      case 'vampire':
        return groundY - 48;  // On ground (accounting for sprite height)
      case 'mummy':
        return groundY - 48;  // On ground (accounting for sprite height)
      default:
        return groundY - 48;
    }
  }
  
  /**
   * Get all available enemy types
   * @returns Array of enemy type strings
   */
  static getAllEnemyTypes(): EnemyType[] {
    return ['ghost', 'bat', 'vampire', 'mummy'];
  }
  
  /**
   * Get enemy types suitable for floating movement
   * @returns Array of floating enemy types
   */
  static getFloatingEnemyTypes(): EnemyType[] {
    return ['ghost', 'bat'];
  }
  
  /**
   * Get enemy types suitable for ground movement
   * @returns Array of ground enemy types
   */
  static getGroundEnemyTypes(): EnemyType[] {
    return ['vampire', 'mummy'];
  }
}