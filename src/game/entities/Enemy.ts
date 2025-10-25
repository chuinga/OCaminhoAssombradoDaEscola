import * as Phaser from 'phaser';

export abstract class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
  public type: 'ghost' | 'bat' | 'vampire' | 'mummy';
  public isAlive: boolean;
  public moveSpeed: number;
  public movementType: 'floating' | 'ground';
  
  constructor(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    texture: string, 
    type: 'ghost' | 'bat' | 'vampire' | 'mummy'
  ) {
    super(scene, x, y, texture);
    
    this.type = type;
    this.isAlive = true;
    this.moveSpeed = 100; // Default speed, will be overridden by subclasses
    this.movementType = 'floating'; // Default, will be overridden by subclasses
    
    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Configure physics body
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setCollideWorldBounds(true);
      this.body.setSize(32, 32); // Default collision box
      
      // Set gravity based on movement type
      if (this.movementType === 'floating') {
        this.body.setGravityY(0); // No gravity for floating enemies
      } else {
        this.body.setGravityY(300); // Apply gravity for ground enemies
      }
    }
  }
  
  /**
   * Abstract method for enemy-specific movement behavior
   */
  abstract updateMovement(): void;
  
  /**
   * Handle collision with player - all enemies remove 1 life and disappear
   * Requirements: 4.1, 4.2, 4.3, 4.4, 7.3
   */
  onCollision(): void {
    if (!this.isAlive) return;
    
    // Enemy disappears on collision
    this.destroy();
  }
  
  /**
   * Update method called every frame
   */
  update(): void {
    if (!this.isAlive) return;
    
    // Update enemy-specific movement
    this.updateMovement();
    
    // Remove enemy if it goes too far off screen (optimization)
    if (this.x < -100 || this.x > this.scene.scale.width + 100) {
      this.destroy();
    }
  }
  
  /**
   * Destroy the enemy
   */
  destroy(): void {
    this.isAlive = false;
    super.destroy();
  }
}