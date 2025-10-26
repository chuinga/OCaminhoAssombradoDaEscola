import * as Phaser from 'phaser';
import { WeaponEntity } from '../../types';
import { audioManager } from '../utils/AudioManager';
import { WeaponFactory } from './WeaponFactory';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public lives: number;
  public score: number;
  public weapon: WeaponEntity | null;
  public isInvulnerable: boolean;
  public invulnerabilityTimer: number;
  public isCrouching: boolean;
  public isJumping: boolean;
  
  // Movement constants
  private readonly MOVE_SPEED = 200;
  private readonly JUMP_VELOCITY = -360; // Negative for upward movement
  private readonly INVULNERABILITY_DURATION = 800; // 800ms as per requirement 7.4
  
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    // Get character selection from game registry
    const character = scene.registry.get('character') || 'boy';
    const characterTexture = character === 'boy' ? 'player_boy' : 'player_girl';
    
    super(scene, x, y, characterTexture);
    
    // Initialize properties
    this.lives = 10; // Starting lives as per requirement 7.1
    this.score = 0;
    this.weapon = null;
    this.isInvulnerable = false;
    this.invulnerabilityTimer = 0;
    this.isCrouching = false;
    this.isJumping = false;
    
    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    console.log('Player created at:', x, y, 'texture:', characterTexture);
    console.log('Player body after physics:', !!this.body);
    
    // Configure physics body
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setCollideWorldBounds(true);
      this.body.setGravityY(300); // Apply gravity
      this.body.setSize(32, 48); // Set collision box size
      console.log('Player physics body configured successfully');
    } else {
      console.error('Player physics body not created properly!');
    }
  }
  
  /**
   * Move player left or right
   * Requirements: 3.1, 3.2
   */
  move(direction: 'left' | 'right'): void {
    if (!this.body || this.isCrouching) {
      console.log('Movement blocked - no body or crouching');
      return;
    }
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    if (direction === 'left') {
      body.setVelocityX(-this.MOVE_SPEED);
      this.setFlipX(true); // Face left
    } else if (direction === 'right') {
      body.setVelocityX(this.MOVE_SPEED);
      this.setFlipX(false); // Face right
    }
  }
  
  /**
   * Stop horizontal movement
   */
  stopMovement(): void {
    if (!this.body) return;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(0);
  }
  
  /**
   * Make player jump
   * Requirements: 3.3, 11.2
   */
  jump(): void {
    if (!this.body || this.isCrouching) return;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // Only jump if on ground
    if (body.touching.down) {
      body.setVelocityY(this.JUMP_VELOCITY);
      this.isJumping = true;
      
      // Play jump sound effect
      audioManager.playJumpSound();
    }
  }
  
  /**
   * Make player crouch
   * Requirements: 3.4
   */
  crouch(): void {
    if (!this.body) return;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    if (!this.isCrouching) {
      this.isCrouching = true;
      // Reduce collision box height when crouching
      body.setSize(32, 24);
      body.setOffset(0, 24);
      // Stop horizontal movement when crouching
      body.setVelocityX(0);
    }
  }
  
  /**
   * Stop crouching
   */
  stopCrouching(): void {
    if (!this.body) return;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    if (this.isCrouching) {
      this.isCrouching = false;
      // Restore normal collision box
      body.setSize(32, 48);
      body.setOffset(0, 0);
    }
  }
  
  /**
   * Attack with selected weapon
   * Requirements: 3.5, 11.5
   */
  attack(): void {
    if (!this.weapon || this.isCrouching) return;
    
    // Check if weapon can attack (cooldown)
    if (this.weapon.canAttack()) {
      // Get attack position based on player facing direction
      const attackX = this.flipX ? this.x - this.weapon.range : this.x + this.weapon.range;
      const attackY = this.y;
      
      // Execute weapon attack
      this.weapon.attack(attackX, attackY);
      
      // Show visual weapon attack
      this.showWeaponAttack();
      
      // Play weapon-specific sound effect
      audioManager.playWeaponSound(this.weapon.type);
    }
  }
  
  /**
   * Show visual weapon attack effect
   */
  private showWeaponAttack(): void {
    if (!this.weapon) return;
    
    const scene = this.scene;
    const facingLeft = this.flipX;
    
    // Create visual attack effect based on weapon type
    switch (this.weapon.type) {
      case 'katana':
      case 'baseball':
        this.showMeleeAttack(facingLeft);
        break;
      case 'laser':
        this.showLaserAttack(facingLeft);
        break;
      case 'bazooka':
        this.showBazookaAttack(facingLeft);
        break;
    }
  }
  
  /**
   * Show melee weapon attack (katana, baseball bat)
   */
  private showMeleeAttack(facingLeft: boolean): void {
    if (!this.weapon) return;
    
    const scene = this.scene;
    const attackX = facingLeft ? this.x - this.weapon.range/2 : this.x + this.weapon.range/2;
    const attackY = this.y - 10;
    
    // Create attack slash effect
    const slash = scene.add.graphics();
    slash.lineStyle(3, 0xffffff, 0.8);
    
    if (facingLeft) {
      slash.lineBetween(attackX + 20, attackY - 20, attackX - 20, attackY + 20);
    } else {
      slash.lineBetween(attackX - 20, attackY - 20, attackX + 20, attackY + 20);
    }
    
    // Animate and destroy the slash effect
    scene.tweens.add({
      targets: slash,
      alpha: 0,
      duration: 150,
      onComplete: () => slash.destroy()
    });
  }
  
  /**
   * Show laser weapon attack
   */
  private showLaserAttack(facingLeft: boolean): void {
    const scene = this.scene;
    const startX = this.x;
    const startY = this.y - 10;
    const endX = facingLeft ? this.x - 200 : this.x + 200;
    
    // Create laser beam effect
    const laser = scene.add.graphics();
    laser.lineStyle(2, 0xff0000, 0.9);
    laser.lineBetween(startX, startY, endX, startY);
    
    // Add glow effect
    const glow = scene.add.graphics();
    glow.lineStyle(6, 0xff0000, 0.3);
    glow.lineBetween(startX, startY, endX, startY);
    
    // Animate and destroy the laser effect
    scene.tweens.add({
      targets: [laser, glow],
      alpha: 0,
      duration: 200,
      onComplete: () => {
        laser.destroy();
        glow.destroy();
      }
    });
  }
  
  /**
   * Show bazooka weapon attack
   */
  private showBazookaAttack(facingLeft: boolean): void {
    const scene = this.scene;
    const startX = this.x;
    const startY = this.y - 10;
    const targetX = facingLeft ? this.x - 100 : this.x + 100;
    
    // Create explosion effect at target location
    const explosion = scene.add.graphics();
    explosion.fillStyle(0xff6600, 0.8);
    explosion.fillCircle(targetX, startY, 30);
    
    // Add outer explosion ring
    const ring = scene.add.graphics();
    ring.lineStyle(3, 0xffff00, 0.6);
    ring.strokeCircle(targetX, startY, 40);
    
    // Animate explosion
    scene.tweens.add({
      targets: explosion,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 300,
      onComplete: () => explosion.destroy()
    });
    
    scene.tweens.add({
      targets: ring,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 400,
      onComplete: () => ring.destroy()
    });
  }
  
  /**
   * Check if player is currently attacking (for collision detection)
   */
  isAttacking(): boolean {
    if (!this.weapon) return false;
    
    // Check if attack happened recently (within 100ms window)
    const timeSinceAttack = this.scene.time.now - this.weapon.getLastAttackTime();
    return timeSinceAttack <= 100;
  }
  
  /**
   * Take damage and apply invulnerability
   * Requirements: 7.3, 7.4, 11.3
   */
  takeDamage(): void {
    // Don't take damage if already invulnerable
    if (this.isInvulnerable || this.lives <= 0) return;
    
    // Reduce lives
    this.lives = Math.max(0, this.lives - 1);
    
    // Apply invulnerability
    this.isInvulnerable = true;
    this.invulnerabilityTimer = this.INVULNERABILITY_DURATION;
    
    // Visual feedback - make player flash
    this.setAlpha(0.5);
    
    // Play damage sound effect
    audioManager.playDamageSound();
    
    // Update game store with new lives count
    // This will be handled by the game scene that manages the player
  }
  
  /**
   * Set the player's weapon
   */
  setWeapon(weapon: WeaponEntity): void {
    this.weapon = weapon;
  }
  
  /**
   * Add points to score
   */
  addScore(points: number): void {
    this.score += points;
  }
  
  /**
   * Add lives (up to maximum of 10)
   * Requirements: 6.2
   */
  addLife(): void {
    if (this.lives < 10) {
      this.lives += 1;
    }
  }
  
  /**
   * Update method called every frame
   */
  update(time: number, delta: number): void {
    // Update invulnerability timer
    if (this.isInvulnerable) {
      this.invulnerabilityTimer -= delta;
      
      if (this.invulnerabilityTimer <= 0) {
        this.isInvulnerable = false;
        this.setAlpha(1); // Restore full opacity
      } else {
        // Flash effect during invulnerability
        const flashRate = 100; // Flash every 100ms
        const shouldShow = Math.floor(this.invulnerabilityTimer / flashRate) % 2 === 0;
        this.setAlpha(shouldShow ? 0.5 : 0.2);
      }
    }
    
    // Update jumping state
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      if (this.isJumping && this.body.touching.down) {
        this.isJumping = false;
      }
    }
  }
  
  /**
   * Check if player is on ground
   */
  isOnGround(): boolean {
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      return this.body.touching.down;
    }
    return false;
  }
  
  /**
   * Get player's current state for debugging
   */
  getState(): {
    x: number;
    y: number;
    lives: number;
    score: number;
    isInvulnerable: boolean;
    isCrouching: boolean;
    isJumping: boolean;
  } {
    return {
      x: this.x,
      y: this.y,
      lives: this.lives,
      score: this.score,
      isInvulnerable: this.isInvulnerable,
      isCrouching: this.isCrouching,
      isJumping: this.isJumping,
    };
  }
}