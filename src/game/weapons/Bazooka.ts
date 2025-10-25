import * as Phaser from 'phaser';
import { BaseWeapon } from './BaseWeapon';

export class Bazooka extends BaseWeapon {
  private rockets: Phaser.Physics.Arcade.Group;
  private readonly ROCKET_SPEED = 300; // Rocket travel speed
  private readonly EXPLOSION_RADIUS = 80; // Area damage radius
  
  constructor(scene: Phaser.Scene) {
    // Bazooka: area damage, 900ms cooldown, 6 ammunition limit
    super(scene, 'bazooka', 400, 900, 6); // 6 ammunition as per requirement 5.4
    
    // Create rocket group
    this.rockets = scene.physics.add.group({
      classType: BazookaRocket,
      maxSize: 6, // Match ammunition limit
      runChildUpdate: true
    });
  }
  
  /**
   * Fire bazooka rocket
   * Requirements: 5.4 - area damage, 900ms cooldown, 6 ammunition limit
   */
  attack(x: number, y: number): void {
    if (!this.canAttack()) return;
    
    // Check if we have ammunition
    if (this.ammunition === 0) {
      console.log('Bazooka out of ammunition!');
      return;
    }
    
    // Update attack timing and consume ammunition
    this.onAttack();
    
    // Create rocket projectile
    const rocket = this.rockets.get(x, y) as BazookaRocket;
    if (rocket) {
      rocket.fire(this.ROCKET_SPEED, this.EXPLOSION_RADIUS);
    }
    
    // Play explosion sound effect (will be implemented in audio system)
    // this.scene.sound.play('explosion');
    
    console.log(`Bazooka fired! Ammunition remaining: ${this.ammunition}`);
  }
  
  /**
   * Get rockets group for collision detection
   */
  getRockets(): Phaser.Physics.Arcade.Group {
    return this.rockets;
  }
  
  /**
   * Reload ammunition (for potential future use)
   */
  reload(): void {
    this.ammunition = 6;
  }
  
  /**
   * Get remaining ammunition
   */
  getAmmunition(): number {
    return this.ammunition || 0;
  }
  
  /**
   * Clean up rockets when weapon is destroyed
   */
  destroy(): void {
    this.rockets.clear(true, true);
  }
}

/**
 * Bazooka rocket projectile class
 */
class BazookaRocket extends Phaser.Physics.Arcade.Sprite {
  private explosionRadius: number = 80;
  private hasExploded: boolean = false;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bazooka-rocket'); // Texture will be loaded separately
    
    // Set up physics
    scene.physics.add.existing(this);
    this.setActive(false);
    this.setVisible(false);
    
    // Configure physics body
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setSize(12, 6); // Rocket size
    }
  }
  
  /**
   * Fire the rocket
   */
  fire(speed: number, explosionRadius: number): void {
    this.setActive(true);
    this.setVisible(true);
    this.hasExploded = false;
    this.explosionRadius = explosionRadius;
    
    // Set velocity based on direction (assuming right direction for now)
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setVelocityX(speed);
      this.body.setVelocityY(0);
    }
    
    // Create visual effect for rocket
    this.setTint(0xff4444); // Red rocket
    this.setScale(1.5, 1);
    
    // Add rocket trail effect
    this.createTrailEffect();
  }
  
  /**
   * Update rocket (called automatically by Phaser)
   */
  update(): void {
    // Explode if rocket goes off screen or hits something
    if (!this.hasExploded && (
      this.x > this.scene.cameras.main.worldView.right + 100 || 
      this.x < this.scene.cameras.main.worldView.left - 100
    )) {
      this.explode();
    }
  }
  
  /**
   * Handle collision with enemy or obstacle
   */
  onCollision(): void {
    if (!this.hasExploded) {
      this.explode();
    }
  }
  
  /**
   * Create explosion with area damage
   */
  private explode(): void {
    if (this.hasExploded) return;
    
    this.hasExploded = true;
    
    // Stop rocket movement
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setVelocity(0, 0);
    }
    
    // Create explosion effect
    this.createExplosionEffect();
    
    // Check for enemies in explosion radius
    this.checkExplosionDamage();
    
    // Deactivate rocket after explosion
    this.scene.time.delayedCall(500, () => {
      this.setActive(false);
      this.setVisible(false);
    });
  }
  
  /**
   * Create visual explosion effect
   */
  private createExplosionEffect(): void {
    // Create explosion circle
    const explosion = this.scene.add.circle(this.x, this.y, 10, 0xff4444, 0.8);
    
    // Animate explosion
    this.scene.tweens.add({
      targets: explosion,
      scaleX: this.explosionRadius / 10,
      scaleY: this.explosionRadius / 10,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        explosion.destroy();
      }
    });
    
    // Create additional explosion particles
    for (let i = 0; i < 8; i++) {
      const particle = this.scene.add.circle(
        this.x + Phaser.Math.Between(-20, 20),
        this.y + Phaser.Math.Between(-20, 20),
        Phaser.Math.Between(3, 8),
        0xff8844,
        0.7
      );
      
      this.scene.tweens.add({
        targets: particle,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        duration: Phaser.Math.Between(200, 600),
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }
  
  /**
   * Check for enemies within explosion radius and damage them
   */
  private checkExplosionDamage(): void {
    // This will be implemented when enemy system is available
    console.log(`Explosion at (${this.x}, ${this.y}) with radius ${this.explosionRadius}`);
    
    // The explosion should damage all enemies within the radius
    // This involves checking distance from explosion center to each enemy
  }
  
  /**
   * Create rocket trail effect
   */
  private createTrailEffect(): void {
    // Create a simple trail effect
    const trail = this.scene.add.rectangle(this.x - 10, this.y, 20, 4, 0xff8844, 0.6);
    
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        trail.destroy();
      }
    });
  }
}