import { BaseEnemy } from './Enemy';

export class Bat extends BaseEnemy {
  private floatAmplitude: number;
  private floatFrequency: number;
  private initialY: number;
  private timeOffset: number;
  private flapSpeed: number;
  private animationFrame: number;
  private animationTimer: number;
  private readonly ANIMATION_SPEED = 150; // ms per frame - faster for wing flapping
  
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string = 'bat') {
    super(scene, x, y, texture, 'bat');
    
    // Bat-specific properties
    this.moveSpeed = 120; // Slightly faster than ghost
    this.movementType = 'floating';
    this.floatAmplitude = 30; // More erratic movement than ghost
    this.floatFrequency = 0.004; // Faster bobbing than ghost
    this.initialY = y;
    this.timeOffset = Math.random() * Math.PI * 2; // Random start phase
    this.flapSpeed = 0.008; // For wing flapping animation effect
    
    // Initialize animation
    this.animationFrame = 0;
    this.animationTimer = 0;
    
    // Configure physics for floating
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setGravityY(0); // No gravity for floating
      this.body.setSize(24, 20); // Smaller collision box for bat
      this.body.setVelocityX(-this.moveSpeed); // Move left towards player spawn
    }
  }
  
  /**
   * Bat movement: low floating with more erratic bobbing motion
   * Similar to Ghost but with different parameters
   * Requirements: 4.2
   */
  updateMovement(): void {
    if (!this.body) return;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // Horizontal movement (constant left movement, faster than ghost)
    body.setVelocityX(-this.moveSpeed);
    
    // Vertical floating motion (more erratic than ghost)
    const time = this.scene.time.now;
    const floatOffset = Math.sin(time * this.floatFrequency + this.timeOffset) * this.floatAmplitude;
    
    // Add some randomness to make bat movement more erratic
    const randomOffset = Math.sin(time * 0.01 + this.timeOffset) * 10;
    this.y = this.initialY + floatOffset + randomOffset;
  }

  /**
   * Update wing flapping animation
   */
  private updateAnimation(delta: number): void {
    this.animationTimer += delta;
    
    if (this.animationTimer >= this.ANIMATION_SPEED) {
      this.animationTimer = 0;
      this.animationFrame = (this.animationFrame + 1) % 3; // Cycle through 3 frames
      
      const frameTexture = `bat_${this.animationFrame}`;
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