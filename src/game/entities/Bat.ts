import { BaseEnemy } from './Enemy';

export class Bat extends BaseEnemy {
  private floatAmplitude: number;
  private floatFrequency: number;
  private initialY: number;
  private timeOffset: number;
  private flapSpeed: number;
  
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
    
    // Wing flapping effect (scale animation)
    const flapScale = 1 + Math.sin(time * this.flapSpeed) * 0.1;
    this.setScale(flapScale, 1);
  }
}