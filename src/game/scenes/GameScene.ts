import * as Phaser from 'phaser';
import { Player } from '../entities/Player';
import { DifficultyConfig } from '../../types';
import { EnemyFactory, EnemyType } from '../entities/EnemyFactory';
import { LifeItemFactory, LifeItem } from '../entities/LifeItem';
import { audioManager } from '../utils/AudioManager';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private lifeItems!: Phaser.Physics.Arcade.Group;
  private schoolGate!: Phaser.GameObjects.Rectangle;
  
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
  private spawnInterval: number = 1000; // Distance between spawn checks (px)
  private difficultyConfig!: DifficultyConfig;
  
  // Touch controls state
  private touchControls = {
    moveLeft: false,
    moveRight: false,
    jump: false,
    crouch: false,
    attack: false
  };
  
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
   * Create player character sprites
   */
  private createPlayerSprites(): void {
    // Boy character sprite
    const boyGraphics = this.add.graphics();
    
    // Head (skin tone)
    boyGraphics.fillStyle(0xfdbcb4);
    boyGraphics.fillCircle(16, 12, 8);
    
    // Hair (brown)
    boyGraphics.fillStyle(0x8b4513);
    boyGraphics.fillCircle(16, 8, 6);
    
    // Eyes
    boyGraphics.fillStyle(0x000000);
    boyGraphics.fillCircle(13, 11, 1);
    boyGraphics.fillCircle(19, 11, 1);
    
    // Body (shirt - blue)
    boyGraphics.fillStyle(0x4169e1);
    boyGraphics.fillRect(10, 20, 12, 16);
    
    // Arms (skin tone)
    boyGraphics.fillStyle(0xfdbcb4);
    boyGraphics.fillRect(8, 22, 3, 12);
    boyGraphics.fillRect(21, 22, 3, 12);
    
    // Legs (pants - dark blue)
    boyGraphics.fillStyle(0x191970);
    boyGraphics.fillRect(12, 36, 3, 12);
    boyGraphics.fillRect(17, 36, 3, 12);
    
    // Shoes (black)
    boyGraphics.fillStyle(0x000000);
    boyGraphics.fillRect(11, 46, 5, 3);
    boyGraphics.fillRect(16, 46, 5, 3);
    
    boyGraphics.generateTexture('player_boy', 32, 50);
    boyGraphics.destroy();

    // Girl character sprite
    const girlGraphics = this.add.graphics();
    
    // Head (skin tone)
    girlGraphics.fillStyle(0xfdbcb4);
    girlGraphics.fillCircle(16, 12, 8);
    
    // Hair (blonde)
    girlGraphics.fillStyle(0xffd700);
    girlGraphics.fillCircle(16, 8, 7);
    
    // Eyes
    girlGraphics.fillStyle(0x000000);
    girlGraphics.fillCircle(13, 11, 1);
    girlGraphics.fillCircle(19, 11, 1);
    
    // Body (dress - pink)
    girlGraphics.fillStyle(0xff69b4);
    girlGraphics.fillRect(9, 20, 14, 18);
    
    // Arms (skin tone)
    girlGraphics.fillStyle(0xfdbcb4);
    girlGraphics.fillRect(7, 22, 3, 12);
    girlGraphics.fillRect(22, 22, 3, 12);
    
    // Legs (skin tone)
    girlGraphics.fillStyle(0xfdbcb4);
    girlGraphics.fillRect(12, 38, 3, 8);
    girlGraphics.fillRect(17, 38, 3, 8);
    
    // Shoes (red)
    girlGraphics.fillStyle(0xff0000);
    girlGraphics.fillRect(11, 46, 5, 3);
    girlGraphics.fillRect(16, 46, 5, 3);
    
    girlGraphics.generateTexture('player_girl', 32, 50);
    girlGraphics.destroy();

    // Use boy as default player texture
    this.textures.addBase64('player', this.textures.get('player_boy').getSourceImage().src);
  }

  /**
   * Create background layer sprites
   */
  private createBackgroundSprites(): void {
    // Moon and clouds layer
    const moonCloudsGraphics = this.add.graphics();
    
    // Night sky gradient
    moonCloudsGraphics.fillGradientStyle(0x0f0f23, 0x0f0f23, 0x1a1a2e, 0x1a1a2e, 1);
    moonCloudsGraphics.fillRect(0, 0, 800, 720);
    
    // Moon
    moonCloudsGraphics.fillStyle(0xf5f5dc);
    moonCloudsGraphics.fillCircle(650, 100, 40);
    
    // Moon craters
    moonCloudsGraphics.fillStyle(0xe6e6d3);
    moonCloudsGraphics.fillCircle(645, 95, 8);
    moonCloudsGraphics.fillCircle(655, 105, 5);
    
    // Stars
    moonCloudsGraphics.fillStyle(0xffffff);
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 800;
      const y = Math.random() * 300;
      moonCloudsGraphics.fillCircle(x, y, 1);
    }
    
    // Clouds
    moonCloudsGraphics.fillStyle(0x2f2f2f);
    moonCloudsGraphics.fillEllipse(200, 150, 120, 40);
    moonCloudsGraphics.fillEllipse(500, 200, 100, 35);
    
    moonCloudsGraphics.generateTexture('moon_clouds', 800, 720);
    moonCloudsGraphics.destroy();

    // Houses layer
    const housesGraphics = this.add.graphics();
    
    // Dark sky
    housesGraphics.fillGradientStyle(0x16213e, 0x16213e, 0x0f1a2e, 0x0f1a2e, 1);
    housesGraphics.fillRect(0, 0, 800, 720);
    
    // House silhouettes
    for (let i = 0; i < 5; i++) {
      const x = i * 160 + 50;
      const height = 150 + Math.random() * 100;
      
      // House body
      housesGraphics.fillStyle(0x000000);
      housesGraphics.fillRect(x, 720 - height, 120, height);
      
      // Roof
      housesGraphics.fillTriangle(
        x - 10, 720 - height,
        x + 60, 720 - height - 40,
        x + 130, 720 - height
      );
      
      // Windows (some lit)
      if (Math.random() > 0.5) {
        housesGraphics.fillStyle(0xffff99);
        housesGraphics.fillRect(x + 20, 720 - height + 30, 15, 20);
        housesGraphics.fillRect(x + 85, 720 - height + 30, 15, 20);
      }
    }
    
    housesGraphics.generateTexture('houses', 800, 720);
    housesGraphics.destroy();

    // Trees layer
    const treesGraphics = this.add.graphics();
    
    // Darker sky
    treesGraphics.fillGradientStyle(0x0f3460, 0x0f3460, 0x0a2040, 0x0a2040, 1);
    treesGraphics.fillRect(0, 0, 800, 720);
    
    // Spooky trees
    for (let i = 0; i < 8; i++) {
      const x = i * 100 + 30;
      const treeHeight = 200 + Math.random() * 150;
      
      // Tree trunk
      treesGraphics.fillStyle(0x2d1b0e);
      treesGraphics.fillRect(x, 720 - treeHeight, 15, treeHeight);
      
      // Tree branches (spooky)
      treesGraphics.lineStyle(3, 0x2d1b0e);
      treesGraphics.beginPath();
      treesGraphics.moveTo(x + 7, 720 - treeHeight + 50);
      treesGraphics.lineTo(x - 20, 720 - treeHeight + 20);
      treesGraphics.moveTo(x + 7, 720 - treeHeight + 80);
      treesGraphics.lineTo(x + 35, 720 - treeHeight + 30);
      treesGraphics.strokePath();
      
      // Dead leaves (sparse)
      if (Math.random() > 0.7) {
        treesGraphics.fillStyle(0x8b4513);
        treesGraphics.fillCircle(x - 15, 720 - treeHeight + 25, 8);
        treesGraphics.fillCircle(x + 30, 720 - treeHeight + 35, 6);
      }
    }
    
    treesGraphics.generateTexture('trees', 800, 720);
    treesGraphics.destroy();

    // Street layer
    const streetGraphics = this.add.graphics();
    
    // Street/ground
    streetGraphics.fillGradientStyle(0x533483, 0x533483, 0x2d1b69, 0x2d1b69, 1);
    streetGraphics.fillRect(0, 0, 800, 100);
    
    // Street lines
    streetGraphics.lineStyle(2, 0x666666);
    streetGraphics.beginPath();
    for (let i = 0; i < 800; i += 60) {
      streetGraphics.moveTo(i, 50);
      streetGraphics.lineTo(i + 30, 50);
    }
    streetGraphics.strokePath();
    
    // Sidewalk edge
    streetGraphics.fillStyle(0x696969);
    streetGraphics.fillRect(0, 0, 800, 5);
    
    streetGraphics.generateTexture('street', 800, 100);
    streetGraphics.destroy();
  }

  /**
   * Create enemy sprites with Halloween theme
   */
  private createEnemySprites(): void {
    // Ghost sprite
    const ghostGraphics = this.add.graphics();
    
    // Ghost body (white with transparency effect)
    ghostGraphics.fillStyle(0xf0f0f0);
    ghostGraphics.fillEllipse(16, 20, 28, 32);
    
    // Ghost tail (wavy bottom)
    ghostGraphics.beginPath();
    ghostGraphics.moveTo(2, 32);
    ghostGraphics.quadraticCurveTo(8, 38, 12, 32);
    ghostGraphics.quadraticCurveTo(16, 26, 20, 32);
    ghostGraphics.quadraticCurveTo(24, 38, 30, 32);
    ghostGraphics.lineTo(30, 20);
    ghostGraphics.arc(16, 20, 14, 0, Math.PI, true);
    ghostGraphics.closePath();
    ghostGraphics.fillPath();
    
    // Eyes (black)
    ghostGraphics.fillStyle(0x000000);
    ghostGraphics.fillEllipse(10, 16, 4, 6);
    ghostGraphics.fillEllipse(22, 16, 4, 6);
    
    // Mouth (surprised)
    ghostGraphics.fillEllipse(16, 24, 3, 4);
    
    ghostGraphics.generateTexture('ghost', 32, 40);
    ghostGraphics.destroy();

    // Bat sprite
    const batGraphics = this.add.graphics();
    
    // Bat body
    batGraphics.fillStyle(0x2d1b0e);
    batGraphics.fillEllipse(12, 12, 8, 12);
    
    // Bat wings
    batGraphics.beginPath();
    // Left wing
    batGraphics.moveTo(4, 10);
    batGraphics.quadraticCurveTo(0, 6, 2, 14);
    batGraphics.quadraticCurveTo(6, 18, 8, 12);
    // Right wing
    batGraphics.moveTo(20, 10);
    batGraphics.quadraticCurveTo(24, 6, 22, 14);
    batGraphics.quadraticCurveTo(18, 18, 16, 12);
    batGraphics.fillPath();
    
    // Eyes (red)
    batGraphics.fillStyle(0xff0000);
    batGraphics.fillCircle(10, 10, 1);
    batGraphics.fillCircle(14, 10, 1);
    
    batGraphics.generateTexture('bat', 24, 20);
    batGraphics.destroy();

    // Vampire sprite
    const vampireGraphics = this.add.graphics();
    
    // Head (pale skin)
    vampireGraphics.fillStyle(0xe6e6e6);
    vampireGraphics.fillCircle(16, 12, 8);
    
    // Hair (black)
    vampireGraphics.fillStyle(0x000000);
    vampireGraphics.fillCircle(16, 8, 6);
    
    // Cape collar
    vampireGraphics.fillStyle(0x8b0000);
    vampireGraphics.fillRect(8, 18, 16, 4);
    
    // Eyes (red)
    vampireGraphics.fillStyle(0xff0000);
    vampireGraphics.fillCircle(13, 11, 1);
    vampireGraphics.fillCircle(19, 11, 1);
    
    // Fangs
    vampireGraphics.fillStyle(0xffffff);
    vampireGraphics.fillTriangle(12, 14, 14, 18, 16, 14);
    vampireGraphics.fillTriangle(16, 14, 18, 18, 20, 14);
    
    // Body (black cape)
    vampireGraphics.fillStyle(0x000000);
    vampireGraphics.fillRect(6, 22, 20, 24);
    
    // Cape (red interior)
    vampireGraphics.fillStyle(0x8b0000);
    vampireGraphics.fillTriangle(6, 22, 2, 46, 10, 46);
    vampireGraphics.fillTriangle(26, 22, 30, 46, 22, 46);
    
    vampireGraphics.generateTexture('vampire', 32, 48);
    vampireGraphics.destroy();

    // Mummy sprite
    const mummyGraphics = this.add.graphics();
    
    // Body base (beige)
    mummyGraphics.fillStyle(0xf5deb3);
    mummyGraphics.fillRect(8, 8, 16, 40);
    
    // Bandage wrappings (white)
    mummyGraphics.lineStyle(3, 0xffffff);
    for (let y = 10; y < 46; y += 6) {
      mummyGraphics.beginPath();
      mummyGraphics.moveTo(6, y);
      mummyGraphics.lineTo(26, y);
      mummyGraphics.strokePath();
    }
    
    // Head wrappings
    mummyGraphics.fillStyle(0xffffff);
    mummyGraphics.fillRect(10, 8, 12, 12);
    
    // Eyes (glowing)
    mummyGraphics.fillStyle(0xffff00);
    mummyGraphics.fillCircle(13, 14, 2);
    mummyGraphics.fillCircle(19, 14, 2);
    
    // Eye pupils
    mummyGraphics.fillStyle(0x000000);
    mummyGraphics.fillCircle(13, 14, 1);
    mummyGraphics.fillCircle(19, 14, 1);
    
    mummyGraphics.generateTexture('mummy', 32, 48);
    mummyGraphics.destroy();
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
    
    // Pumpkin ridges
    pumpkinGraphics.lineStyle(1, 0xcc5500);
    pumpkinGraphics.beginPath();
    pumpkinGraphics.moveTo(6, 8);
    pumpkinGraphics.lineTo(4, 20);
    pumpkinGraphics.moveTo(12, 6);
    pumpkinGraphics.lineTo(12, 22);
    pumpkinGraphics.moveTo(18, 8);
    pumpkinGraphics.lineTo(20, 20);
    pumpkinGraphics.strokePath();
    
    // Stem
    pumpkinGraphics.fillStyle(0x228b22);
    pumpkinGraphics.fillRect(11, 2, 2, 6);
    
    // Jack-o'-lantern face
    pumpkinGraphics.fillStyle(0xffff00);
    pumpkinGraphics.fillTriangle(8, 12, 10, 16, 6, 16);  // Left eye
    pumpkinGraphics.fillTriangle(16, 12, 18, 16, 14, 16); // Right eye
    pumpkinGraphics.fillRect(11, 18, 2, 1); // Nose
    
    // Smile
    pumpkinGraphics.beginPath();
    pumpkinGraphics.arc(12, 16, 4, 0, Math.PI);
    pumpkinGraphics.fillPath();
    
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
    
    // Spiral pattern
    lollipopGraphics.lineStyle(2, 0xffffff);
    lollipopGraphics.beginPath();
    lollipopGraphics.arc(12, 10, 6, 0, Math.PI * 2);
    lollipopGraphics.arc(12, 10, 4, 0, Math.PI * 2);
    lollipopGraphics.arc(12, 10, 2, 0, Math.PI * 2);
    lollipopGraphics.strokePath();
    
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
    // School gate
    const gateGraphics = this.add.graphics();
    
    // Gate posts
    gateGraphics.fillStyle(0x2d1b0e);
    gateGraphics.fillRect(10, 0, 15, 200);
    gateGraphics.fillRect(75, 0, 15, 200);
    
    // Gate bars
    gateGraphics.fillStyle(0x000000);
    for (let i = 0; i < 6; i++) {
      const x = 25 + i * 10;
      gateGraphics.fillRect(x, 20, 3, 160);
    }
    
    // Gate top
    gateGraphics.fillRect(10, 20, 80, 8);
    
    // School sign
    gateGraphics.fillStyle(0x8b4513);
    gateGraphics.fillRect(20, 40, 60, 30);
    
    // Sign text background
    gateGraphics.fillStyle(0xffffff);
    gateGraphics.fillRect(22, 42, 56, 26);
    
    // Decorative elements
    gateGraphics.fillStyle(0xffd700);
    gateGraphics.fillCircle(15, 10, 3);
    gateGraphics.fillCircle(85, 10, 3);
    
    gateGraphics.generateTexture('school_gate', 100, 200);
    gateGraphics.destroy();
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
    this.player = new Player(this, 100, this.WORLD_HEIGHT - 200, 'player');
    
    // Set player collision with world bounds
    this.player.setCollideWorldBounds(true);
    
    // Initialize HUD with player's starting stats
    this.updateGameState();
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
    // Place school gate at the end of the world
    this.schoolGate = this.add.rectangle(
      this.WORLD_WIDTH - 100, 
      this.WORLD_HEIGHT - 100, 
      100, 
      200, 
      0x8b4513
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
    
    // Create cursor keys (arrow keys)
    const cursors = this.input.keyboard.createCursorKeys();
    
    // Create WASD keys for alternative movement controls
    const wasd = this.input.keyboard.addKeys('W,S,A,D') as {
      W: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
    };
    
    // Create space key for attack
    const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Create escape key for pause
    const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    
    // Store keys for use in update loop
    this.registry.set('cursors', cursors);
    this.registry.set('wasd', wasd);
    this.registry.set('spaceKey', spaceKey);
    this.registry.set('escKey', escKey);
    
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
  }
  
  /**
   * Handle player input (keyboard and touch controls)
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
   */
  private handleInput(): void {
    // Skip input handling if game is paused
    if (this.scene.isPaused()) {
      return;
    }
    
    const cursors = this.registry.get('cursors');
    const wasd = this.registry.get('wasd');
    const spaceKey = this.registry.get('spaceKey');
    const escKey = this.registry.get('escKey');
    
    // Handle pause first (Esc key) - Requirement 3.6
    if (escKey && Phaser.Input.Keyboard.JustDown(escKey)) {
      this.handlePause();
      return; // Don't process other inputs when pausing
    }
    
    // Handle movement (A/D keys and arrow keys) - Requirements 3.1, 3.2
    const moveLeft = (
      (cursors?.left?.isDown) || 
      (wasd?.A?.isDown) || 
      this.touchControls.moveLeft
    );
    const moveRight = (
      (cursors?.right?.isDown) || 
      (wasd?.D?.isDown) || 
      this.touchControls.moveRight
    );
    
    if (moveLeft && !moveRight) {
      this.player.move('left');
    } else if (moveRight && !moveLeft) {
      this.player.move('right');
    } else {
      this.player.stopMovement();
    }
    
    // Handle jumping (W/↑ keys) - Requirement 3.3
    const shouldJump = (
      (cursors?.up?.isDown) || 
      (wasd?.W?.isDown) || 
      this.touchControls.jump
    );
    
    if (shouldJump) {
      this.player.jump();
    }
    
    // Handle crouching (S/↓ keys) - Requirement 3.4
    const shouldCrouch = (
      (cursors?.down?.isDown) || 
      (wasd?.S?.isDown) || 
      this.touchControls.crouch
    );
    
    if (shouldCrouch) {
      this.player.crouch();
    } else {
      this.player.stopCrouching();
    }
    
    // Handle attack (Space key) - Requirement 3.5
    const shouldAttack = (
      (spaceKey?.isDown) || 
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
   * Update spawning system based on player position
   * Requirements: 12.1, 12.2, 12.3, 6.1
   */
  private updateSpawning(): void {
    const playerX = this.player.x;
    
    // Check if we need to spawn new entities
    if (playerX > this.lastSpawnX + this.spawnInterval) {
      this.spawnEntitiesInRegion(this.lastSpawnX + this.spawnInterval, this.lastSpawnX + this.spawnInterval + this.spawnInterval);
      this.lastSpawnX += this.spawnInterval;
    }
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
    
    for (let i = 0; i < enemyCount; i++) {
      // Random position within the region
      const spawnX = startX + Math.random() * regionWidth;
      
      // Select random enemy type from available types for this difficulty
      const enemyType = this.getRandomEnemyType();
      
      // Get appropriate spawn height for enemy type
      const spawnY = EnemyFactory.getSpawnHeight(enemyType, groundY);
      
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
    // Only check weapon collisions if player has a weapon and is attacking
    if (!this.player.weapon) return;
    
    // Get weapon attack area based on weapon type and player position
    const weaponAttackArea = this.getWeaponAttackArea();
    if (!weaponAttackArea) return;
    
    // Check each enemy for collision with weapon attack area
    this.enemies.children.entries.forEach((enemy) => {
      if (!enemy.active) return;
      
      const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
      
      // Check if enemy is within weapon attack area
      if (this.isEnemyInWeaponRange(enemySprite, weaponAttackArea)) {
        this.handleWeaponHitEnemy(enemySprite);
      }
    });
  }
  
  /**
   * Get weapon attack area based on current weapon and player state
   */
  private getWeaponAttackArea(): { x: number; y: number; width: number; height: number } | null {
    if (!this.player.weapon) return null;
    
    // Only return attack area if weapon was just used (within a small time window)
    const timeSinceLastAttack = this.time.now - this.player.weapon.getLastAttackTime();
    if (timeSinceLastAttack > 100) return null; // 100ms window for attack detection
    
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
   * Update game state store with current player stats
   */
  private updateGameState(): void {
    // This will be connected to the Zustand store
    // For now, we'll emit events that can be caught by the React component
    this.events.emit('playerStatsChanged', {
      lives: this.player.lives,
      score: this.player.score
    });
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
  

}