import * as Phaser from 'phaser';
import { BaseWeapon } from './BaseWeapon';
import { audioManager } from '../utils/AudioManager';

export class Katana extends BaseWeapon {
  constructor(scene: Phaser.Scene) {
    // Katana: 40px range, 300ms cooldown, melee weapon
    super(scene, 'katana', 40, 300);
  }
  
  /**
   * Perform melee attack with katana
   * Requirements: 5.1 - 40px range, 300ms cooldown, melee
   */
  attack(x: number, y: number): void {
    if (!this.canAttack()) return;
    
    // Update attack timing
    this.onAttack();
    
    // Create melee attack area
    const attackWidth = this.range;
    const attackHeight = 60; // Height of the attack area
    
    // Check for enemy collisions in melee range
    this.checkEnemyCollisions(x, y, attackWidth, attackHeight);
    
    // Play slash sound effect for katana
    audioManager.playWeaponSound('katana');
    
    // Visual effect for katana slash (optional enhancement)
    this.createSlashEffect(x, y);
  }
  
  /**
   * Create visual effect for katana slash
   */
  private createSlashEffect(x: number, y: number): void {
    // Create a temporary slash effect sprite/animation
    const slashEffect = this.scene.add.rectangle(x, y, this.range, 60, 0xffffff, 0.3);
    
    // Fade out the effect quickly
    this.scene.tweens.add({
      targets: slashEffect,
      alpha: 0,
      duration: 100,
      onComplete: () => {
        slashEffect.destroy();
      }
    });
  }
}