import * as Phaser from 'phaser';
import { WeaponEntity } from '../../types';

export abstract class BaseWeapon implements WeaponEntity {
  public type: 'katana' | 'laser' | 'baseball' | 'bazooka';
  public range: number;
  public cooldown: number;
  public ammunition?: number;
  
  protected scene: Phaser.Scene;
  protected lastAttackTime: number = 0;
  
  constructor(
    scene: Phaser.Scene,
    type: 'katana' | 'laser' | 'baseball' | 'bazooka',
    range: number,
    cooldown: number,
    ammunition?: number
  ) {
    this.scene = scene;
    this.type = type;
    this.range = range;
    this.cooldown = cooldown;
    this.ammunition = ammunition;
  }
  
  /**
   * Check if weapon can attack based on cooldown
   */
  canAttack(): boolean {
    const currentTime = this.scene.time.now;
    const timeSinceLastAttack = currentTime - this.lastAttackTime;
    
    // Check cooldown and ammunition (if applicable)
    const cooldownReady = timeSinceLastAttack >= this.cooldown;
    const hasAmmo = this.ammunition === undefined || this.ammunition > 0;
    
    return cooldownReady && hasAmmo;
  }
  
  /**
   * Abstract method to be implemented by each weapon type
   */
  abstract attack(x: number, y: number): void;
  
  /**
   * Update last attack time and consume ammunition if applicable
   */
  protected onAttack(): void {
    this.lastAttackTime = this.scene.time.now;
    
    if (this.ammunition !== undefined) {
      this.ammunition = Math.max(0, this.ammunition - 1);
    }
  }
  
  /**
   * Check for enemy collisions in a given area
   */
  protected checkEnemyCollisions(x: number, y: number, width: number, height: number): void {
    // This will be implemented when we have enemy groups available
    // For now, we'll create a placeholder that can be extended
    console.log(`Weapon ${this.type} attacking at (${x}, ${y}) with area ${width}x${height}`);
  }
}