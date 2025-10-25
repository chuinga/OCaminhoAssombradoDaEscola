import * as Phaser from 'phaser';
import { BaseWeapon } from './BaseWeapon';
import { audioManager } from '../utils/AudioManager';

export class BaseballBat extends BaseWeapon {
  private readonly KNOCKBACK_FORCE = 200; // Knockback force in pixels
  
  constructor(scene: Phaser.Scene) {
    // BaseballBat: 55px range, 450ms cooldown, knockback effect
    super(scene, 'baseball', 55, 450);
  }
  
  /**
   * Perform melee attack with baseball bat
   * Requirements: 5.3 - 55px range, 450ms cooldown, knockback
   */
  attack(x: number, y: number): void {
    if (!this.canAttack()) return;
    
    // Update attack timing
    this.onAttack();
    
    // Create melee attack area (slightly larger than katana)
    const attackWidth = this.range;
    const attackHeight = 70; // Slightly taller attack area
    
    // Check for enemy collisions in melee range with knockback
    this.checkEnemyCollisionsWithKnockback(x, y, attackWidth, attackHeight);
    
    // Play slash sound effect for baseball bat
    audioManager.playWeaponSound('baseball');
    
    // Visual effect for baseball bat swing
    this.createSwingEffect(x, y);
  }
  
  /**
   * Check for enemy collisions and apply knockback
   */
  private checkEnemyCollisionsWithKnockback(x: number, y: number, width: number, height: number): void {
    // This will be extended when enemy system is available
    // For now, log the attack with knockback indication
    console.log(`Baseball bat attacking at (${x}, ${y}) with area ${width}x${height} and knockback ${this.KNOCKBACK_FORCE}`);
    
    // The knockback effect will be applied to enemies when they are hit
    // This involves pushing enemies away from the attack point
  }
  
  /**
   * Apply knockback effect to an enemy
   */
  public applyKnockback(enemy: any, attackX: number): void {
    // Calculate knockback direction based on enemy position relative to attack
    const knockbackDirection = enemy.x > attackX ? 1 : -1;
    
    // Apply knockback force (this will be implemented when enemy physics are available)
    if (enemy.body) {
      enemy.body.setVelocityX(knockbackDirection * this.KNOCKBACK_FORCE);
    }
  }
  
  /**
   * Create visual effect for baseball bat swing
   */
  private createSwingEffect(x: number, y: number): void {
    // Create a swing arc effect
    const swingEffect = this.scene.add.arc(x, y, this.range, 0, 180, false, 0xffffff, 0.4);
    
    // Animate the swing
    this.scene.tweens.add({
      targets: swingEffect,
      angle: 45, // Swing arc
      alpha: 0,
      duration: 150,
      onComplete: () => {
        swingEffect.destroy();
      }
    });
  }
}