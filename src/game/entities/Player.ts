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
  
  // Animation properties
  private currentAnimation: string;
  private animationFrame: number;
  private animationTimer: number;
  private readonly ANIMATION_SPEED = 200; // ms per frame
  
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
    
    // Initialize animation properties
    this.currentAnimation = 'idle';
    this.animationFrame = 0;
    this.animationTimer = 0;
    
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
      this.setAnimation('walk');
    } else if (direction === 'right') {
      body.setVelocityX(this.MOVE_SPEED);
      this.setFlipX(false); // Face right
      this.setAnimation('walk');
    }
  }
  
  /**
   * Stop horizontal movement
   */
  stopMovement(): void {
    if (!this.body) return;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(0);
    this.setAnimation('idle');
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
      this.setAnimation('jump');
      
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
   * Show visual weapon attack effect with enhanced animations
   */
  private showWeaponAttack(): void {
    if (!this.weapon) return;
    
    const scene = this.scene;
    const facingLeft = this.flipX;
    
    // Create visual attack effect based on weapon type
    switch (this.weapon.type) {
      case 'katana':
        this.showKatanaAttack(facingLeft);
        break;
      case 'baseball':
        this.showBaseballAttack(facingLeft);
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
   * Show katana attack with slash animation
   */
  private showKatanaAttack(facingLeft: boolean): void {
    if (!this.weapon) return;
    
    const scene = this.scene;
    const attackX = facingLeft ? this.x - this.weapon.range/2 : this.x + this.weapon.range/2;
    const attackY = this.y - 10;
    
    // Create katana slash effect with multiple layers
    const slash1 = scene.add.graphics();
    const slash2 = scene.add.graphics();
    const slash3 = scene.add.graphics();
    
    // Main slash (silver)
    slash1.lineStyle(4, 0xc0c0c0, 0.9);
    // Glow effect (white)
    slash2.lineStyle(8, 0xffffff, 0.5);
    // Sparkle effect (yellow)
    slash3.lineStyle(2, 0xffff00, 0.7);
    
    if (facingLeft) {
      const startX = attackX + 25;
      const startY = attackY - 25;
      const endX = attackX - 25;
      const endY = attackY + 25;
      
      slash1.lineBetween(startX, startY, endX, endY);
      slash2.lineBetween(startX, startY, endX, endY);
      slash3.lineBetween(startX, startY, endX, endY);
    } else {
      const startX = attackX - 25;
      const startY = attackY - 25;
      const endX = attackX + 25;
      const endY = attackY + 25;
      
      slash1.lineBetween(startX, startY, endX, endY);
      slash2.lineBetween(startX, startY, endX, endY);
      slash3.lineBetween(startX, startY, endX, endY);
    }
    
    // Add sparkle particles
    for (let i = 0; i < 5; i++) {
      const sparkle = scene.add.graphics();
      sparkle.fillStyle(0xffff00, 0.8);
      sparkle.fillCircle(
        attackX + (Math.random() - 0.5) * 50,
        attackY + (Math.random() - 0.5) * 30,
        2
      );
      
      scene.tweens.add({
        targets: sparkle,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 200 + Math.random() * 100,
        onComplete: () => sparkle.destroy()
      });
    }
    
    // Animate slashes
    scene.tweens.add({
      targets: [slash1, slash2, slash3],
      alpha: 0,
      duration: 150,
      onComplete: () => {
        slash1.destroy();
        slash2.destroy();
        slash3.destroy();
      }
    });
  }
  
  /**
   * Show baseball bat attack with swing animation
   */
  private showBaseballAttack(facingLeft: boolean): void {
    if (!this.weapon) return;
    
    const scene = this.scene;
    const attackX = facingLeft ? this.x - this.weapon.range/2 : this.x + this.weapon.range/2;
    const attackY = this.y - 5;
    
    // Create baseball bat swing arc
    const swing = scene.add.graphics();
    swing.lineStyle(6, 0x8b4513, 0.8); // Brown bat color
    
    // Draw swing arc
    const centerX = this.x;
    const centerY = this.y - 10;
    const radius = this.weapon.range / 2;
    const startAngle = facingLeft ? Math.PI * 0.3 : Math.PI * 0.7;
    const endAngle = facingLeft ? Math.PI * 0.7 : Math.PI * 0.3;
    
    swing.beginPath();
    swing.arc(centerX, centerY, radius, startAngle, endAngle, facingLeft);
    swing.strokePath();
    
    // Add impact effect
    const impact = scene.add.graphics();
    impact.fillStyle(0xffff00, 0.6);
    impact.fillCircle(attackX, attackY, 15);
    
    // Add motion lines
    for (let i = 0; i < 3; i++) {
      const line = scene.add.graphics();
      line.lineStyle(2, 0xffffff, 0.5);
      const lineX = attackX + (i - 1) * 10;
      line.lineBetween(lineX, attackY - 10, lineX, attackY + 10);
      
      scene.tweens.add({
        targets: line,
        alpha: 0,
        duration: 100 + i * 50,
        onComplete: () => line.destroy()
      });
    }
    
    // Animate swing and impact
    scene.tweens.add({
      targets: swing,
      alpha: 0,
      duration: 200,
      onComplete: () => swing.destroy()
    });
    
    scene.tweens.add({
      targets: impact,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 150,
      onComplete: () => impact.destroy()
    });
  }
  
  /**
   * Show laser weapon attack with beam animation
   */
  private showLaserAttack(facingLeft: boolean): void {
    const scene = this.scene;
    const startX = this.x;
    const startY = this.y - 10;
    const endX = facingLeft ? this.x - 200 : this.x + 200;
    
    // Create laser beam with multiple layers
    const laserCore = scene.add.graphics();
    const laserGlow = scene.add.graphics();
    const laserOuter = scene.add.graphics();
    
    // Core beam (bright red)
    laserCore.lineStyle(2, 0xff0000, 1.0);
    laserCore.lineBetween(startX, startY, endX, startY);
    
    // Inner glow (orange)
    laserGlow.lineStyle(6, 0xff6600, 0.6);
    laserGlow.lineBetween(startX, startY, endX, startY);
    
    // Outer glow (yellow)
    laserOuter.lineStyle(12, 0xffff00, 0.3);
    laserOuter.lineBetween(startX, startY, endX, startY);
    
    // Add energy particles along the beam
    for (let i = 0; i < 8; i++) {
      const particle = scene.add.graphics();
      particle.fillStyle(0xff0000, 0.8);
      const particleX = startX + (endX - startX) * (i / 8);
      particle.fillCircle(particleX, startY + (Math.random() - 0.5) * 4, 1);
      
      scene.tweens.add({
        targets: particle,
        alpha: 0,
        y: startY + (Math.random() - 0.5) * 20,
        duration: 200,
        onComplete: () => particle.destroy()
      });
    }
    
    // Animate laser beam
    scene.tweens.add({
      targets: [laserCore, laserGlow, laserOuter],
      alpha: 0,
      duration: 250,
      onComplete: () => {
        laserCore.destroy();
        laserGlow.destroy();
        laserOuter.destroy();
      }
    });
  }
  
  /**
   * Show bazooka weapon attack with explosion animation
   */
  private showBazookaAttack(facingLeft: boolean): void {
    const scene = this.scene;
    const startX = this.x;
    const startY = this.y - 10;
    const targetX = facingLeft ? this.x - 100 : this.x + 100;
    
    // Create projectile trail first
    const projectile = scene.add.graphics();
    projectile.fillStyle(0xff6600, 0.9);
    projectile.fillCircle(startX, startY, 3);
    
    // Animate projectile to target
    scene.tweens.add({
      targets: projectile,
      x: targetX,
      duration: 200,
      onComplete: () => {
        projectile.destroy();
        this.createExplosionEffect(scene, targetX, startY);
      }
    });
  }
  
  /**
   * Create explosion effect for bazooka
   */
  private createExplosionEffect(scene: Phaser.Scene, x: number, y: number): void {
    // Main explosion
    const explosion = scene.add.graphics();
    explosion.fillStyle(0xff6600, 0.8);
    explosion.fillCircle(x, y, 20);
    
    // Explosion rings
    const ring1 = scene.add.graphics();
    ring1.lineStyle(4, 0xffff00, 0.8);
    ring1.strokeCircle(x, y, 25);
    
    const ring2 = scene.add.graphics();
    ring2.lineStyle(6, 0xff0000, 0.6);
    ring2.strokeCircle(x, y, 35);
    
    // Explosion particles
    for (let i = 0; i < 12; i++) {
      const particle = scene.add.graphics();
      particle.fillStyle(0xff6600, 0.7);
      particle.fillCircle(x, y, 2);
      
      const angle = (i / 12) * Math.PI * 2;
      const distance = 40 + Math.random() * 20;
      const targetX = x + Math.cos(angle) * distance;
      const targetY = y + Math.sin(angle) * distance;
      
      scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: 300 + Math.random() * 200,
        onComplete: () => particle.destroy()
      });
    }
    
    // Animate explosion
    scene.tweens.add({
      targets: explosion,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 400,
      onComplete: () => explosion.destroy()
    });
    
    scene.tweens.add({
      targets: ring1,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 500,
      onComplete: () => ring1.destroy()
    });
    
    scene.tweens.add({
      targets: ring2,
      scaleX: 4,
      scaleY: 4,
      alpha: 0,
      duration: 600,
      onComplete: () => ring2.destroy()
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
   * Set player animation
   */
  private setAnimation(animation: string): void {
    if (this.currentAnimation !== animation) {
      this.currentAnimation = animation;
      this.animationFrame = 0;
      this.animationTimer = 0;
      this.updateAnimationFrame();
    }
  }

  /**
   * Update animation frame based on current animation
   */
  private updateAnimationFrame(): void {
    const character = this.scene.registry.get('character') || 'boy';
    const characterPrefix = character === 'boy' ? 'player_boy' : 'player_girl';
    
    let frameIndex = 0;
    
    switch (this.currentAnimation) {
      case 'idle':
        frameIndex = 0;
        break;
      case 'walk':
        // Cycle between walk frames (1 and 2)
        frameIndex = (this.animationFrame % 2) + 1;
        break;
      case 'jump':
        frameIndex = 3;
        break;
    }
    
    // Try to use individual frame texture, fallback to main texture
    const frameTexture = `${characterPrefix}_${frameIndex}`;
    if (this.scene.textures.exists(frameTexture)) {
      this.setTexture(frameTexture);
    } else {
      this.setTexture(characterPrefix);
    }
  }

  /**
   * Update animation timer and advance frames
   */
  private updateAnimation(delta: number): void {
    this.animationTimer += delta;
    
    if (this.animationTimer >= this.ANIMATION_SPEED) {
      this.animationTimer = 0;
      this.animationFrame++;
      this.updateAnimationFrame();
    }
  }

  /**
   * Update method called every frame
   */
  update(time: number, delta: number): void {
    // Update animations
    this.updateAnimation(delta);
    
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
    
    // Update jumping state and animation
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      if (this.isJumping && this.body.touching.down) {
        this.isJumping = false;
        // Return to idle or walk animation based on movement
        if (Math.abs(this.body.velocity.x) > 10) {
          this.setAnimation('walk');
        } else {
          this.setAnimation('idle');
        }
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