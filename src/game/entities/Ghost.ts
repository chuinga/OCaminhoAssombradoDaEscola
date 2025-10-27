import { BaseEnemy } from './Enemy';

export class Ghost extends BaseEnemy {
  private floatAmplitude: number;
  private floatFrequency: number;
  private initialY: number;
  private timeOffset: number;
  private animationFrame: number;
  private animationTimer: number;
  private readonly ANIMATION_SPEED = 300; // ms per frame
  
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string = 'ghost') {
    super(scene, x, y, texture, 'ghost');
    
    // Ghost-specific properties
    this.moveSpeed = 80; // Moderate floating speed
    this.movementType = 'floating';
    this.floatAmplitude = 20; // How much it bobs up and down
    this.floatFrequency = 0.002; // How fast it bobs
    this.initialY = y;
    this.timeOffset = Math.random() * Math.PI * 2; // Random start phase
    
    // Initialize animation
    this.animationFrame = 0;
    this.animationTimer = 0;
    
    // Configure physics for floating
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setGravityY(0); // No gravity for floating
      this.body.setSize(28, 32); // Slightly smaller collision box
      this.body.setVelocityX(-this.moveSpeed); // Move left towards player spawn
    }
  }
  
  /**
   * Ghost movement: low floating with gentle bobbing motion
   * Requirements: 4.1
   */
  updateMovement(): void {
    if (!this.body) return;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // Horizontal movement (constant left movement)
    body.setVelocityX(-this.moveSpeed);
    
    // Vertical floating motion (sine wave)
    const time = this.scene.time.now;
    const floatOffset = Math.sin(time * this.floatFrequency + this.timeOffset) * this.floatAmplitude;
    this.y = this.initialY + floatOffset;
    
    // Optional: slight transparency effect for ghostly appearance
    this.setAlpha(0.8 + Math.sin(time * 0.003) * 0.2);
  }

  /**
   * Update animation frame
   */
  private updateAnimation(delta: number): void {
    this.animationTimer += delta;
    
    if (this.animationTimer >= this.ANIMATION_SPEED) {
      this.animationTimer = 0;
      this.animationFrame = (this.animationFrame + 1) % 3; // Cycle through 3 frames
      
      const frameTexture = `ghost_${this.animationFrame}`;
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