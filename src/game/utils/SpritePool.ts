/**
 * Optimized sprite pooling system for Phaser game objects
 * Reduces garbage collection by reusing sprites
 */

export class SpritePool {
  private scene: Phaser.Scene;
  private pools: Map<string, Phaser.GameObjects.Sprite[]> = new Map();
  private activePools: Map<string, Set<Phaser.GameObjects.Sprite>> = new Map();
  private maxPoolSize: number;

  constructor(scene: Phaser.Scene, maxPoolSize: number = 50) {
    this.scene = scene;
    this.maxPoolSize = maxPoolSize;
  }

  /**
   * Get a sprite from the pool or create a new one
   */
  getSprite(key: string, texture: string, frame?: string | number): Phaser.GameObjects.Sprite {
    let pool = this.pools.get(key);
    let activePool = this.activePools.get(key);

    if (!pool) {
      pool = [];
      this.pools.set(key, pool);
    }

    if (!activePool) {
      activePool = new Set();
      this.activePools.set(key, activePool);
    }

    let sprite: Phaser.GameObjects.Sprite;

    // Try to get from pool
    if (pool.length > 0) {
      sprite = pool.pop()!;
      sprite.setActive(true);
      sprite.setVisible(true);
    } else {
      // Create new sprite
      sprite = this.scene.add.sprite(0, 0, texture, frame);
    }

    // Add to active pool
    activePool.add(sprite);

    return sprite;
  }

  /**
   * Return a sprite to the pool
   */
  releaseSprite(key: string, sprite: Phaser.GameObjects.Sprite): void {
    const pool = this.pools.get(key);
    const activePool = this.activePools.get(key);

    if (!pool || !activePool) {
      return;
    }

    // Remove from active pool
    activePool.delete(sprite);

    // Reset sprite state
    sprite.setActive(false);
    sprite.setVisible(false);
    sprite.setPosition(0, 0);
    sprite.setRotation(0);
    sprite.setScale(1);
    sprite.setAlpha(1);
    sprite.clearTint();

    // Stop any animations
    if (sprite.anims) {
      sprite.anims.stop();
    }

    // Return to pool if not at max capacity
    if (pool.length < this.maxPoolSize) {
      pool.push(sprite);
    } else {
      // Destroy excess sprites
      sprite.destroy();
    }
  }

  /**
   * Get all active sprites of a type
   */
  getActiveSprites(key: string): Phaser.GameObjects.Sprite[] {
    const activePool = this.activePools.get(key);
    return activePool ? Array.from(activePool) : [];
  }

  /**
   * Release all active sprites of a type
   */
  releaseAllSprites(key: string): void {
    const activePool = this.activePools.get(key);
    if (!activePool) return;

    const sprites = Array.from(activePool);
    sprites.forEach(sprite => this.releaseSprite(key, sprite));
  }

  /**
   * Clear all pools and destroy sprites
   */
  clearAll(): void {
    // Destroy all pooled sprites
    this.pools.forEach(pool => {
      pool.forEach(sprite => sprite.destroy());
    });

    // Destroy all active sprites
    this.activePools.forEach((activePool, key) => {
      activePool.forEach(sprite => sprite.destroy());
    });

    this.pools.clear();
    this.activePools.clear();
  }

  /**
   * Get pool statistics for debugging
   */
  getStats(): Record<string, { pooled: number; active: number }> {
    const stats: Record<string, { pooled: number; active: number }> = {};

    this.pools.forEach((pool, key) => {
      const activePool = this.activePools.get(key);
      stats[key] = {
        pooled: pool.length,
        active: activePool ? activePool.size : 0,
      };
    });

    return stats;
  }
}

/**
 * Particle pool for efficient particle effects
 */
export class ParticlePool {
  private scene: Phaser.Scene;
  private particles: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  private activeParticles: Set<Phaser.GameObjects.Particles.ParticleEmitter> = new Set();
  private maxPoolSize: number;

  constructor(scene: Phaser.Scene, maxPoolSize: number = 20) {
    this.scene = scene;
    this.maxPoolSize = maxPoolSize;
  }

  /**
   * Get a particle emitter from the pool
   */
  getEmitter(texture: string, config?: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig): Phaser.GameObjects.Particles.ParticleEmitter {
    let emitter: Phaser.GameObjects.Particles.ParticleEmitter;

    if (this.particles.length > 0) {
      emitter = this.particles.pop()!;
      if (config) {
        emitter.setConfig(config);
      }
    } else {
      emitter = this.scene.add.particles(0, 0, texture, config);
    }

    this.activeParticles.add(emitter);
    return emitter;
  }

  /**
   * Return a particle emitter to the pool
   */
  releaseEmitter(emitter: Phaser.GameObjects.Particles.ParticleEmitter): void {
    this.activeParticles.delete(emitter);

    // Stop and reset emitter
    emitter.stop();
    emitter.killAll();
    emitter.setPosition(0, 0);

    if (this.particles.length < this.maxPoolSize) {
      this.particles.push(emitter);
    } else {
      emitter.destroy();
    }
  }

  /**
   * Clear all particle emitters
   */
  clearAll(): void {
    this.particles.forEach(emitter => {
      emitter.destroy();
    });

    this.activeParticles.forEach(emitter => {
      emitter.destroy();
    });

    this.particles.length = 0;
    this.activeParticles.clear();
  }
}

/**
 * Tween pool for efficient animations
 */
export class TweenPool {
  private scene: Phaser.Scene;
  private tweens: Phaser.Tweens.Tween[] = [];
  private activeTweens: Set<Phaser.Tweens.Tween> = new Set();
  private maxPoolSize: number;

  constructor(scene: Phaser.Scene, maxPoolSize: number = 30) {
    this.scene = scene;
    this.maxPoolSize = maxPoolSize;
  }

  /**
   * Get a tween from the pool
   */
  getTween(config: Phaser.Types.Tweens.TweenBuilderConfig): Phaser.Tweens.Tween {
    let tween: Phaser.Tweens.Tween;

    if (this.tweens.length > 0) {
      tween = this.tweens.pop()!;
      // Reset the tween with new config
      tween.stop();
      tween.reset();
      // For simplicity, just create a new tween instead of trying to reconfigure
      tween = this.scene.tweens.add(config);
    } else {
      tween = this.scene.tweens.add(config);
    }

    this.activeTweens.add(tween);
    return tween;
  }

  /**
   * Return a tween to the pool
   */
  releaseTween(tween: Phaser.Tweens.Tween): void {
    this.activeTweens.delete(tween);

    // Stop and reset tween
    tween.stop();
    tween.remove();

    if (this.tweens.length < this.maxPoolSize) {
      this.tweens.push(tween);
    } else {
      tween.destroy();
    }
  }

  /**
   * Clear all tweens
   */
  clearAll(): void {
    this.tweens.forEach(tween => tween.destroy());
    this.activeTweens.forEach(tween => tween.destroy());

    this.tweens.length = 0;
    this.activeTweens.clear();
  }
}