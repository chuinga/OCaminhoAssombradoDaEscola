import * as Phaser from 'phaser';
import { Player } from '../entities/Player';
import { DifficultyConfig } from '../../types';
import { EnemyFactory, EnemyType } from '../entities/EnemyFactory';
import { LifeItemFactory, LifeItem } from '../entities/LifeItem';
import { WeaponFactory } from '../entities/WeaponFactory';
import { audioManager } from '../utils/AudioManager';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private lifeItems!: Phaser.Physics.Arcade.Group;
  private schoolGate!: Phaser.GameObjects.Image;

  // Parallax background layers
  private backgroundLayers: {
    moon_clouds?: Phaser.GameObjects.TileSprite;
    houses?: Phaser.GameObjects.TileSprite;
    trees?: Phaser.GameObjects.TileSprite;
    street?: Phaser.GameObjects.TileSprite;
  } = {};

  // World configuration
  private readonly WORLD_WIDTH = 3500;
  private readonly WORLD_HEIGHT = 720;
  private readonly GRAVITY = 300;

  // Difficulty configuration
  private difficulty: 'easy' | 'medium' | 'impossible' = 'easy';

  // Spawning system
  private lastSpawnX: number = 0;
  private spawnInterval: number = 500; // Distance between spawn checks (px) - reduced for more frequent spawning
  private difficultyConfig!: DifficultyConfig;

  // Side-scrolling spawning system
  private lastEnemySpawnTime: number = 0;
  private lastLifeItemSpawnTime: number = 0;
  private enemySpawnInterval: number = 2000; // Base spawn interval in ms
  private lifeItemSpawnInterval: number = 5000; // Life item spawn interval in ms

  // Debug counters
  private inputCallCount: number = 0;
  private updateCallCount: number = 0;

  // Touch controls state
  private touchControls = {
    moveLeft: false,
    moveRight: false,
    jump: false,
    crouch: false,
    attack: false
  };

  // Keyboard controls state (from browser-level events)
  private keyboardControls = {
    moveLeft: false,
    moveRight: false,
    jump: false,
    crouch: false,
    attack: false
  };

  // Keyboard keys (stored as class properties)
  private keys: {
    left?: Phaser.Input.Keyboard.Key;
    right?: Phaser.Input.Keyboard.Key;
    up?: Phaser.Input.Keyboard.Key;
    down?: Phaser.Input.Keyboard.Key;
    a?: Phaser.Input.Keyboard.Key;
    d?: Phaser.Input.Keyboard.Key;
    w?: Phaser.Input.Keyboard.Key;
    s?: Phaser.Input.Keyboard.Key;
    space?: Phaser.Input.Keyboard.Key;
    esc?: Phaser.Input.Keyboard.Key;
  } = {};

  constructor() {
    super({ key: 'GameScene' });
  }

  /**
   * Initialize scene data
   */
  init(): void {
    // Get difficulty from game registry (set by React component)
    this.difficulty = this.registry.get('difficulty') || 'easy';

    // Initialize difficulty configuration
    this.difficultyConfig = this.getDifficultyConfig();

    // Initialize spawning system
    this.lastSpawnX = 0;

    // Initialize side-scrolling spawning timers
    this.lastEnemySpawnTime = 0;
    this.lastLifeItemSpawnTime = 0;

    // Debug: Check if scene is paused
    console.log('Scene initialized - isPaused:', this.scene.isPaused());
  }

  /**
   * Preload assets for the game scene
   */
  preload(): void {
    // Create Halloween-themed sprites using graphics
    this.createPlayerSprites();
    this.createBackgroundSprites();
    this.createEnemySprites();
    this.createLifeItemSprites();
    this.createEnvironmentSprites();
  }

  /**
   * Create player character sprites with animation frames
   */
  private createPlayerSprites(): void {
    this.createBoyCharacterSprites();
    this.createGirlCharacterSprites();
    
    // Create default player texture (will be overridden by character selection)
    const defaultGraphics = this.add.graphics();
    defaultGraphics.fillStyle(0x00ff00);
    defaultGraphics.fillRect(0, 0, 32, 50);
    defaultGraphics.generateTexture('player', 32, 50);
    defaultGraphics.destroy();
  }

  /**
   * Create boy character sprites with animation frames
   */
  private createBoyCharacterSprites(): void {
    const frameWidth = 32;
    const frameHeight = 50;
    const frames = 4; // idle, walk1, walk2, jump
    
    // Create spritesheet canvas
    const canvas = this.add.renderTexture(0, 0, frameWidth * frames, frameHeight);
    
    // Frame 0: Idle
    this.drawBoyFrame(canvas, 0, 'idle');
    
    // Frame 1: Walk 1
    this.drawBoyFrame(canvas, 1, 'walk1');
    
    // Frame 2: Walk 2  
    this.drawBoyFrame(canvas, 2, 'walk2');
    
    // Frame 3: Jump
    this.drawBoyFrame(canvas, 3, 'jump');
    
    // Generate texture from canvas
    canvas.saveTexture('player_boy_spritesheet');
    canvas.destroy();
    
    // Create individual frame textures
    for (let i = 0; i < frames; i++) {
      const frameGraphics = this.add.graphics();
      this.drawBoyFrameGraphics(frameGraphics, i === 1 ? 'walk1' : i === 2 ? 'walk2' : i === 3 ? 'jump' : 'idle');
      frameGraphics.generateTexture(`player_boy_${i}`, frameWidth, frameHeight);
      frameGraphics.destroy();
    }
    
    // Create main boy texture (idle frame)
    const boyGraphics = this.add.graphics();
    this.drawBoyFrameGraphics(boyGraphics, 'idle');
    boyGraphics.generateTexture('player_boy', frameWidth, frameHeight);
    boyGraphics.destroy();
  }

  /**
   * Draw boy character frame on render texture
   */
  private drawBoyFrame(canvas: Phaser.GameObjects.RenderTexture, frameIndex: number, pose: string): void {
    const frameWidth = 32;
    const x = frameIndex * frameWidth;
    
    const graphics = this.add.graphics();
    this.drawBoyFrameGraphics(graphics, pose);
    
    canvas.draw(graphics, x, 0);
    graphics.destroy();
  }

  /**
   * Draw boy character graphics for different poses
   */
  private drawBoyFrameGraphics(graphics: Phaser.GameObjects.Graphics, pose: string): void {
    const legOffset = pose === 'walk1' ? 2 : pose === 'walk2' ? -2 : 0;
    const armOffset = pose === 'walk1' ? -1 : pose === 'walk2' ? 1 : 0;
    const jumpOffset = pose === 'jump' ? -3 : 0;
    
    // Head (skin tone)
    graphics.fillStyle(0xfdbcb4);
    graphics.fillCircle(16, 12 + jumpOffset, 8);

    // Hair (brown)
    graphics.fillStyle(0x8b4513);
    graphics.fillCircle(16, 8 + jumpOffset, 6);

    // Eyes
    graphics.fillStyle(0x000000);
    graphics.fillCircle(13, 11 + jumpOffset, 1);
    graphics.fillCircle(19, 11 + jumpOffset, 1);

    // Body (shirt - blue)
    graphics.fillStyle(0x4169e1);
    graphics.fillRect(10, 20 + jumpOffset, 12, 16);

    // Arms (skin tone) - animated
    graphics.fillStyle(0xfdbcb4);
    graphics.fillRect(8, 22 + jumpOffset + armOffset, 3, 12);
    graphics.fillRect(21, 22 + jumpOffset - armOffset, 3, 12);

    // Legs (pants - dark blue) - animated
    graphics.fillStyle(0x191970);
    graphics.fillRect(12, 36 + jumpOffset, 3, 12 + legOffset);
    graphics.fillRect(17, 36 + jumpOffset, 3, 12 - legOffset);

    // Shoes (black)
    graphics.fillStyle(0x000000);
    graphics.fillRect(11, 46 + jumpOffset + legOffset, 5, 3);
    graphics.fillRect(16, 46 + jumpOffset - legOffset, 5, 3);
  }

  /**
   * Create girl character sprites with animation frames
   */
  private createGirlCharacterSprites(): void {
    const frameWidth = 32;
    const frameHeight = 50;
    const frames = 4; // idle, walk1, walk2, jump
    
    // Create spritesheet canvas
    const canvas = this.add.renderTexture(0, 0, frameWidth * frames, frameHeight);
    
    // Frame 0: Idle
    this.drawGirlFrame(canvas, 0, 'idle');
    
    // Frame 1: Walk 1
    this.drawGirlFrame(canvas, 1, 'walk1');
    
    // Frame 2: Walk 2  
    this.drawGirlFrame(canvas, 2, 'walk2');
    
    // Frame 3: Jump
    this.drawGirlFrame(canvas, 3, 'jump');
    
    // Generate texture from canvas
    canvas.saveTexture('player_girl_spritesheet');
    canvas.destroy();
    
    // Create individual frame textures
    for (let i = 0; i < frames; i++) {
      const frameGraphics = this.add.graphics();
      this.drawGirlFrameGraphics(frameGraphics, i === 1 ? 'walk1' : i === 2 ? 'walk2' : i === 3 ? 'jump' : 'idle');
      frameGraphics.generateTexture(`player_girl_${i}`, frameWidth, frameHeight);
      frameGraphics.destroy();
    }
    
    // Create main girl texture (idle frame)
    const girlGraphics = this.add.graphics();
    this.drawGirlFrameGraphics(girlGraphics, 'idle');
    girlGraphics.generateTexture('player_girl', frameWidth, frameHeight);
    girlGraphics.destroy();
  }

  /**
   * Draw girl character frame on render texture
   */
  private drawGirlFrame(canvas: Phaser.GameObjects.RenderTexture, frameIndex: number, pose: string): void {
    const frameWidth = 32;
    const x = frameIndex * frameWidth;
    
    const graphics = this.add.graphics();
    this.drawGirlFrameGraphics(graphics, pose);
    
    canvas.draw(graphics, x, 0);
    graphics.destroy();
  }

  /**
   * Draw girl character graphics for different poses
   */
  private drawGirlFrameGraphics(graphics: Phaser.GameObjects.Graphics, pose: string): void {
    const legOffset = pose === 'walk1' ? 2 : pose === 'walk2' ? -2 : 0;
    const armOffset = pose === 'walk1' ? -1 : pose === 'walk2' ? 1 : 0;
    const jumpOffset = pose === 'jump' ? -3 : 0;
    const dressSwing = pose === 'walk1' ? 1 : pose === 'walk2' ? -1 : 0;
    
    // Head (skin tone)
    graphics.fillStyle(0xfdbcb4);
    graphics.fillCircle(16, 12 + jumpOffset, 8);

    // Hair (blonde)
    graphics.fillStyle(0xffd700);
    graphics.fillCircle(16, 8 + jumpOffset, 7);

    // Eyes
    graphics.fillStyle(0x000000);
    graphics.fillCircle(13, 11 + jumpOffset, 1);
    graphics.fillCircle(19, 11 + jumpOffset, 1);

    // Body (dress - pink) - animated swing
    graphics.fillStyle(0xff69b4);
    graphics.fillRect(9 + dressSwing, 20 + jumpOffset, 14, 18);

    // Arms (skin tone) - animated
    graphics.fillStyle(0xfdbcb4);
    graphics.fillRect(7, 22 + jumpOffset + armOffset, 3, 12);
    graphics.fillRect(22, 22 + jumpOffset - armOffset, 3, 12);

    // Legs (skin tone) - animated
    graphics.fillStyle(0xfdbcb4);
    graphics.fillRect(12, 38 + jumpOffset, 3, 8 + legOffset);
    graphics.fillRect(17, 38 + jumpOffset, 3, 8 - legOffset);

    // Shoes (red)
    graphics.fillStyle(0xff0000);
    graphics.fillRect(11, 46 + jumpOffset + legOffset, 5, 3);
    graphics.fillRect(16, 46 + jumpOffset - legOffset, 5, 3);
  }

  /**
   * Draw a spooky tree silhouette
   */
  private drawSpookyTree(graphics: Phaser.GameObjects.Graphics, x: number, type: string): void {
    const treeHeight = 180 + Math.random() * 120;
    const baseY = 720 - treeHeight;
    
    // Tree trunk
    graphics.fillStyle(0x2d1b0e);
    const trunkWidth = type === 'gnarled' ? 20 : 12;
    graphics.fillRect(x, baseY, trunkWidth, treeHeight);

    // Trunk texture
    graphics.fillStyle(0x1a0f08);
    for (let i = 0; i < 3; i++) {
      graphics.fillRect(x + 2, baseY + i * 40, 2, 15);
    }

    switch (type) {
      case 'dead':
        // Completely bare with jagged branches
        graphics.fillStyle(0x2d1b0e);
        // Main branches
        graphics.fillRect(x - 25, baseY + 30, 35, 4);
        graphics.fillRect(x + trunkWidth, baseY + 20, 30, 3);
        graphics.fillRect(x - 15, baseY + 50, 20, 3);
        
        // Smaller twigs
        graphics.fillRect(x - 30, baseY + 25, 8, 2);
        graphics.fillRect(x + trunkWidth + 25, baseY + 15, 10, 2);
        break;
        
      case 'twisted':
        // Curved trunk and twisted branches
        graphics.fillStyle(0x2d1b0e);
        // Curved sections
        graphics.fillRect(x - 5, baseY + 40, trunkWidth + 10, 8);
        graphics.fillRect(x + 5, baseY + 80, trunkWidth, 8);
        
        // Twisted branches
        graphics.fillRect(x - 20, baseY + 25, 25, 5);
        graphics.fillRect(x + trunkWidth - 5, baseY + 35, 28, 4);
        graphics.fillRect(x - 10, baseY + 60, 15, 3);
        break;
        
      case 'gnarled':
        // Thick trunk with many branches
        graphics.fillStyle(0x2d1b0e);
        // Multiple branch levels
        for (let level = 0; level < 4; level++) {
          const branchY = baseY + 20 + level * 25;
          const leftBranch = 15 + Math.random() * 10;
          const rightBranch = 15 + Math.random() * 10;
          
          graphics.fillRect(x - leftBranch, branchY, leftBranch + 5, 4);
          graphics.fillRect(x + trunkWidth, branchY + 5, rightBranch, 3);
        }
        break;
        
      default: // normal
        // Standard spooky tree
        graphics.fillStyle(0x2d1b0e);
        graphics.fillRect(x - 20, baseY + 20, 27, 3);
        graphics.fillRect(x + 7, baseY + 30, 28, 3);
        graphics.fillRect(x - 12, baseY + 45, 18, 2);
    }

    // Sparse dead leaves
    if (Math.random() > 0.6) {
      graphics.fillStyle(0x8b4513);
      const leafCount = Math.floor(Math.random() * 3) + 1;
      for (let l = 0; l < leafCount; l++) {
        const leafX = x - 20 + Math.random() * 40;
        const leafY = baseY + 20 + Math.random() * 40;
        graphics.fillCircle(leafX, leafY, 3 + Math.random() * 3);
      }
    }

    // Hanging moss or cobwebs
    if (type === 'twisted' && Math.random() > 0.7) {
      graphics.fillStyle(0x666666, 0.6);
      graphics.fillRect(x - 10, baseY + 30, 1, 15);
      graphics.fillRect(x + 15, baseY + 25, 1, 20);
    }
  }

  /**
   * Draw a Halloween-themed house silhouette
   */
  private drawHalloweenHouse(graphics: Phaser.GameObjects.Graphics, x: number, type: string): void {
    let height: number;
    let width: number;
    
    switch (type) {
      case 'tall':
        height = 200 + Math.random() * 80;
        width = 80;
        break;
      case 'wide':
        height = 120 + Math.random() * 60;
        width = 140;
        break;
      case 'spooky':
        height = 180 + Math.random() * 70;
        width = 100;
        break;
      case 'mansion':
        height = 250 + Math.random() * 50;
        width = 160;
        break;
      default: // normal
        height = 150 + Math.random() * 80;
        width = 100;
    }

    const baseY = 720 - height;

    // House body
    graphics.fillStyle(0x000000);
    graphics.fillRect(x, baseY, width, height);

    // Roof variations
    if (type === 'spooky') {
      // Crooked spooky roof
      graphics.fillTriangle(
        x - 15, baseY,
        x + width/2 - 10, baseY - 50,
        x + width + 15, baseY
      );
      // Add chimney
      graphics.fillRect(x + width - 20, baseY - 30, 12, 25);
    } else if (type === 'mansion') {
      // Multiple roof sections
      graphics.fillTriangle(x - 10, baseY, x + 40, baseY - 40, x + 90, baseY);
      graphics.fillTriangle(x + 70, baseY, x + 110, baseY - 35, x + width + 10, baseY);
    } else {
      // Standard triangular roof
      graphics.fillTriangle(
        x - 10, baseY,
        x + width/2, baseY - 40,
        x + width + 10, baseY
      );
    }

    // Windows with Halloween decorations
    const windowCount = Math.floor(width / 40);
    for (let w = 0; w < windowCount; w++) {
      const windowX = x + 15 + w * 40;
      const windowY = baseY + 30;
      
      // Window frame
      graphics.fillStyle(0x1a1a1a);
      graphics.fillRect(windowX, windowY, 20, 25);
      
      // Lit windows (Halloween colors)
      if (Math.random() > 0.4) {
        const lightColor = Math.random() > 0.7 ? 0xff6600 : 0xffff99; // Orange or yellow
        graphics.fillStyle(lightColor);
        graphics.fillRect(windowX + 2, windowY + 2, 16, 21);
        
        // Window cross
        graphics.fillStyle(0x000000);
        graphics.fillRect(windowX + 9, windowY + 2, 2, 21);
        graphics.fillRect(windowX + 2, windowY + 12, 16, 2);
      }
    }

    // Halloween decorations
    if (Math.random() > 0.6) {
      // Porch light
      graphics.fillStyle(0xff6600);
      graphics.fillCircle(x + width/2, baseY + height - 10, 3);
    }
    
    if (type === 'spooky' && Math.random() > 0.5) {
      // Bats around spooky house
      graphics.fillStyle(0x000000);
      graphics.fillEllipse(x - 20, baseY - 20, 8, 4);
      graphics.fillEllipse(x + width + 15, baseY - 30, 6, 3);
    }
  }

  /**
   * Create background layer sprites
   */
  private createBackgroundSprites(): void {
    // Moon and clouds layer - Enhanced Halloween atmosphere
    const moonCloudsGraphics = this.add.graphics();

    // Night sky gradient - deeper Halloween colors
    moonCloudsGraphics.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a0a2e, 0x1a0a2e, 1);
    moonCloudsGraphics.fillRect(0, 0, 800, 720);

    // Full moon with eerie glow
    moonCloudsGraphics.fillStyle(0xfff8dc);
    moonCloudsGraphics.fillCircle(650, 100, 45);
    
    // Moon glow effect
    moonCloudsGraphics.fillStyle(0xffff99, 0.3);
    moonCloudsGraphics.fillCircle(650, 100, 60);
    moonCloudsGraphics.fillStyle(0xffff99, 0.1);
    moonCloudsGraphics.fillCircle(650, 100, 80);

    // Moon craters - more detailed
    moonCloudsGraphics.fillStyle(0xe6e6d3);
    moonCloudsGraphics.fillCircle(645, 95, 8);
    moonCloudsGraphics.fillCircle(655, 105, 5);
    moonCloudsGraphics.fillCircle(640, 110, 3);
    moonCloudsGraphics.fillCircle(660, 90, 4);

    // More stars with twinkling effect
    moonCloudsGraphics.fillStyle(0xffffff);
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 800;
      const y = Math.random() * 300;
      const size = Math.random() * 2 + 0.5;
      moonCloudsGraphics.fillCircle(x, y, size);
      
      // Add some larger, brighter stars
      if (Math.random() > 0.8) {
        moonCloudsGraphics.fillStyle(0xffffcc);
        moonCloudsGraphics.fillCircle(x, y, size + 1);
        moonCloudsGraphics.fillStyle(0xffffff);
      }
    }

    // Spooky clouds with more detail
    moonCloudsGraphics.fillStyle(0x2a2a2a);
    moonCloudsGraphics.fillEllipse(200, 150, 140, 50);
    moonCloudsGraphics.fillEllipse(180, 140, 80, 30);
    moonCloudsGraphics.fillEllipse(220, 160, 100, 35);
    
    moonCloudsGraphics.fillEllipse(500, 200, 120, 45);
    moonCloudsGraphics.fillEllipse(480, 190, 70, 25);
    moonCloudsGraphics.fillEllipse(520, 210, 90, 30);

    // Wispy cloud edges
    moonCloudsGraphics.fillStyle(0x404040, 0.5);
    moonCloudsGraphics.fillEllipse(150, 145, 60, 20);
    moonCloudsGraphics.fillEllipse(250, 155, 80, 25);
    moonCloudsGraphics.fillEllipse(450, 195, 70, 20);
    moonCloudsGraphics.fillEllipse(550, 205, 60, 18);

    moonCloudsGraphics.generateTexture('moon_clouds', 800, 720);
    moonCloudsGraphics.destroy();

    // Houses layer - Enhanced Halloween neighborhood
    const housesGraphics = this.add.graphics();

    // Dark sky with purple tint
    housesGraphics.fillGradientStyle(0x1a1a3e, 0x1a1a3e, 0x0f0f2e, 0x0f0f2e, 1);
    housesGraphics.fillRect(0, 0, 800, 720);

    // Halloween house silhouettes with more variety
    const houseTypes = ['normal', 'tall', 'wide', 'spooky', 'mansion'];
    for (let i = 0; i < 6; i++) {
      const x = i * 130 + 30;
      const houseType = houseTypes[i % houseTypes.length];
      
      this.drawHalloweenHouse(housesGraphics, x, houseType);
    }

    housesGraphics.generateTexture('houses', 800, 720);
    housesGraphics.destroy();

    // Trees layer - Enhanced spooky forest
    const treesGraphics = this.add.graphics();

    // Darker sky with fog effect
    treesGraphics.fillGradientStyle(0x1a2460, 0x1a2460, 0x0a1040, 0x0a1040, 1);
    treesGraphics.fillRect(0, 0, 800, 720);

    // Ground fog
    treesGraphics.fillStyle(0x404040, 0.3);
    treesGraphics.fillEllipse(400, 680, 800, 80);
    treesGraphics.fillStyle(0x505050, 0.2);
    treesGraphics.fillEllipse(200, 690, 400, 60);
    treesGraphics.fillEllipse(600, 685, 350, 70);

    // Spooky trees with more variety
    const treeTypes = ['dead', 'twisted', 'normal', 'gnarled'];
    for (let i = 0; i < 10; i++) {
      const x = i * 80 + 20;
      const treeType = treeTypes[i % treeTypes.length];
      
      this.drawSpookyTree(treesGraphics, x, treeType);
    }

    treesGraphics.generateTexture('trees', 800, 720);
    treesGraphics.destroy();

    // Street layer - Enhanced Halloween street
    const streetGraphics = this.add.graphics();

    // Street/ground with Halloween atmosphere
    streetGraphics.fillGradientStyle(0x4a2c6a, 0x4a2c6a, 0x2d1b49, 0x2d1b49, 1);
    streetGraphics.fillRect(0, 0, 800, 100);

    // Cracked asphalt texture
    streetGraphics.fillStyle(0x3a1c5a);
    for (let i = 0; i < 15; i++) {
      const crackX = Math.random() * 800;
      const crackY = 20 + Math.random() * 60;
      const crackLength = 20 + Math.random() * 40;
      streetGraphics.fillRect(crackX, crackY, crackLength, 1);
      
      // Branching cracks
      if (Math.random() > 0.7) {
        streetGraphics.fillRect(crackX + crackLength/2, crackY, 1, 10);
      }
    }

    // Street lines - worn and broken
    streetGraphics.fillStyle(0x666666);
    for (let i = 0; i < 800; i += 60) {
      const lineLength = 25 + Math.random() * 10; // Varying lengths
      const lineY = 49 + (Math.random() - 0.5) * 2; // Slight vertical variation
      streetGraphics.fillRect(i, lineY, lineLength, 2);
      
      // Some lines are faded/broken
      if (Math.random() > 0.8) {
        streetGraphics.fillStyle(0x444444);
        streetGraphics.fillRect(i + lineLength/2, lineY, 5, 2);
        streetGraphics.fillStyle(0x666666);
      }
    }

    // Sidewalk edge with wear
    streetGraphics.fillStyle(0x696969);
    streetGraphics.fillRect(0, 0, 800, 5);
    
    // Sidewalk cracks
    streetGraphics.fillStyle(0x555555);
    for (let i = 0; i < 10; i++) {
      const x = i * 80 + Math.random() * 40;
      streetGraphics.fillRect(x, 0, 1, 5);
    }

    // Fallen leaves on street
    streetGraphics.fillStyle(0x8b4513);
    for (let i = 0; i < 20; i++) {
      const leafX = Math.random() * 800;
      const leafY = 10 + Math.random() * 80;
      streetGraphics.fillEllipse(leafX, leafY, 4, 2);
    }

    // Puddles reflecting moonlight
    streetGraphics.fillStyle(0x1a1a3a, 0.7);
    streetGraphics.fillEllipse(150, 60, 30, 8);
    streetGraphics.fillEllipse(400, 45, 25, 6);
    streetGraphics.fillEllipse(650, 70, 35, 10);

    streetGraphics.generateTexture('street', 800, 100);
    streetGraphics.destroy();
  }

  /**
   * Create enemy sprites with Halloween theme and animations
   */
  private createEnemySprites(): void {
    this.createGhostSprites();
    this.createBatSprites();
    this.createVampireSprites();
    this.createMummySprites();
  }

  /**
   * Create ghost sprites with floating animation frames
   */
  private createGhostSprites(): void {
    const frameWidth = 32;
    const frameHeight = 40;
    const frames = 3; // float1, float2, float3
    
    // Create individual frame textures
    for (let i = 0; i < frames; i++) {
      const frameGraphics = this.add.graphics();
      this.drawGhostFrameGraphics(frameGraphics, i);
      frameGraphics.generateTexture(`ghost_${i}`, frameWidth, frameHeight);
      frameGraphics.destroy();
    }
    
    // Create main ghost texture (frame 0)
    const ghostGraphics = this.add.graphics();
    this.drawGhostFrameGraphics(ghostGraphics, 0);
    ghostGraphics.generateTexture('ghost', frameWidth, frameHeight);
    ghostGraphics.destroy();
  }

  /**
   * Draw ghost frame graphics with floating animation
   */
  private drawGhostFrameGraphics(graphics: Phaser.GameObjects.Graphics, frame: number): void {
    const floatOffset = frame === 1 ? -1 : frame === 2 ? 1 : 0;
    const tailWave = frame === 1 ? 1 : frame === 2 ? -1 : 0;
    
    // Ghost body (white with transparency effect)
    graphics.fillStyle(0xf0f0f0);
    graphics.fillEllipse(16, 20 + floatOffset, 28, 32);

    // Ghost tail (wavy bottom) - animated
    graphics.fillStyle(0xf0f0f0);
    graphics.fillTriangle(2, 32 + floatOffset, 8 + tailWave, 36 + floatOffset, 12, 32 + floatOffset);
    graphics.fillTriangle(12, 32 + floatOffset, 16, 28 + floatOffset + tailWave, 20, 32 + floatOffset);
    graphics.fillTriangle(20, 32 + floatOffset, 24 - tailWave, 36 + floatOffset, 30, 32 + floatOffset);

    // Eyes (black) - slight blink animation
    const eyeHeight = frame === 1 ? 4 : 6;
    graphics.fillStyle(0x000000);
    graphics.fillEllipse(10, 16 + floatOffset, 4, eyeHeight);
    graphics.fillEllipse(22, 16 + floatOffset, 4, eyeHeight);

    // Mouth (surprised)
    graphics.fillEllipse(16, 24 + floatOffset, 3, 4);
  }

  /**
   * Create bat sprites with wing flapping animation
   */
  private createBatSprites(): void {
    const frameWidth = 24;
    const frameHeight = 20;
    const frames = 3; // wings up, wings middle, wings down
    
    // Create individual frame textures
    for (let i = 0; i < frames; i++) {
      const frameGraphics = this.add.graphics();
      this.drawBatFrameGraphics(frameGraphics, i);
      frameGraphics.generateTexture(`bat_${i}`, frameWidth, frameHeight);
      frameGraphics.destroy();
    }
    
    // Create main bat texture (frame 1 - middle position)
    const batGraphics = this.add.graphics();
    this.drawBatFrameGraphics(batGraphics, 1);
    batGraphics.generateTexture('bat', frameWidth, frameHeight);
    batGraphics.destroy();
  }

  /**
   * Draw bat frame graphics with wing flapping animation
   */
  private drawBatFrameGraphics(graphics: Phaser.GameObjects.Graphics, frame: number): void {
    const wingAngle = frame === 0 ? -2 : frame === 2 ? 2 : 0;
    
    // Bat body
    graphics.fillStyle(0x2d1b0e);
    graphics.fillEllipse(12, 12, 8, 12);

    // Bat wings - animated flapping
    graphics.fillStyle(0x2d1b0e);
    // Left wing
    graphics.fillTriangle(4, 10 + wingAngle, 0, 6 + wingAngle, 8, 12);
    graphics.fillTriangle(2, 14 - wingAngle, 6, 18 - wingAngle, 8, 12);
    // Right wing  
    graphics.fillTriangle(20, 10 + wingAngle, 24, 6 + wingAngle, 16, 12);
    graphics.fillTriangle(22, 14 - wingAngle, 18, 18 - wingAngle, 16, 12);

    // Eyes (red)
    graphics.fillStyle(0xff0000);
    graphics.fillCircle(10, 10, 1);
    graphics.fillCircle(14, 10, 1);
  }

  /**
   * Create vampire sprites with cape animation
   */
  private createVampireSprites(): void {
    const frameWidth = 32;
    const frameHeight = 48;
    const frames = 3; // cape still, cape left, cape right
    
    // Create individual frame textures
    for (let i = 0; i < frames; i++) {
      const frameGraphics = this.add.graphics();
      this.drawVampireFrameGraphics(frameGraphics, i);
      frameGraphics.generateTexture(`vampire_${i}`, frameWidth, frameHeight);
      frameGraphics.destroy();
    }
    
    // Create main vampire texture (frame 0)
    const vampireGraphics = this.add.graphics();
    this.drawVampireFrameGraphics(vampireGraphics, 0);
    vampireGraphics.generateTexture('vampire', frameWidth, frameHeight);
    vampireGraphics.destroy();
  }

  /**
   * Draw vampire frame graphics with cape animation
   */
  private drawVampireFrameGraphics(graphics: Phaser.GameObjects.Graphics, frame: number): void {
    const capeSwing = frame === 1 ? -2 : frame === 2 ? 2 : 0;
    
    // Head (pale skin)
    graphics.fillStyle(0xe6e6e6);
    graphics.fillCircle(16, 12, 8);

    // Hair (black)
    graphics.fillStyle(0x000000);
    graphics.fillCircle(16, 8, 6);

    // Cape collar
    graphics.fillStyle(0x8b0000);
    graphics.fillRect(8, 18, 16, 4);

    // Eyes (red) - glowing effect
    graphics.fillStyle(0xff0000);
    graphics.fillCircle(13, 11, 1);
    graphics.fillCircle(19, 11, 1);
    // Eye glow
    graphics.fillStyle(0xff6666);
    graphics.fillCircle(13, 11, 2);
    graphics.fillCircle(19, 11, 2);

    // Fangs
    graphics.fillStyle(0xffffff);
    graphics.fillTriangle(12, 14, 14, 18, 16, 14);
    graphics.fillTriangle(16, 14, 18, 18, 20, 14);

    // Body (black cape) - animated
    graphics.fillStyle(0x000000);
    graphics.fillRect(6 + capeSwing, 22, 20, 24);

    // Cape (red interior) - animated swing
    graphics.fillStyle(0x8b0000);
    graphics.fillTriangle(6 + capeSwing, 22, 2 + capeSwing, 46, 10 + capeSwing, 46);
    graphics.fillTriangle(26 + capeSwing, 22, 30 + capeSwing, 46, 22 + capeSwing, 46);
  }

  /**
   * Create mummy sprites with bandage animation
   */
  private createMummySprites(): void {
    const frameWidth = 32;
    const frameHeight = 48;
    const frames = 3; // bandages normal, bandages loose, bandages tight
    
    // Create individual frame textures
    for (let i = 0; i < frames; i++) {
      const frameGraphics = this.add.graphics();
      this.drawMummyFrameGraphics(frameGraphics, i);
      frameGraphics.generateTexture(`mummy_${i}`, frameWidth, frameHeight);
      frameGraphics.destroy();
    }
    
    // Create main mummy texture (frame 0)
    const mummyGraphics = this.add.graphics();
    this.drawMummyFrameGraphics(mummyGraphics, 0);
    mummyGraphics.generateTexture('mummy', frameWidth, frameHeight);
    mummyGraphics.destroy();
  }

  /**
   * Draw mummy frame graphics with bandage animation
   */
  private drawMummyFrameGraphics(graphics: Phaser.GameObjects.Graphics, frame: number): void {
    const bandageOffset = frame === 1 ? 1 : frame === 2 ? -1 : 0;
    
    // Body base (beige)
    graphics.fillStyle(0xf5deb3);
    graphics.fillRect(8, 8, 16, 40);

    // Bandage wrappings (white) - animated
    graphics.fillStyle(0xffffff);
    for (let y = 10; y < 46; y += 6) {
      const offset = (y % 12 === 0) ? bandageOffset : -bandageOffset;
      graphics.fillRect(6 + offset, y, 20, 3);
    }

    // Head wrappings
    graphics.fillStyle(0xffffff);
    graphics.fillRect(10 + bandageOffset, 8, 12, 12);

    // Eyes (glowing) - pulsing effect
    const eyeGlow = frame === 1 ? 0xffff99 : 0xffff00;
    graphics.fillStyle(eyeGlow);
    graphics.fillCircle(13, 14, 2);
    graphics.fillCircle(19, 14, 2);

    // Eye pupils
    graphics.fillStyle(0x000000);
    graphics.fillCircle(13, 14, 1);
    graphics.fillCircle(19, 14, 1);

    // Loose bandage strips (for frame 1)
    if (frame === 1) {
      graphics.fillStyle(0xf0f0f0);
      graphics.fillRect(4, 25, 2, 8);
      graphics.fillRect(26, 30, 2, 6);
    }
  }

  /**
   * Create life item sprites with Halloween theme
   */
  private createLifeItemSprites(): void {
    // Pumpkin life item
    const pumpkinGraphics = this.add.graphics();

    // Pumpkin body
    pumpkinGraphics.fillStyle(0xff6600);
    pumpkinGraphics.fillEllipse(12, 14, 20, 16);

    // Pumpkin ridges - using thin rectangles
    pumpkinGraphics.fillStyle(0xcc5500);
    pumpkinGraphics.fillRect(5, 8, 1, 12);   // Left ridge
    pumpkinGraphics.fillRect(12, 6, 1, 16);  // Center ridge
    pumpkinGraphics.fillRect(19, 8, 1, 12);  // Right ridge

    // Stem
    pumpkinGraphics.fillStyle(0x228b22);
    pumpkinGraphics.fillRect(11, 2, 2, 6);

    // Jack-o'-lantern face
    pumpkinGraphics.fillStyle(0xffff00);
    pumpkinGraphics.fillTriangle(8, 12, 10, 16, 6, 16);  // Left eye
    pumpkinGraphics.fillTriangle(16, 12, 18, 16, 14, 16); // Right eye
    pumpkinGraphics.fillRect(11, 18, 2, 1); // Nose

    // Smile - simplified using rectangle
    pumpkinGraphics.fillRect(8, 20, 8, 2);

    pumpkinGraphics.generateTexture('life_item_pumpkin', 24, 24);
    pumpkinGraphics.destroy();

    // Lollipop life item
    const lollipopGraphics = this.add.graphics();

    // Stick
    lollipopGraphics.fillStyle(0xffffff);
    lollipopGraphics.fillRect(11, 12, 2, 10);

    // Candy (spiral)
    lollipopGraphics.fillStyle(0xff69b4);
    lollipopGraphics.fillCircle(12, 10, 8);

    // Spiral pattern - simplified using circles
    lollipopGraphics.fillStyle(0xffffff);
    lollipopGraphics.fillCircle(12, 10, 1);
    lollipopGraphics.fillCircle(15, 8, 1);
    lollipopGraphics.fillCircle(9, 12, 1);
    lollipopGraphics.fillCircle(14, 12, 1);

    lollipopGraphics.generateTexture('life_item_lollipop', 24, 24);
    lollipopGraphics.destroy();

    // Apple life item
    const appleGraphics = this.add.graphics();

    // Apple body
    appleGraphics.fillStyle(0xff0000);
    appleGraphics.fillEllipse(12, 14, 16, 18);

    // Apple indent (top)
    appleGraphics.fillStyle(0xcc0000);
    appleGraphics.fillEllipse(12, 8, 8, 4);

    // Stem
    appleGraphics.fillStyle(0x8b4513);
    appleGraphics.fillRect(11, 4, 2, 6);

    // Leaf
    appleGraphics.fillStyle(0x228b22);
    appleGraphics.fillEllipse(15, 6, 4, 2);

    // Highlight
    appleGraphics.fillStyle(0xff6666);
    appleGraphics.fillEllipse(9, 11, 4, 6);

    appleGraphics.generateTexture('life_item_apple', 24, 24);
    appleGraphics.destroy();
  }

  /**
   * Create environment sprites
   */
  private createEnvironmentSprites(): void {
    // Enhanced Halloween school gate
    const gateGraphics = this.add.graphics();

    // Stone gate posts with texture
    gateGraphics.fillStyle(0x2d1b0e);
    gateGraphics.fillRect(10, 0, 18, 200);
    gateGraphics.fillRect(72, 0, 18, 200);

    // Stone texture
    gateGraphics.fillStyle(0x1a0f08);
    for (let i = 0; i < 8; i++) {
      gateGraphics.fillRect(12, i * 25, 14, 2);
      gateGraphics.fillRect(74, i * 25 + 10, 14, 2);
    }

    // Weathered gate posts caps
    gateGraphics.fillStyle(0x3d2b1e);
    gateGraphics.fillRect(8, 0, 22, 8);
    gateGraphics.fillRect(70, 0, 22, 8);

    // Ornate iron gate bars
    gateGraphics.fillStyle(0x1a1a1a);
    for (let i = 0; i < 6; i++) {
      const x = 28 + i * 8;
      gateGraphics.fillRect(x, 25, 4, 150);
      
      // Decorative spear points
      gateGraphics.fillTriangle(x, 25, x + 2, 15, x + 4, 25);
      
      // Rust spots
      if (Math.random() > 0.6) {
        gateGraphics.fillStyle(0x8b4513);
        gateGraphics.fillRect(x + 1, 50 + Math.random() * 100, 2, 3);
        gateGraphics.fillStyle(0x1a1a1a);
      }
    }

    // Gate top with decorative ironwork
    gateGraphics.fillStyle(0x1a1a1a);
    gateGraphics.fillRect(10, 25, 80, 6);
    
    // Decorative scrollwork
    gateGraphics.fillStyle(0x2a2a2a);
    gateGraphics.fillCircle(30, 28, 3);
    gateGraphics.fillCircle(50, 28, 3);
    gateGraphics.fillCircle(70, 28, 3);

    // Weathered school sign
    gateGraphics.fillStyle(0x6b4423);
    gateGraphics.fillRect(18, 45, 64, 35);

    // Sign frame
    gateGraphics.fillStyle(0x4a2f16);
    gateGraphics.fillRect(16, 43, 68, 39);
    gateGraphics.fillRect(18, 45, 64, 35);

    // Aged sign background
    gateGraphics.fillStyle(0xf0f0e0);
    gateGraphics.fillRect(20, 47, 60, 31);

    // Weather stains on sign
    gateGraphics.fillStyle(0xd0d0c0);
    gateGraphics.fillEllipse(25, 52, 8, 4);
    gateGraphics.fillEllipse(70, 70, 6, 3);

    // Sign text placeholder (would be "ESCOLA" in actual implementation)
    gateGraphics.fillStyle(0x2d1b0e);
    gateGraphics.fillRect(25, 52, 50, 3);
    gateGraphics.fillRect(25, 58, 45, 3);
    gateGraphics.fillRect(25, 64, 40, 3);

    // Ivy growing on posts
    gateGraphics.fillStyle(0x2d4a2d);
    gateGraphics.fillEllipse(15, 120, 8, 25);
    gateGraphics.fillEllipse(12, 140, 6, 20);
    gateGraphics.fillEllipse(85, 110, 7, 30);

    // Gate hinges
    gateGraphics.fillStyle(0x3a3a3a);
    gateGraphics.fillRect(25, 40, 6, 4);
    gateGraphics.fillRect(25, 160, 6, 4);

    // Spooky lanterns (unlit)
    gateGraphics.fillStyle(0x1a1a1a);
    gateGraphics.fillRect(5, 35, 8, 12);
    gateGraphics.fillRect(87, 35, 8, 12);
    
    // Lantern glass (dark)
    gateGraphics.fillStyle(0x0a0a0a);
    gateGraphics.fillRect(6, 36, 6, 10);
    gateGraphics.fillRect(88, 36, 6, 10);

    gateGraphics.generateTexture('school_gate', 100, 200);
    gateGraphics.destroy();

    // Create weapon attack effects
    this.createWeaponEffects();

    // Create explosion effects
    this.createExplosionEffects();
  }

  /**
   * Create visual effects for weapon attacks
   */
  private createWeaponEffects(): void {
    // Katana slash effect
    const katanaSlashGraphics = this.add.graphics();
    katanaSlashGraphics.fillStyle(0xc0c0c0, 0.8);
    katanaSlashGraphics.fillEllipse(20, 10, 35, 8);
    katanaSlashGraphics.fillStyle(0xffffff, 0.6);
    katanaSlashGraphics.fillEllipse(20, 10, 25, 5);
    katanaSlashGraphics.generateTexture('katana_slash', 40, 20);
    katanaSlashGraphics.destroy();

    // Baseball bat impact effect
    const batImpactGraphics = this.add.graphics();
    batImpactGraphics.fillStyle(0xffff99, 0.7);
    batImpactGraphics.fillCircle(15, 15, 12);
    batImpactGraphics.fillStyle(0xffffff, 0.5);
    batImpactGraphics.fillCircle(15, 15, 8);
    // Impact lines
    batImpactGraphics.fillStyle(0xffff00, 0.8);
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * Math.PI / 180;
      const x1 = 15 + Math.cos(angle) * 8;
      const y1 = 15 + Math.sin(angle) * 8;
      const x2 = 15 + Math.cos(angle) * 18;
      const y2 = 15 + Math.sin(angle) * 18;
      batImpactGraphics.fillRect(x1, y1, x2 - x1, 2);
    }
    batImpactGraphics.generateTexture('bat_impact', 30, 30);
    batImpactGraphics.destroy();

    // Laser beam effect
    const laserBeamGraphics = this.add.graphics();
    laserBeamGraphics.fillStyle(0x00ff00, 0.9);
    laserBeamGraphics.fillRect(0, 8, 40, 4);
    laserBeamGraphics.fillStyle(0x88ff88, 0.7);
    laserBeamGraphics.fillRect(0, 9, 40, 2);
    laserBeamGraphics.fillStyle(0xffffff, 0.5);
    laserBeamGraphics.fillRect(0, 10, 40, 1);
    laserBeamGraphics.generateTexture('laser_beam', 40, 20);
    laserBeamGraphics.destroy();

    // Laser projectile
    const laserProjectileGraphics = this.add.graphics();
    laserProjectileGraphics.fillStyle(0x00ff00);
    laserProjectileGraphics.fillEllipse(6, 6, 10, 4);
    laserProjectileGraphics.fillStyle(0xffffff, 0.8);
    laserProjectileGraphics.fillEllipse(6, 6, 6, 2);
    laserProjectileGraphics.generateTexture('laser_projectile', 12, 12);
    laserProjectileGraphics.destroy();
  }

  /**
   * Show weapon attack effect at specified position
   */
  public showWeaponEffect(x: number, y: number, weaponType: string): void {
    let effectKey: string;
    let duration: number = 200;
    
    switch (weaponType) {
      case 'katana':
        effectKey = 'katana_slash';
        break;
      case 'baseball':
        effectKey = 'bat_impact';
        duration = 300;
        break;
      case 'laser':
        effectKey = 'laser_beam';
        duration = 150;
        break;
      default:
        return;
    }
    
    const effect = this.add.image(x, y, effectKey);
    effect.setAlpha(0.8);
    effect.setScale(1.2);
    
    // Animate the effect
    this.tweens.add({
      targets: effect,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: duration,
      ease: 'Power2',
      onComplete: () => {
        effect.destroy();
      }
    });
  }

  /**
   * Show explosion effect at specified position
   */
  public showExplosion(x: number, y: number, size: 'small' | 'medium' | 'large' = 'medium'): void {
    const explosionFrames = ['explosion_0', 'explosion_1', 'explosion_2', 'explosion_3', 'explosion_4'];
    let currentFrame = 0;
    
    const explosion = this.add.image(x, y, explosionFrames[0]);
    
    // Scale based on size
    const scale = size === 'small' ? 0.5 : size === 'large' ? 1.5 : 1.0;
    explosion.setScale(scale);
    
    // Animate through explosion frames
    const frameTimer = this.time.addEvent({
      delay: 80,
      callback: () => {
        currentFrame++;
        if (currentFrame < explosionFrames.length) {
          explosion.setTexture(explosionFrames[currentFrame]);
        } else {
          explosion.destroy();
          frameTimer.destroy();
        }
      },
      repeat: explosionFrames.length - 1
    });
    
    // Screen shake effect for larger explosions
    if (size === 'large') {
      this.cameras.main.shake(200, 0.01);
    }
  }

  /**
   * Create laser projectile
   */
  public createLaserProjectile(x: number, y: number, direction: number): Phaser.GameObjects.Image {
    const projectile = this.add.image(x, y, 'laser_projectile');
    this.physics.add.existing(projectile);
    
    const body = projectile.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(direction * 500); // 500px/s as per requirements
    
    // Add glow effect
    projectile.setTint(0x00ff00);
    
    // Destroy projectile after 2 seconds or when it goes off screen
    this.time.delayedCall(2000, () => {
      if (projectile.active) {
        projectile.destroy();
      }
    });
    
    return projectile;
  }

  /**
   * Create bazooka rocket projectile
   */
  public createBazookaRocket(x: number, y: number, direction: number): Phaser.GameObjects.Image {
    const rocket = this.add.image(x, y, 'bazooka_rocket');
    this.physics.add.existing(rocket);
    
    const body = rocket.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(direction * 300); // Slower than laser
    
    // Flip rocket if going left
    if (direction < 0) {
      rocket.setFlipX(true);
    }
    
    // Add exhaust trail effect
    const exhaustTimer = this.time.addEvent({
      delay: 50,
      callback: () => {
        if (rocket.active) {
          const exhaustX = rocket.x - (direction * 15);
          const exhaustY = rocket.y + (Math.random() - 0.5) * 4;
          
          const exhaust = this.add.circle(exhaustX, exhaustY, 2, 0xff4500, 0.7);
          this.tweens.add({
            targets: exhaust,
            alpha: 0,
            scale: 0.5,
            duration: 200,
            onComplete: () => exhaust.destroy()
          });
        }
      },
      repeat: -1
    });
    
    // Destroy rocket after 3 seconds
    this.time.delayedCall(3000, () => {
      if (rocket.active) {
        exhaustTimer.destroy();
        rocket.destroy();
      }
    });
    
    return rocket;
  }

  /**
   * Create explosion visual effects
   */
  private createExplosionEffects(): void {
    // Create multiple explosion frames for animation
    for (let frame = 0; frame < 5; frame++) {
      const explosionGraphics = this.add.graphics();
      const size = 20 + frame * 15;
      const alpha = 1 - (frame * 0.15);
      
      // Outer explosion (orange/red)
      explosionGraphics.fillStyle(0xff4500, alpha);
      explosionGraphics.fillCircle(30, 30, size);
      
      // Middle explosion (yellow)
      explosionGraphics.fillStyle(0xffa500, alpha * 0.8);
      explosionGraphics.fillCircle(30, 30, size * 0.7);
      
      // Inner explosion (white/yellow)
      explosionGraphics.fillStyle(0xffff00, alpha * 0.6);
      explosionGraphics.fillCircle(30, 30, size * 0.4);
      
      // Core (white)
      if (frame < 3) {
        explosionGraphics.fillStyle(0xffffff, alpha * 0.9);
        explosionGraphics.fillCircle(30, 30, size * 0.2);
      }
      
      // Explosion sparks
      explosionGraphics.fillStyle(0xff6600, alpha);
      for (let i = 0; i < 8; i++) {
        const angle = (i * 45) * Math.PI / 180;
        const sparkDistance = size + frame * 5;
        const sparkX = 30 + Math.cos(angle) * sparkDistance;
        const sparkY = 30 + Math.sin(angle) * sparkDistance;
        explosionGraphics.fillCircle(sparkX, sparkY, 2);
      }
      
      explosionGraphics.generateTexture(`explosion_${frame}`, 60, 60);
      explosionGraphics.destroy();
    }

    // Bazooka rocket projectile
    const rocketGraphics = this.add.graphics();
    // Rocket body
    rocketGraphics.fillStyle(0x666666);
    rocketGraphics.fillRect(0, 6, 20, 8);
    // Rocket nose
    rocketGraphics.fillStyle(0x444444);
    rocketGraphics.fillTriangle(20, 6, 25, 10, 20, 14);
    // Rocket fins
    rocketGraphics.fillTriangle(0, 6, 0, 2, 5, 6);
    rocketGraphics.fillTriangle(0, 14, 0, 18, 5, 14);
    // Exhaust flame
    rocketGraphics.fillStyle(0xff4500, 0.8);
    rocketGraphics.fillTriangle(0, 8, -8, 10, 0, 12);
    rocketGraphics.fillStyle(0xffff00, 0.6);
    rocketGraphics.fillTriangle(0, 9, -5, 10, 0, 11);
    
    rocketGraphics.generateTexture('bazooka_rocket', 33, 20);
    rocketGraphics.destroy();
  }

  /**
   * Create game objects and set up the scene
   */
  create(): void {
    // Set world bounds
    this.physics.world.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);

    // Set up Arcade Physics with gravity
    this.physics.world.gravity.y = this.GRAVITY;

    // Initialize audio system
    this.setupAudio();

    // Create parallax background layers
    this.createBackgroundLayers();

    // Create player
    this.createPlayer();

    // Create groups for enemies and life items
    this.createGroups();

    // Create school gate at the end of the level
    this.createSchoolGate();

    // Set up camera to follow player
    this.setupCamera();

    // Set up input controls
    this.setupControls();

    // Spawn some initial enemies for testing
    this.spawnInitialEnemies();

    // Debug: Final scene state
    console.log('GameScene created successfully - isPaused:', this.scene.isPaused());
    console.log('Player position:', this.player.x, this.player.y);
    console.log('Player visible:', this.player.visible);
  }

  /**
   * Spawn some initial enemies for immediate gameplay
   */
  private spawnInitialEnemies(): void {
    const camera = this.cameras.main;
    const groundY = this.WORLD_HEIGHT - 100;

    // Spawn a few enemies at different distances from the right side of the screen
    const initialSpawns = [
      { distance: 200, type: 'ghost' as const },
      { distance: 400, type: 'bat' as const },
      { distance: 600, type: 'vampire' as const },
      { distance: 800, type: 'mummy' as const }
    ];

    initialSpawns.forEach(spawn => {
      const spawnX = camera.width + spawn.distance; // Spawn to the right of the screen
      const spawnY = EnemyFactory.getSpawnHeight(spawn.type, groundY);
      const enemy = EnemyFactory.createEnemy(this, spawnX, spawnY, spawn.type);
      this.enemies.add(enemy);
      console.log(`Initial spawn: ${spawn.type} at (${spawnX}, ${spawnY})`);
    });

    // Also spawn some life items for testing
    const lifeItemSpawns = [
      { distance: 300, type: 'pumpkin' as const },
      { distance: 500, type: 'lollipop' as const },
      { distance: 700, type: 'apple' as const }
    ];

    lifeItemSpawns.forEach(spawn => {
      const spawnX = camera.width + spawn.distance; // Spawn to the right of the screen
      const spawnY = LifeItemFactory.getSpawnHeight(groundY);
      const lifeItem = LifeItemFactory.createLifeItem(this, spawnX, spawnY, spawn.type);
      this.lifeItems.add(lifeItem);
      console.log(`Initial life item: ${spawn.type} at (${spawnX}, ${spawnY})`);
    });
  }

  /**
   * Create parallax background layers
   */
  private createBackgroundLayers(): void {
    // Create background layers with different scroll speeds for parallax effect
    // Layers are ordered from back to front

    // Moon and clouds (slowest parallax)
    this.backgroundLayers.moon_clouds = this.add.tileSprite(
      0, 0,
      this.WORLD_WIDTH,
      this.WORLD_HEIGHT,
      'moon_clouds'
    );
    this.backgroundLayers.moon_clouds.setOrigin(0, 0);
    this.backgroundLayers.moon_clouds.setScrollFactor(0.1);

    // Houses (medium parallax)
    this.backgroundLayers.houses = this.add.tileSprite(
      0, 0,
      this.WORLD_WIDTH,
      this.WORLD_HEIGHT,
      'houses'
    );
    this.backgroundLayers.houses.setOrigin(0, 0);
    this.backgroundLayers.houses.setScrollFactor(0.3);

    // Trees (faster parallax)
    this.backgroundLayers.trees = this.add.tileSprite(
      0, 0,
      this.WORLD_WIDTH,
      this.WORLD_HEIGHT,
      'trees'
    );
    this.backgroundLayers.trees.setOrigin(0, 0);
    this.backgroundLayers.trees.setScrollFactor(0.6);

    // Street (foreground, moves with camera)
    this.backgroundLayers.street = this.add.tileSprite(
      0, this.WORLD_HEIGHT - 100,
      this.WORLD_WIDTH,
      100,
      'street'
    );
    this.backgroundLayers.street.setOrigin(0, 0);
    this.backgroundLayers.street.setScrollFactor(1);
  }

  /**
   * Create the player character
   */
  private createPlayer(): void {
    // Create player at starting position (left side of the world)
    this.player = new Player(this, 100, this.WORLD_HEIGHT - 150, 'player');

    // Set player collision with world bounds
    this.player.setCollideWorldBounds(true);

    // Initialize weapon based on game registry
    const weaponType = this.registry.get('weapon') || 'katana';
    const weapon = WeaponFactory.createWeapon(this, weaponType);
    this.player.setWeapon(weapon);

    // Create ground platform for the player to stand on
    this.createGround();

    // Initialize HUD with player's starting stats (with delay to ensure React listeners are ready)
    setTimeout(() => {
      this.updateGameState();
    }, 200);
  }

  /**
   * Create ground platform for player physics
   */
  private createGround(): void {
    // Create invisible ground platform at the bottom
    const ground = this.add.rectangle(
      this.WORLD_WIDTH / 2,
      this.WORLD_HEIGHT - 50,
      this.WORLD_WIDTH,
      100,
      0x000000,
      0 // Invisible
    );

    // Enable physics for ground collision
    this.physics.add.existing(ground, true); // true = static body

    // Set up collision between player and ground
    this.physics.add.collider(this.player, ground);
  }

  /**
   * Create groups for game objects
   */
  private createGroups(): void {
    // Create enemy group with physics
    this.enemies = this.physics.add.group({
      runChildUpdate: true // Automatically call update on all group members
    });

    // Create life items group with physics
    this.lifeItems = this.physics.add.group({
      runChildUpdate: true
    });
  }

  /**
   * Create the school gate at the end of the level
   */
  private createSchoolGate(): void {
    // Place school gate at the end of the world using the proper sprite
    this.schoolGate = this.add.image(
      this.WORLD_WIDTH - 50,
      this.WORLD_HEIGHT - 100,
      'school_gate'
    );

    // Enable physics for collision detection
    this.physics.add.existing(this.schoolGate, true); // true = static body
  }

  /**
   * Set up camera to follow player with smooth scrolling
   */
  private setupCamera(): void {
    // Make camera follow the player
    this.cameras.main.startFollow(this.player);

    // Set camera bounds to world bounds
    this.cameras.main.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);

    // Configure smooth camera following
    this.cameras.main.setFollowOffset(0, 0);
    this.cameras.main.setLerp(0.1, 0.1); // Smooth camera movement

    // Set camera deadzone for smoother following
    this.cameras.main.setDeadzone(100, 50);
  }

  /**
   * Set up audio system
   * Requirements: 11.1
   */
  private setupAudio(): void {
    // Initialize audio manager
    audioManager.initialize();

    // Start background music (wind and crickets ambient sound)
    audioManager.playBackgroundMusic();

    console.log('Audio system initialized');
  }

  /**
   * Set up keyboard controls
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
   */
  private setupControls(): void {
    // Ensure keyboard input is available
    if (!this.input.keyboard) {
      console.warn('Keyboard input not available');
      return;
    }

    console.log('Setting up keyboard controls...');

    // Create and store keys in class properties
    this.keys.left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keys.right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.keys.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keys.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.keys.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keys.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keys.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keys.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keys.esc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Debug: Log the created keys
    console.log('Keys created:', {
      left: !!this.keys.left,
      right: !!this.keys.right,
      a: !!this.keys.a,
      d: !!this.keys.d,
      w: !!this.keys.w,
      s: !!this.keys.s,
      space: !!this.keys.space
    });

    // Add debug logging for key presses
    this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
      console.log('Key pressed:', event.code);
    });

    // Add specific key listeners for debugging
    this.keys.a?.on('down', () => console.log('A key DOWN detected'));
    this.keys.d?.on('down', () => console.log('D key DOWN detected'));
    this.keys.left?.on('down', () => console.log('LEFT arrow DOWN detected'));
    this.keys.right?.on('down', () => console.log('RIGHT arrow DOWN detected'));

    console.log('Keyboard controls set up successfully');

    // Prevent default browser behavior for game keys
    this.input.keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.W,
      Phaser.Input.Keyboard.KeyCodes.A,
      Phaser.Input.Keyboard.KeyCodes.S,
      Phaser.Input.Keyboard.KeyCodes.D,
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.ESC
    ]);
  }

  /**
   * Get difficulty configuration based on current difficulty setting
   * Requirements: 12.1, 12.2, 12.3
   */
  private getDifficultyConfig(): DifficultyConfig {
    const configs: Record<string, DifficultyConfig> = {
      easy: {
        enemySpawnRate: 2,       // Few enemies (2 per 1000px)
        lifeItemSpawnRate: 8,    // Many life items (8 per 1000px)
        enemyTypes: ['ghost', 'bat'] // Easier enemies only
      },
      medium: {
        enemySpawnRate: 4,       // Some enemies (4 per 1000px)
        lifeItemSpawnRate: 3,    // Few life items (3 per 1000px)
        enemyTypes: ['ghost', 'bat', 'vampire', 'mummy'] // All enemies
      },
      impossible: {
        enemySpawnRate: 8,       // Many enemies (8 per 1000px)
        lifeItemSpawnRate: 0,    // Zero life items
        enemyTypes: ['vampire', 'mummy', 'ghost', 'bat'] // All enemies, prioritize harder ones
      }
    };

    return configs[this.difficulty];
  }

  /**
   * Update method called every frame
   */
  update(time: number, delta: number): void {
    // Debug: Count update calls
    this.updateCallCount++;
    if (this.updateCallCount % 60 === 0) { // Log every 60 frames
      console.log('Update called', this.updateCallCount, 'times');
    }

    // Update player
    this.player.update(time, delta);

    // Handle input
    this.handleInput();

    // Update parallax backgrounds
    this.updateParallax();

    // Handle spawning system
    this.updateSpawning();

    // Handle collisions
    this.handleCollisions();

    // Update game state and emit events to React
    this.updateGameState();

    // Check for game end conditions
    this.checkGameEndConditions();
  }

  /**
   * Handle player input (keyboard and touch controls)
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
   */
  private handleInput(): void {
    // Debug: Count how many times this is called
    this.inputCallCount++;
    if (this.inputCallCount % 60 === 0) { // Log every 60 frames (about once per second)
      console.log('handleInput called', this.inputCallCount, 'times');
    }

    // Skip input handling if game is paused
    if (this.scene.isPaused()) {
      console.log('Game is paused, skipping input');
      return;
    }

    // Check if keys are available
    if (!this.keys.left || !this.keys.right) {
      console.warn('Keys not initialized yet');
      return;
    }

    // Ensure canvas has focus (check every 5 seconds)
    if (this.inputCallCount % 300 === 0) {
      const canvas = this.game.canvas;
      if (canvas && document.activeElement !== canvas) {
        console.log('Canvas lost focus, refocusing...');
        canvas.focus();
      }
    }

    // Handle pause first (Esc key) - Requirement 3.6
    if (this.keys.esc && Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
      this.handlePause();
      return; // Don't process other inputs when pausing
    }

    // Handle movement (A/D keys and arrow keys) - Requirements 3.1, 3.2
    const moveLeft = (
      this.keyboardControls.moveLeft ||
      this.touchControls.moveLeft
    );
    const moveRight = (
      this.keyboardControls.moveRight ||
      this.touchControls.moveRight
    );

    // Debug movement input - always log to see what's happening
    if (this.inputCallCount % 60 === 0) { // Log every second
      console.log('Input state check:', {
        keyboardStates: {
          moveLeft: this.keyboardControls.moveLeft,
          moveRight: this.keyboardControls.moveRight,
          jump: this.keyboardControls.jump,
          attack: this.keyboardControls.attack
        },
        touchStates: {
          moveLeft: this.touchControls.moveLeft,
          moveRight: this.touchControls.moveRight,
          jump: this.touchControls.jump,
          attack: this.touchControls.attack
        },
        finalStates: {
          moveLeft,
          moveRight
        }
      });
    }

    // Debug movement input
    if (moveLeft || moveRight) {
      console.log('Movement detected:', {
        moveLeft,
        moveRight,
        leftArrow: this.keys.left?.isDown,
        rightArrow: this.keys.right?.isDown,
        aKey: this.keys.a?.isDown,
        dKey: this.keys.d?.isDown,
        touchLeft: this.touchControls.moveLeft,
        touchRight: this.touchControls.moveRight
      });
    }

    if (moveLeft && !moveRight) {
      console.log('Calling player.move(left)');
      this.player.move('left');
    } else if (moveRight && !moveLeft) {
      console.log('Calling player.move(right)');
      this.player.move('right');
    } else {
      this.player.stopMovement();
    }

    // Handle jumping (W/↑ keys) - Requirement 3.3
    const shouldJump = (
      this.keyboardControls.jump ||
      this.touchControls.jump
    );

    if (shouldJump) {
      this.player.jump();
    }

    // Handle crouching (S/↓ keys) - Requirement 3.4
    const shouldCrouch = (
      this.keyboardControls.crouch ||
      this.touchControls.crouch
    );

    if (shouldCrouch) {
      this.player.crouch();
    } else {
      this.player.stopCrouching();
    }

    // Handle attack (Space key) - Requirement 3.5
    const shouldAttack = (
      this.keyboardControls.attack ||
      this.touchControls.attack
    );

    if (shouldAttack) {
      this.player.attack();
    }
  }

  /**
   * Update parallax background scrolling
   */
  private updateParallax(): void {
    // Get camera scroll position
    const camera = this.cameras.main;
    const scrollX = camera.scrollX;

    // Update each background layer with different scroll speeds
    if (this.backgroundLayers.moon_clouds) {
      this.backgroundLayers.moon_clouds.tilePositionX = scrollX * 0.1;
    }

    if (this.backgroundLayers.houses) {
      this.backgroundLayers.houses.tilePositionX = scrollX * 0.3;
    }

    if (this.backgroundLayers.trees) {
      this.backgroundLayers.trees.tilePositionX = scrollX * 0.6;
    }

    if (this.backgroundLayers.street) {
      this.backgroundLayers.street.tilePositionX = scrollX * 1;
    }
  }

  /**
   * Update spawning system for side-scrolling gameplay
   * Requirements: 12.1, 12.2, 12.3, 6.1
   */
  private updateSpawning(): void {
    // Spawn enemies from the right side of the screen continuously
    this.updateEnemySpawning();

    // Spawn life items occasionally
    this.updateLifeItemSpawning();

    // Clean up enemies that have moved too far off screen
    this.cleanupOffscreenEnemies();
  }

  /**
   * Spawn entities in a specific region based on difficulty
   * @param startX - Start X position of spawn region
   * @param endX - End X position of spawn region
   */
  private spawnEntitiesInRegion(startX: number, endX: number): void {
    const regionWidth = endX - startX;
    const groundY = this.WORLD_HEIGHT - 100; // Ground level

    // Spawn enemies based on difficulty
    this.spawnEnemiesInRegion(startX, endX, regionWidth, groundY);

    // Spawn life items based on difficulty
    this.spawnLifeItemsInRegion(startX, endX, regionWidth, groundY);
  }

  /**
   * Spawn enemies in a region based on difficulty configuration
   * Requirements: 12.1, 12.2, 12.3
   */
  private spawnEnemiesInRegion(startX: number, endX: number, regionWidth: number, groundY: number): void {
    const enemyCount = Math.floor((regionWidth / 1000) * this.difficultyConfig.enemySpawnRate);

    console.log(`Spawning ${enemyCount} enemies in region ${startX}-${endX} (difficulty: ${this.difficulty})`);

    for (let i = 0; i < enemyCount; i++) {
      // Random position within the region
      const spawnX = startX + Math.random() * regionWidth;

      // Select random enemy type from available types for this difficulty
      const enemyType = this.getRandomEnemyType();

      // Get appropriate spawn height for enemy type
      const spawnY = EnemyFactory.getSpawnHeight(enemyType, groundY);

      console.log(`Creating ${enemyType} enemy at (${spawnX}, ${spawnY})`);

      // Create enemy
      const enemy = EnemyFactory.createEnemy(this, spawnX, spawnY, enemyType);

      // Add to enemies group
      this.enemies.add(enemy);
    }
  }

  /**
   * Spawn life items in a region based on difficulty configuration
   * Requirements: 6.1
   */
  private spawnLifeItemsInRegion(startX: number, endX: number, regionWidth: number, groundY: number): void {
    const lifeItemCount = Math.floor((regionWidth / 1000) * this.difficultyConfig.lifeItemSpawnRate);

    for (let i = 0; i < lifeItemCount; i++) {
      // Random position within the region
      const spawnX = startX + Math.random() * regionWidth;

      // Get spawn height that requires jumping to collect
      const spawnY = LifeItemFactory.getSpawnHeight(groundY);

      // Create random life item
      const lifeItem = LifeItemFactory.createRandomLifeItem(this, spawnX, spawnY);

      // Add to life items group
      this.lifeItems.add(lifeItem);
    }
  }

  /**
   * Get a random enemy type based on difficulty configuration
   */
  private getRandomEnemyType(): EnemyType {
    const availableTypes = this.difficultyConfig.enemyTypes as EnemyType[];
    return availableTypes[Math.floor(Math.random() * availableTypes.length)];
  }

  /**
   * Handle collision detection
   * Requirements: 4.5, 4.6, 6.2, 6.3, 7.2, 7.5
   */
  private handleCollisions(): void {
    // Player-enemy collisions with damage and invulnerability
    this.physics.overlap(this.player, this.enemies, (player, enemy) => {
      this.handlePlayerEnemyCollision(player as Player, enemy as Phaser.GameObjects.GameObject);
    });

    // Player-life item collisions with +1 life and +50 points
    this.physics.overlap(this.player, this.lifeItems, (player, item) => {
      this.handlePlayerLifeItemCollision(player as Player, item as Phaser.GameObjects.GameObject);
    });

    // Player-school gate collision for game completion (+500 bonus points)
    this.physics.overlap(this.player, this.schoolGate, () => {
      this.handlePlayerSchoolGateCollision();
    });

    // Weapon-enemy collisions for enemy elimination (+100 points each)
    this.handleWeaponEnemyCollisions();
  }

  /**
   * Handle player-enemy collision with damage and invulnerability
   * Requirements: 4.5, 7.3, 7.4
   */
  private handlePlayerEnemyCollision(player: Player, enemy: Phaser.GameObjects.GameObject): void {
    // Only process collision if player is not invulnerable
    if (player.isInvulnerable) return;

    // Check if player can avoid damage based on position and enemy type
    if (this.canPlayerAvoidDamage(player, enemy)) {
      return;
    }

    // Player takes damage (includes invulnerability timer)
    player.takeDamage();

    // Enemy disappears on contact (requirement 4.1-4.4)
    enemy.destroy();

    // Update game state store with new lives count
    this.updateGameState();

    // Check for game over
    if (player.lives <= 0) {
      this.handleGameOver();
    }
  }

  /**
   * Check if player can avoid damage based on position and enemy type
   * Requirements: 4.5, 4.6
   */
  private canPlayerAvoidDamage(player: Player, enemy: Phaser.GameObjects.GameObject): boolean {
    // Get enemy type from the enemy object
    const enemyType = (enemy as any).type;

    if (!enemyType) return false;

    // Player crouching avoids damage from floating enemies (Ghost, Bat)
    if (player.isCrouching && (enemyType === 'ghost' || enemyType === 'bat')) {
      return true;
    }

    // Player jumping avoids damage from ground enemies (Vampire, Mummy)
    if (player.isJumping && (enemyType === 'vampire' || enemyType === 'mummy')) {
      return true;
    }

    return false;
  }

  /**
   * Handle player-life item collision with +1 life and +50 points
   * Requirements: 6.2, 6.3, 11.4
   */
  private handlePlayerLifeItemCollision(player: Player, item: Phaser.GameObjects.GameObject): void {
    if (item instanceof LifeItem) {
      // Player gains life (up to maximum of 10) and points
      player.addLife(); // +1 life (capped at 10 in Player class)
      player.addScore(item.getPointValue()); // +50 points for life item

      // Play item collection sound effect
      audioManager.playItemCollectSound();

      // Handle collection (includes destruction)
      item.collect();

      // Update game state store
      this.updateGameState();
    }
  }

  /**
   * Handle player reaching school gate for game completion
   * Requirements: 7.5
   */
  private handlePlayerSchoolGateCollision(): void {
    // Only trigger if player has lives remaining
    if (this.player.lives <= 0) return;

    // Player wins the game with bonus points
    this.player.addScore(500); // +500 bonus points for completion

    // Update game state store
    this.updateGameState();

    // Handle game victory
    this.handleGameWin();
  }

  /**
   * Handle weapon-enemy collisions for enemy elimination
   * Requirements: 5.5, 7.2
   */
  private handleWeaponEnemyCollisions(): void {
    // Only check weapon collisions if player has a weapon
    if (!this.player.weapon) return;

    // Check if player just attacked (within the last 150ms)
    const timeSinceLastAttack = this.time.now - this.player.weapon.getLastAttackTime();
    if (timeSinceLastAttack > 150) return;

    // Get weapon attack area based on weapon type and player position
    const weaponAttackArea = this.getWeaponAttackArea();
    if (!weaponAttackArea) return;

    // Check each enemy for collision with weapon attack area
    this.enemies.children.entries.forEach((enemy) => {
      if (!enemy.active) return;

      const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;

      // Check if enemy is within weapon attack area and hasn't been hit recently
      if (this.isEnemyInWeaponRange(enemySprite, weaponAttackArea) && !enemySprite.getData('justHit')) {
        // Mark enemy as hit to prevent multiple hits from same attack
        enemySprite.setData('justHit', true);
        this.time.delayedCall(200, () => {
          if (enemySprite.active) {
            enemySprite.setData('justHit', false);
          }
        });

        this.handleWeaponHitEnemy(enemySprite);
      }
    });
  }

  /**
   * Get weapon attack area based on current weapon and player state
   */
  private getWeaponAttackArea(): { x: number; y: number; width: number; height: number } | null {
    if (!this.player.weapon) return null;

    const weapon = this.player.weapon;
    const playerX = this.player.x;
    const playerY = this.player.y;
    const facingLeft = this.player.flipX;

    // Calculate attack area based on weapon type
    switch (weapon.type) {
      case 'katana':
        return {
          x: facingLeft ? playerX - weapon.range : playerX,
          y: playerY - 30,
          width: weapon.range, // 40px
          height: 60
        };

      case 'baseball':
        return {
          x: facingLeft ? playerX - weapon.range : playerX,
          y: playerY - 30,
          width: weapon.range, // 55px
          height: 60
        };

      case 'laser':
        // For projectile weapons, we'll handle this differently
        // For now, return a basic area (projectile collision will be enhanced later)
        return {
          x: facingLeft ? playerX - 200 : playerX,
          y: playerY - 10,
          width: 200,
          height: 20
        };

      case 'bazooka':
        // Area damage weapon
        return {
          x: facingLeft ? playerX - 100 : playerX,
          y: playerY - 50,
          width: 100,
          height: 100
        };

      default:
        return null;
    }
  }

  /**
   * Check if enemy is within weapon attack range
   */
  private isEnemyInWeaponRange(
    enemy: Phaser.Physics.Arcade.Sprite,
    attackArea: { x: number; y: number; width: number; height: number }
  ): boolean {
    const enemyBounds = enemy.getBounds();
    const attackBounds = new Phaser.Geom.Rectangle(
      attackArea.x,
      attackArea.y,
      attackArea.width,
      attackArea.height
    );

    return Phaser.Geom.Rectangle.Overlaps(enemyBounds, attackBounds);
  }

  /**
   * Handle weapon hitting enemy - eliminate enemy and award points
   * Requirements: 5.5, 7.2
   */
  private handleWeaponHitEnemy(enemy: Phaser.Physics.Arcade.Sprite): void {
    // Award points for enemy elimination
    this.player.addScore(100); // +100 points for each enemy eliminated

    // Apply weapon-specific effects
    if (this.player.weapon?.type === 'baseball') {
      // Baseball bat applies knockback before destruction
      this.applyKnockback(enemy);
    }

    // Eliminate enemy immediately (all weapons eliminate in one hit)
    enemy.destroy();

    // Update game state store
    this.updateGameState();

    // TODO: Play weapon-specific sound effect
    // this.playWeaponHitSound();
  }

  /**
   * Apply knockback effect for baseball bat
   */
  private applyKnockback(enemy: Phaser.Physics.Arcade.Sprite): void {
    if (enemy.body instanceof Phaser.Physics.Arcade.Body) {
      const knockbackForce = 200;
      const direction = this.player.flipX ? -1 : 1;
      enemy.body.setVelocityX(direction * knockbackForce);
    }
  }



  /**
   * Handle pause functionality
   * Requirement 3.6
   */
  private handlePause(): void {
    if (this.scene.isPaused()) {
      // Resume game
      this.scene.resume();
      console.log('Game resumed');
    } else {
      // Pause game
      this.scene.pause();
      console.log('Game paused - Press ESC to resume');
    }

    // Emit pause state change for UI components
    this.events.emit('gamePauseToggled', {
      isPaused: this.scene.isPaused()
    });
  }

  /**
   * Handle game over (player died)
   * Requirements: 7.6
   */
  private handleGameOver(): void {
    // Set game status to finished
    this.updateGameState();

    // Pause the game
    this.scene.pause();

    // Emit game end event with defeat status
    this.events.emit('gameEnd', {
      score: this.player.score,
      victory: false,
      reason: 'defeat'
    });

    console.log('Game Over! Final Score:', this.player.score);
  }

  /**
   * Handle game win (reached school)
   * Requirements: 7.5
   */
  private handleGameWin(): void {
    // Set game status to finished
    this.updateGameState();

    // Pause the game
    this.scene.pause();

    // Emit game end event with victory status
    this.events.emit('gameEnd', {
      score: this.player.score,
      victory: true,
      reason: 'victory'
    });

    console.log('Victory! Final Score:', this.player.score);
  }

  /**
   * Get current player for external access
   */
  getPlayer(): Player {
    return this.player;
  }

  /**
   * Get enemy group for external access
   */
  getEnemies(): Phaser.Physics.Arcade.Group {
    return this.enemies;
  }

  /**
   * Get life items group for external access
   */
  getLifeItems(): Phaser.Physics.Arcade.Group {
    return this.lifeItems;
  }

  /**
   * Handle touch control input from React component
   * Requirements: 10.2
   */
  setTouchControl(control: 'moveLeft' | 'moveRight' | 'jump' | 'crouch' | 'attack', pressed: boolean): void {
    this.touchControls[control] = pressed;
  }

  /**
   * Handle keyboard control input from React component (browser-level)
   */
  setKeyboardControls(keyboardState: {
    moveLeft: boolean;
    moveRight: boolean;
    jump: boolean;
    crouch: boolean;
    attack: boolean;
  }): void {
    // Store keyboard state similar to touch controls
    this.keyboardControls = keyboardState;
  }

  /**
   * Get current touch controls state for debugging
   */
  getTouchControlsState(): typeof this.touchControls {
    return { ...this.touchControls };
  }

  /**
   * Get current keyboard input state for debugging
   */
  getKeyboardState(): {
    cursors: {
      left: boolean;
      right: boolean;
      up: boolean;
      down: boolean;
    };
    wasd: {
      W: boolean;
      A: boolean;
      S: boolean;
      D: boolean;
    };
    spaceKey: boolean;
    escKey: boolean;
  } {
    const cursors = this.registry.get('cursors');
    const wasd = this.registry.get('wasd');
    const spaceKey = this.registry.get('spaceKey');
    const escKey = this.registry.get('escKey');

    return {
      cursors: {
        left: cursors?.left?.isDown || false,
        right: cursors?.right?.isDown || false,
        up: cursors?.up?.isDown || false,
        down: cursors?.down?.isDown || false,
      },
      wasd: {
        W: wasd?.W?.isDown || false,
        A: wasd?.A?.isDown || false,
        S: wasd?.S?.isDown || false,
        D: wasd?.D?.isDown || false,
      },
      spaceKey: spaceKey?.isDown || false,
      escKey: escKey?.isDown || false,
    };
  }

  /**
   * Check if keyboard controls are properly initialized
   */
  areKeyboardControlsReady(): boolean {
    const cursors = this.registry.get('cursors');
    const wasd = this.registry.get('wasd');
    const spaceKey = this.registry.get('spaceKey');
    const escKey = this.registry.get('escKey');

    return !!(cursors && wasd && spaceKey && escKey);
  }

  /**
   * Update game state and emit events to React
   */
  private updateGameState(): void {
    console.log('updateGameState called - emitting playerStatsChanged:', {
      lives: this.player.lives,
      score: this.player.score
    });

    // Emit player stats changes to React
    this.events.emit('playerStatsChanged', {
      lives: this.player.lives,
      score: this.player.score
    });
  }

  /**
   * Check for game end conditions
   */
  private checkGameEndConditions(): void {
    // Check if player has no lives left (defeat)
    if (this.player.lives <= 0) {
      this.endGame(false, 'No lives remaining');
      return;
    }

    // Check if player reached the school gate (victory)
    if (this.physics.overlap(this.player, this.schoolGate)) {
      // Add victory bonus
      this.player.addScore(500);
      this.endGame(true, 'Reached school gate');
      return;
    }
  }

  /**
   * End the game and emit event to React
   */
  private endGame(victory: boolean, reason: string): void {
    console.log(`Game ended: ${victory ? 'Victory' : 'Defeat'} - ${reason}`);

    // Emit game end event to React
    this.events.emit('gameEnd', {
      score: this.player.score,
      victory: victory,
      reason: reason
    });

    // Pause the scene to stop gameplay
    this.scene.pause();
  }

  /**
   * Update enemy spawning for side-scrolling gameplay
   */
  private updateEnemySpawning(): void {
    const currentTime = this.time.now;

    // Calculate spawn interval based on difficulty
    const baseInterval = this.enemySpawnInterval;
    const difficultyMultiplier = {
      easy: 1.5,     // Slower spawning
      medium: 1.0,   // Normal spawning
      impossible: 0.5 // Faster spawning
    }[this.difficulty];

    const actualInterval = baseInterval * difficultyMultiplier;

    // Check if it's time to spawn a new enemy
    if (currentTime - this.lastEnemySpawnTime > actualInterval) {
      this.spawnEnemyFromRight();
      this.lastEnemySpawnTime = currentTime;
    }
  }

  /**
   * Update life item spawning
   */
  private updateLifeItemSpawning(): void {
    const currentTime = this.time.now;

    // Don't spawn life items on impossible difficulty
    if (this.difficulty === 'impossible') return;

    // Calculate spawn interval based on difficulty
    const baseInterval = this.lifeItemSpawnInterval;
    const difficultyMultiplier = {
      easy: 0.6,     // More frequent life items
      medium: 1.0,   // Normal frequency
      impossible: 0  // No life items
    }[this.difficulty];

    const actualInterval = baseInterval * difficultyMultiplier;

    // Check if it's time to spawn a new life item
    if (actualInterval > 0 && currentTime - this.lastLifeItemSpawnTime > actualInterval) {
      this.spawnLifeItemFromRight();
      this.lastLifeItemSpawnTime = currentTime;
    }
  }

  /**
   * Spawn an enemy from the right side of the screen
   */
  private spawnEnemyFromRight(): void {
    const camera = this.cameras.main;
    const screenRight = camera.scrollX + camera.width + 100; // Spawn off-screen to the right
    const groundY = this.WORLD_HEIGHT - 100;

    // Select random enemy type based on difficulty
    const enemyType = this.getRandomEnemyType();

    // Get appropriate spawn height for enemy type
    const spawnY = EnemyFactory.getSpawnHeight(enemyType, groundY);

    console.log(`Spawning ${enemyType} from right at (${screenRight}, ${spawnY})`);

    // Create enemy
    const enemy = EnemyFactory.createEnemy(this, screenRight, spawnY, enemyType);

    // Add to enemies group
    this.enemies.add(enemy);
  }

  /**
   * Spawn a life item from the right side of the screen
   */
  private spawnLifeItemFromRight(): void {
    const camera = this.cameras.main;
    const screenRight = camera.scrollX + camera.width + 100; // Spawn off-screen to the right
    const groundY = this.WORLD_HEIGHT - 100;

    // Get spawn height that requires jumping to collect
    const spawnY = LifeItemFactory.getSpawnHeight(groundY);

    console.log(`Spawning life item from right at (${screenRight}, ${spawnY})`);

    // Create random life item
    const lifeItem = LifeItemFactory.createRandomLifeItem(this, screenRight, spawnY);

    // Add to life items group
    this.lifeItems.add(lifeItem);
  }

  /**
   * Clean up enemies and items that have moved too far off screen
   */
  private cleanupOffscreenEnemies(): void {
    const camera = this.cameras.main;
    const screenLeft = camera.scrollX - 200; // Clean up when well off-screen

    // Clean up enemies
    this.enemies.children.entries.forEach((enemy) => {
      const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
      if (enemySprite.x < screenLeft) {
        enemySprite.destroy();
      }
    });

    // Clean up life items
    this.lifeItems.children.entries.forEach((item) => {
      const itemSprite = item as Phaser.Physics.Arcade.Sprite;
      if (itemSprite.x < screenLeft) {
        itemSprite.destroy();
      }
    });
  }



}