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
    
    // Enemy placeholders
    this.add.graphics()
      .fillStyle(0xffffff)
      .fillRect(0, 0, 32, 32)
      .generateTexture('ghost', 32, 32);
    
    this.add.graphics()
      .fillStyle(0x8b4513)
      .fillRect(0, 0, 24, 20)
      .generateTexture('bat', 24, 20);
    
    this.add.graphics()
      .fillStyle(0x800080)
      .fillRect(0, 0, 32, 48)
      .generateTexture('vampire', 32, 48);
    
    this.add.graphics()
      .fillStyle(0xf5deb3)
      .fillRect(0, 0, 32, 48)
      .generateTexture('mummy', 32, 48);
    
    // Life item placeholders
    this.add.graphics()
      .fillStyle(0xff6600)
      .fillRect(0, 0, 24, 24)
      .generateTexture('life_item_pumpkin', 24, 24);
    
    this.add.graphics()
      .fillStyle(0xff69b4)
      .fillRect(0, 0, 24, 24)
      .generateTexture('life_item_lollipop', 24, 24);
    
    this.add.graphics()
      .fillStyle(0xff0000)
      .fillRect(0, 0, 24, 24)
      .generateTexture('life_item_apple', 24, 24);
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
  
  /**
   * Cleanup when scene is shut down
   */
  shutdown(): void {
    // Stop background music when scene ends
    audioManager.stopBackgroundMusic();
    
    // Call parent shutdown
    super.shutdown();
  }
}