import * as Phaser from 'phaser';
import { Player } from '../entities/Player';
import { DifficultyConfig } from '../../types';

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
  
  constructor() {
    super({ key: 'GameScene' });
  }
  
  /**
   * Initialize scene data
   */
  init(): void {
    // Get difficulty from game registry (set by React component)
    this.difficulty = this.registry.get('difficulty') || 'easy';
  }
  
  /**
   * Preload assets for the game scene
   */
  preload(): void {
    // Create placeholder colored rectangles for now since we don't have actual assets yet
    // These will be replaced with actual sprites later
    
    // Player placeholder
    this.add.graphics()
      .fillStyle(0x00ff00)
      .fillRect(0, 0, 32, 48)
      .generateTexture('player', 32, 48);
    
    // Background layer placeholders
    this.add.graphics()
      .fillStyle(0x1a1a2e)
      .fillRect(0, 0, 800, 720)
      .generateTexture('moon_clouds', 800, 720);
    
    this.add.graphics()
      .fillStyle(0x16213e)
      .fillRect(0, 0, 800, 720)
      .generateTexture('houses', 800, 720);
    
    this.add.graphics()
      .fillStyle(0x0f3460)
      .fillRect(0, 0, 800, 720)
      .generateTexture('trees', 800, 720);
    
    this.add.graphics()
      .fillStyle(0x533483)
      .fillRect(0, 0, 800, 720)
      .generateTexture('street', 800, 720);
    
    // School gate placeholder
    this.add.graphics()
      .fillStyle(0x8b4513)
      .fillRect(0, 0, 100, 200)
      .generateTexture('school_gate', 100, 200);
  }
  
  /**
   * Create game objects and set up the scene
   */
  create(): void {
    // Set world bounds
    this.physics.world.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
    
    // Set up Arcade Physics with gravity
    this.physics.world.gravity.y = this.GRAVITY;
    
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
   * Set up keyboard controls
   */
  private setupControls(): void {
    // Create cursor keys
    const cursors = this.input.keyboard?.createCursorKeys();
    
    // Create WASD keys
    const wasd = this.input.keyboard?.addKeys('W,S,A,D');
    
    // Create space key for attack
    const spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Create escape key for pause
    const escKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    
    // Store keys for use in update loop
    this.registry.set('cursors', cursors);
    this.registry.set('wasd', wasd);
    this.registry.set('spaceKey', spaceKey);
    this.registry.set('escKey', escKey);
  }
  
  /**
   * Get difficulty configuration
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
    
    // Handle collisions
    this.handleCollisions();
  }
  
  /**
   * Handle player input
   */
  private handleInput(): void {
    const cursors = this.registry.get('cursors');
    const wasd = this.registry.get('wasd');
    const spaceKey = this.registry.get('spaceKey');
    const escKey = this.registry.get('escKey');
    
    if (!cursors || !wasd) return;
    
    // Handle movement
    if (cursors.left?.isDown || wasd.A?.isDown) {
      this.player.move('left');
    } else if (cursors.right?.isDown || wasd.D?.isDown) {
      this.player.move('right');
    } else {
      this.player.stopMovement();
    }
    
    // Handle jumping
    if (cursors.up?.isDown || wasd.W?.isDown) {
      this.player.jump();
    }
    
    // Handle crouching
    if (cursors.down?.isDown || wasd.S?.isDown) {
      this.player.crouch();
    } else {
      this.player.stopCrouching();
    }
    
    // Handle attack
    if (spaceKey?.isDown) {
      this.player.attack();
    }
    
    // Handle pause
    if (Phaser.Input.Keyboard.JustDown(escKey)) {
      this.scene.pause();
      // TODO: Show pause menu
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
   * Handle collision detection
   */
  private handleCollisions(): void {
    // Player-enemy collisions
    this.physics.overlap(this.player, this.enemies, (player, enemy) => {
      this.handlePlayerEnemyCollision(player as Player, enemy as Phaser.GameObjects.GameObject);
    });
    
    // Player-life item collisions
    this.physics.overlap(this.player, this.lifeItems, (player, item) => {
      this.handlePlayerLifeItemCollision(player as Player, item as Phaser.GameObjects.GameObject);
    });
    
    // Player-school gate collision
    this.physics.overlap(this.player, this.schoolGate, () => {
      this.handlePlayerSchoolGateCollision();
    });
  }
  
  /**
   * Handle player-enemy collision
   */
  private handlePlayerEnemyCollision(player: Player, enemy: Phaser.GameObjects.GameObject): void {
    // Player takes damage and enemy is destroyed
    player.takeDamage();
    enemy.destroy();
    
    // Check for game over
    if (player.lives <= 0) {
      this.handleGameOver();
    }
  }
  
  /**
   * Handle player-life item collision
   */
  private handlePlayerLifeItemCollision(player: Player, item: Phaser.GameObjects.GameObject): void {
    // Player gains life and points
    player.addLife();
    player.addScore(50); // +50 points for life item
    
    // Destroy the item
    item.destroy();
    
    // TODO: Play item collection sound
  }
  
  /**
   * Handle player reaching school gate
   */
  private handlePlayerSchoolGateCollision(): void {
    // Player wins the game
    this.player.addScore(500); // +500 bonus points for completion
    this.handleGameWin();
  }
  
  /**
   * Handle game over (player died)
   */
  private handleGameOver(): void {
    // Pause the game
    this.scene.pause();
    
    // TODO: Navigate to results page with defeat status
    console.log('Game Over! Final Score:', this.player.score);
  }
  
  /**
   * Handle game win (reached school)
   */
  private handleGameWin(): void {
    // Pause the game
    this.scene.pause();
    
    // TODO: Navigate to results page with victory status
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
}