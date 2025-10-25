import { BaseEnemy } from './Enemy';

export class Mummy extends BaseEnemy {
  private walkSpeed: number;
  private animationTimer: number;
  private shuffleDelay: number;
  private lastShuffleTime: number;
  
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string = 'mummy') {
    super(scene, x, y, texture, 'mummy');
    
    // Mummy-specific properties
    this.walkSpeed = 60; // Slower than vampire
    this.moveSpeed = this.walkSpeed;
    this.movementType = 'ground';
    this.animationTimer = 0;
    this.shuffleDelay = 200; // Delay between shuffle steps (ms)
    this.lastShuffleTime = 0;
    
    // Configure physics for slow ground walking
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setGravityY(300); // Apply gravity for ground movement
      this.body.setSize(32, 48); // Taller collision box for humanoid
      this.body.setCollideWorldBounds(true);
    }
  }
  
  /**
   * Mummy movement: slow ground walking movement with shuffling effect
   * Requirements: 4.4
   */
  updateMovement(): void {
    if (!this.body) return;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    const currentTime = this.scene.time.now;
    
    // Shuffling movement - intermittent slow movement
    if (currentTime - this.lastShuffleTime > this.shuffleDelay) {
      body.setVelocityX(-this.walkSpeed);
      this.lastShuffleTime = currentTime;
      
      // Brief pause in movement to simulate shuffling
      this.scene.time.delayedCall(100, () => {
        if (this.body instanceof Phaser.Physics.Arcade.Body) {
          this.body.setVelocityX(-this.walkSpeed * 0.5); // Slower continuous movement
        }
      });
    }
    
    // Slow shuffling animation effect
    this.animationTimer += 0.05; // Slower animation than vampire
    const shuffleBob = Math.sin(this.animationTimer) * 1;
    
    // Only apply bobbing if on ground
    if (body.touching.down) {
      this.y += shuffleBob * 0.05; // Subtle movement
    }
    
    // Face the direction of movement
    this.setFlipX(true); // Face left since moving left
    
    // Slight transparency to show aged/decayed appearance
    this.setAlpha(0.9);
  }
}