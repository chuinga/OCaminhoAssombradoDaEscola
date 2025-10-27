import { BaseEnemy } from './Enemy';

export class Vampire extends BaseEnemy {
  private walkSpeed: number;
  private animationTimer: number;
  private animationFrame: number;
  private frameTimer: number;
  private readonly ANIMATION_SPEED = 400; // ms per frame - slower for dramatic effect
  
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string = 'vampire') {
    super(scene, x, y, texture, 'vampire');
    
    // Vampire-specific properties
    this.walkSpeed = 100; // Ground walking speed
    this.moveSpeed = this.walkSpeed;
    this.movementType = 'ground';
    this.animationTimer = 0;
    
    // Initialize animation
    this.animationFrame = 0;
    this.frameTimer = 0;
    
    // Configure physics for ground walking
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setGravityY(300); // Apply gravity for ground movement
      this.body.setSize(32, 48); // Taller collision box for humanoid
      this.body.setVelocityX(-this.walkSpeed); // Move left towards player spawn
      this.body.setCollideWorldBounds(true);
    }
  }
  
  /**
   * Vampire movement: ground walking movement
   * Requirements: 4.3
   */
  updateMovement(): void {
    if (!this.body) return;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // Horizontal movement (constant left walking)
    body.setVelocityX(-this.walkSpeed);
    
    // Simple walking animation effect (slight bobbing)
    this.animationTimer += 0.1;
    const walkBob = Math.sin(this.animationTimer) * 2;
    
    // Only apply bobbing if on ground
    if (body.touching.down) {
      this.y += walkBob * 0.1;
    }
    
    // Face the direction of movement
    this.setFlipX(true); // Face left since moving left
  }

  /**
   * Update cape animation
   */
  private updateAnimation(delta: number): void {
    this.frameTimer += delta;
    
    if (this.frameTimer >= this.ANIMATION_SPEED) {
      this.frameTimer = 0;
      this.animationFrame = (this.animationFrame + 1) % 3; // Cycle through 3 frames
      
      const frameTexture = `vampire_${this.animationFrame}`;
      if (this.scene.textures.exists(frameTexture)) {
        this.setTexture(frameTexture);
      }
    }
  }

  /**
   * Override update to include animation
   */
  update(time: number, delta: number): void {
    super.update(time, delta);
    this.updateAnimation(delta);
  }
}