import * as Phaser from 'phaser';

export type LifeItemType = 'pumpkin' | 'lollipop' | 'apple';

/**
 * Base class for life items that can be collected by the player
 * Requirements: 6.1, 6.2
 */
export class LifeItem extends Phaser.Physics.Arcade.Sprite {
  public readonly itemType: LifeItemType;
  public readonly pointValue: number = 50;
  public readonly lifeValue: number = 1;
  private floatAmplitude: number;
  private floatFrequency: number;
  private initialY: number;
  private timeOffset: number;
  
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, itemType: LifeItemType) {
    super(scene, x, y, texture);
    
    this.itemType = itemType;
    this.initialY = y;
    this.floatAmplitude = 5; // Gentle floating motion
    this.floatFrequency = 0.002; // Slow floating
    this.timeOffset = Math.random() * Math.PI * 2; // Random start phase
    
    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Configure physics
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setGravityY(0); // No gravity - items float in place
      this.body.setSize(24, 24); // Collision box
      this.body.setImmovable(true); // Items don't move when hit
    }
    
    // Visual effects
    this.setScale(0.8); // Slightly smaller than enemies
  }
  
  /**
   * Update life item (floating animation)
   */
  update(): void {
    // Gentle floating animation
    const time = this.scene.time.now;
    const floatOffset = Math.sin(time * this.floatFrequency + this.timeOffset) * this.floatAmplitude;
    this.y = this.initialY + floatOffset;
    
    // Gentle glow effect
    const glowAlpha = 0.8 + Math.sin(time * 0.003 + this.timeOffset) * 0.2;
    this.setAlpha(glowAlpha);
  }
  
  /**
   * Handle collection by player
   * Requirements: 6.2
   */
  collect(): void {
    // TODO: Play collection sound effect
    
    // Destroy the item
    this.destroy();
  }
  
  /**
   * Get the points awarded for collecting this item
   */
  getPointValue(): number {
    return this.pointValue;
  }
  
  /**
   * Get the life value awarded for collecting this item
   */
  getLifeValue(): number {
    return this.lifeValue;
  }
}

/**
 * Factory class for creating life item instances
 */
export class LifeItemFactory {
  private static readonly LIFE_ITEM_TYPES: LifeItemType[] = ['pumpkin', 'lollipop', 'apple'];
  
  /**
   * Create a random life item
   * @param scene - Phaser scene
   * @param x - X position
   * @param y - Y position (should be at jump height)
   * @returns LifeItem instance
   */
  static createRandomLifeItem(scene: Phaser.Scene, x: number, y: number): LifeItem {
    const randomType = this.LIFE_ITEM_TYPES[Math.floor(Math.random() * this.LIFE_ITEM_TYPES.length)];
    return this.createLifeItem(scene, x, y, randomType);
  }
  
  /**
   * Create a specific life item
   * @param scene - Phaser scene
   * @param x - X position
   * @param y - Y position
   * @param type - Life item type
   * @returns LifeItem instance
   */
  static createLifeItem(scene: Phaser.Scene, x: number, y: number, type: LifeItemType): LifeItem {
    // For now, use placeholder texture - will be replaced with actual sprites
    const texture = `life_item_${type}`;
    return new LifeItem(scene, x, y, texture, type);
  }
  
  /**
   * Get appropriate spawn height for life items (requires jumping to reach)
   * @param groundY - Ground level Y position
   * @returns Y position that requires jumping to collect
   */
  static getSpawnHeight(groundY: number): number {
    // Position items at a height that requires jumping (player jump height is ~360px)
    // Place items at various heights between 80-120px above ground
    const minHeight = 80;
    const maxHeight = 120;
    return groundY - (minHeight + Math.random() * (maxHeight - minHeight));
  }
  
  /**
   * Get all available life item types
   */
  static getAllLifeItemTypes(): LifeItemType[] {
    return [...this.LIFE_ITEM_TYPES];
  }
}