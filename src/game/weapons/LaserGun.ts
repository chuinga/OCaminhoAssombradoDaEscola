import * as Phaser from 'phaser';
import { BaseWeapon } from './BaseWeapon';
import { audioManager } from '../utils/AudioManager';

export class LaserGun extends BaseWeapon {
  private projectiles: Phaser.Physics.Arcade.Group;
  private readonly PROJECTILE_SPEED = 500; // 500px/s as per requirement 5.2
  
  constructor(scene: Phaser.Scene) {
    // LaserGun: projectile weapon, 500px/s speed, 200ms cooldown
    super(scene, 'laser', 800, 200); // Range set to screen width for projectiles
    
    // Create projectile group
    this.projectiles = scene.physics.add.group({
      classType: LaserProjectile,
      maxSize: 10, // Limit number of projectiles
      runChildUpdate: true
    });
  }
  
  /**
   * Fire laser projectile
   * Requirements: 5.2 - projectile weapon, 500px/s speed, 200ms cooldown
   */
  attack(x: number, y: number): void {
    if (!this.canAttack()) return;
    
    // Update attack timing
    this.onAttack();
    
    // Create laser projectile
    const projectile = this.projectiles.get(x, y) as LaserProjectile;
    if (projectile) {
      projectile.fire(this.PROJECTILE_SPEED);
    }
    
    // Play laser sound effect
    audioManager.playWeaponSound('laser');
  }
  
  /**
   * Get projectiles group for collision detection
   */
  getProjectiles(): Phaser.Physics.Arcade.Group {
    return this.projectiles;
  }
  
  /**
   * Clean up projectiles when weapon is destroyed
   */
  destroy(): void {
    this.projectiles.clear(true, true);
  }
}

/**
 * Laser projectile class
 */
class LaserProjectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'laser-projectile'); // Texture will be loaded separately
    
    // Set up physics
    scene.physics.add.existing(this);
    this.setActive(false);
    this.setVisible(false);
    
    // Configure physics body
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setSize(8, 4); // Small projectile size
    }
  }
  
  /**
   * Fire the projectile
   */
  fire(speed: number): void {
    this.setActive(true);
    this.setVisible(true);
    
    // Set velocity based on direction (assuming right direction for now)
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setVelocityX(speed);
      this.body.setVelocityY(0);
    }
    
    // Create visual effect for laser beam
    this.setTint(0x00ff00); // Green laser
    this.setScale(2, 1); // Make it look like a laser beam
  }
  
  /**
   * Update projectile (called automatically by Phaser)
   */
  update(): void {
    // Destroy projectile if it goes off screen
    if (this.x > this.scene.cameras.main.worldView.right + 100 || 
        this.x < this.scene.cameras.main.worldView.left - 100) {
      this.setActive(false);
      this.setVisible(false);
      
      if (this.body instanceof Phaser.Physics.Arcade.Body) {
        this.body.setVelocity(0, 0);
      }
    }
  }
  
  /**
   * Handle collision with enemy
   */
  onEnemyHit(): void {
    // Deactivate projectile on hit
    this.setActive(false);
    this.setVisible(false);
    
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setVelocity(0, 0);
    }
    
    // Create hit effect
    this.createHitEffect();
  }
  
  /**
   * Create visual effect when projectile hits
   */
  private createHitEffect(): void {
    const hitEffect = this.scene.add.circle(this.x, this.y, 10, 0x00ff00, 0.5);
    
    this.scene.tweens.add({
      targets: hitEffect,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        hitEffect.destroy();
      }
    });
  }
}