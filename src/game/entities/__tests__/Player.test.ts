import { Player } from '../Player';

// Mock AudioManager
jest.mock('../../utils/AudioManager', () => ({
  audioManager: {
    playJumpSound: jest.fn(),
    playDamageSound: jest.fn(),
    playWeaponSound: jest.fn()
  }
}));

// Mock WeaponFactory
jest.mock('../WeaponFactory', () => ({
  WeaponFactory: {
    createWeapon: jest.fn()
  }
}));

// Mock Phaser classes
class MockBody {
  public touching = { down: false };
  public velocity = { x: 0, y: 0 };
  
  setCollideWorldBounds = jest.fn();
  setGravityY = jest.fn();
  setSize = jest.fn();
  setOffset = jest.fn();
  setVelocityX = jest.fn((x: number) => { this.velocity.x = x; });
  setVelocityY = jest.fn((y: number) => { this.velocity.y = y; });
}

class MockScene {
  public time = {
    now: 0
  };
  
  public registry = {
    get: jest.fn(() => 'boy')
  };
  
  public add = {
    existing: jest.fn(),
    rectangle: jest.fn(() => ({
      destroy: jest.fn(),
      setAlpha: jest.fn()
    })),
    circle: jest.fn(() => ({
      destroy: jest.fn(),
      setScale: jest.fn(),
      setAlpha: jest.fn()
    })),
    graphics: jest.fn(() => ({
      lineStyle: jest.fn(),
      lineBetween: jest.fn(),
      fillStyle: jest.fn(),
      fillCircle: jest.fn(),
      strokeCircle: jest.fn(),
      destroy: jest.fn()
    }))
  };
  
  public physics = {
    add: {
      existing: jest.fn()
    }
  };
  
  public tweens = {
    add: jest.fn((config: any) => {
      if (config.onComplete) {
        config.onComplete();
      }
    })
  };
}

// Mock Phaser.Physics.Arcade.Sprite
jest.mock('phaser', () => ({
  Physics: {
    Arcade: {
      Sprite: class MockSprite {
        public x: number;
        public y: number;
        public body: MockBody;
        public alpha: number = 1;
        public flipX: boolean = false;
        
        constructor(scene: any, x: number, y: number, texture: string) {
          this.x = x;
          this.y = y;
          this.body = new MockBody();
        }
        
        setAlpha = jest.fn((alpha: number) => { this.alpha = alpha; });
        setFlipX = jest.fn((flip: boolean) => { this.flipX = flip; });
        destroy = jest.fn();
      }
    }
  }
}));

describe('Player', () => {
  let mockScene: MockScene;
  let player: Player;
  
  beforeEach(() => {
    mockScene = new MockScene();
    player = new Player(mockScene as any, 100, 100, 'player');
    jest.clearAllMocks();
  });
  
  describe('constructor', () => {
    it('should initialize with correct starting values per requirement 7.1', () => {
      expect(player.lives).toBe(10); // Starting lives
      expect(player.score).toBe(0); // Starting score
      expect(player.weapon).toBeNull();
      expect(player.isInvulnerable).toBe(false);
      expect(player.invulnerabilityTimer).toBe(0);
      expect(player.isCrouching).toBe(false);
      expect(player.isJumping).toBe(false);
    });
    
    it('should configure physics body correctly', () => {
      expect(mockScene.add.existing).toHaveBeenCalledWith(player);
      expect(mockScene.physics.add.existing).toHaveBeenCalledWith(player);
      expect(player.body.setCollideWorldBounds).toHaveBeenCalledWith(true);
      expect(player.body.setGravityY).toHaveBeenCalledWith(300);
      expect(player.body.setSize).toHaveBeenCalledWith(32, 48);
    });
    
    it('should select correct character texture based on registry', () => {
      mockScene.registry.get = jest.fn(() => 'girl');
      const femalePlayer = new Player(mockScene as any, 100, 100, 'player');
      
      expect(mockScene.registry.get).toHaveBeenCalledWith('character');
    });
  });
  
  describe('movement', () => {
    it('should move left when direction is left per requirement 3.1', () => {
      player.move('left');
      
      expect(player.body.setVelocityX).toHaveBeenCalledWith(-200);
      expect(player.setFlipX).toHaveBeenCalledWith(true); // Face left
    });
    
    it('should move right when direction is right per requirement 3.2', () => {
      player.move('right');
      
      expect(player.body.setVelocityX).toHaveBeenCalledWith(200);
      expect(player.setFlipX).toHaveBeenCalledWith(false); // Face right
    });
    
    it('should not move when crouching', () => {
      player.crouch();
      player.move('right');
      
      // Should not set velocity when crouching
      expect(player.body.setVelocityX).toHaveBeenCalledWith(0); // From crouch, not from move
    });
    
    it('should stop movement correctly', () => {
      player.stopMovement();
      
      expect(player.body.setVelocityX).toHaveBeenCalledWith(0);
    });
  });
  
  describe('jumping', () => {
    it('should jump when on ground per requirement 3.3', () => {
      player.body.touching.down = true;
      
      player.jump();
      
      expect(player.body.setVelocityY).toHaveBeenCalledWith(-360);
      expect(player.isJumping).toBe(true);
    });
    
    it('should not jump when not on ground', () => {
      player.body.touching.down = false;
      
      player.jump();
      
      expect(player.body.setVelocityY).not.toHaveBeenCalled();
      expect(player.isJumping).toBe(false);
    });
    
    it('should not jump when crouching', () => {
      player.body.touching.down = true;
      player.crouch();
      
      player.jump();
      
      expect(player.body.setVelocityY).not.toHaveBeenCalled();
    });
    
    it('should play jump sound when jumping', () => {
      const { audioManager } = require('../../utils/AudioManager');
      player.body.touching.down = true;
      
      player.jump();
      
      expect(audioManager.playJumpSound).toHaveBeenCalled();
    });
  });
  
  describe('crouching', () => {
    it('should crouch and modify collision box per requirement 3.4', () => {
      player.crouch();
      
      expect(player.isCrouching).toBe(true);
      expect(player.body.setSize).toHaveBeenCalledWith(32, 24); // Reduced height
      expect(player.body.setOffset).toHaveBeenCalledWith(0, 24);
      expect(player.body.setVelocityX).toHaveBeenCalledWith(0); // Stop movement
    });
    
    it('should stop crouching and restore collision box', () => {
      player.crouch();
      player.stopCrouching();
      
      expect(player.isCrouching).toBe(false);
      expect(player.body.setSize).toHaveBeenCalledWith(32, 48); // Restored height
      expect(player.body.setOffset).toHaveBeenCalledWith(0, 0);
    });
  });
  
  describe('attacking', () => {
    let mockWeapon: any;
    
    beforeEach(() => {
      mockWeapon = {
        type: 'katana',
        range: 40,
        canAttack: jest.fn(() => true),
        attack: jest.fn(),
        getLastAttackTime: jest.fn(() => mockScene.time.now - 50)
      };
      player.setWeapon(mockWeapon);
    });
    
    it('should attack with weapon when available per requirement 3.5', () => {
      player.attack();
      
      expect(mockWeapon.canAttack).toHaveBeenCalled();
      expect(mockWeapon.attack).toHaveBeenCalled();
    });
    
    it('should not attack when no weapon is set', () => {
      player.setWeapon(null);
      
      player.attack();
      
      // No weapon, so no attack should occur
      expect(mockWeapon.attack).not.toHaveBeenCalled();
    });
    
    it('should not attack when crouching', () => {
      player.crouch();
      
      player.attack();
      
      expect(mockWeapon.attack).not.toHaveBeenCalled();
    });
    
    it('should not attack when weapon cooldown is not ready', () => {
      mockWeapon.canAttack = jest.fn(() => false);
      
      player.attack();
      
      expect(mockWeapon.attack).not.toHaveBeenCalled();
    });
    
    it('should calculate attack position based on facing direction', () => {
      player.flipX = false; // Facing right
      player.x = 100;
      player.y = 150;
      
      player.attack();
      
      expect(mockWeapon.attack).toHaveBeenCalledWith(140, 150); // x + range
      
      player.flipX = true; // Facing left
      player.attack();
      
      expect(mockWeapon.attack).toHaveBeenCalledWith(60, 150); // x - range
    });
    
    it('should play weapon-specific sound per requirement 11.5', () => {
      const { audioManager } = require('../../utils/AudioManager');
      
      player.attack();
      
      expect(audioManager.playWeaponSound).toHaveBeenCalledWith('katana');
    });
  });
  
  describe('damage and invulnerability', () => {
    it('should take damage and lose life per requirement 7.3', () => {
      player.takeDamage();
      
      expect(player.lives).toBe(9); // Lost 1 life
      expect(player.isInvulnerable).toBe(true);
      expect(player.invulnerabilityTimer).toBe(800); // 800ms invulnerability
      expect(player.setAlpha).toHaveBeenCalledWith(0.5); // Visual feedback
    });
    
    it('should not take damage when already invulnerable', () => {
      player.takeDamage(); // First damage
      const livesAfterFirst = player.lives;
      
      player.takeDamage(); // Second damage while invulnerable
      
      expect(player.lives).toBe(livesAfterFirst); // No additional damage
    });
    
    it('should not take damage when lives are 0', () => {
      player.lives = 0;
      
      player.takeDamage();
      
      expect(player.lives).toBe(0); // Should not go negative
      expect(player.isInvulnerable).toBe(false); // Should not become invulnerable
    });
    
    it('should play damage sound when taking damage per requirement 11.3', () => {
      const { audioManager } = require('../../utils/AudioManager');
      
      player.takeDamage();
      
      expect(audioManager.playDamageSound).toHaveBeenCalled();
    });
    
    it('should have 800ms invulnerability duration per requirement 7.4', () => {
      player.takeDamage();
      
      expect(player.invulnerabilityTimer).toBe(800);
    });
  });
  
  describe('scoring and lives', () => {
    it('should add score correctly', () => {
      player.addScore(100);
      expect(player.score).toBe(100);
      
      player.addScore(50);
      expect(player.score).toBe(150);
    });
    
    it('should add life up to maximum of 10 per requirement 6.2', () => {
      player.lives = 8;
      
      player.addLife();
      expect(player.lives).toBe(9);
      
      player.addLife();
      expect(player.lives).toBe(10);
      
      player.addLife(); // Should not exceed 10
      expect(player.lives).toBe(10);
    });
  });
  
  describe('update method', () => {
    it('should update invulnerability timer', () => {
      player.takeDamage();
      const initialTimer = player.invulnerabilityTimer;
      
      player.update(1000, 100); // 100ms delta
      
      expect(player.invulnerabilityTimer).toBe(initialTimer - 100);
    });
    
    it('should end invulnerability when timer expires', () => {
      player.takeDamage();
      
      player.update(1000, 900); // 900ms delta, more than 800ms timer
      
      expect(player.isInvulnerable).toBe(false);
      expect(player.setAlpha).toHaveBeenCalledWith(1); // Restore full opacity
    });
    
    it('should create flashing effect during invulnerability', () => {
      player.takeDamage();
      
      player.update(1000, 50); // Small delta, still invulnerable
      
      expect(player.setAlpha).toHaveBeenCalled();
      // Should be called with either 0.5 or 0.2 for flashing effect
      const alphaCall = (player.setAlpha as jest.Mock).mock.calls.slice(-1)[0][0];
      expect([0.5, 0.2]).toContain(alphaCall);
    });
    
    it('should update jumping state when landing', () => {
      player.isJumping = true;
      player.body.touching.down = true;
      
      player.update(1000, 16);
      
      expect(player.isJumping).toBe(false);
    });
  });
  
  describe('utility methods', () => {
    it('should check if player is on ground correctly', () => {
      player.body.touching.down = true;
      expect(player.isOnGround()).toBe(true);
      
      player.body.touching.down = false;
      expect(player.isOnGround()).toBe(false);
    });
    
    it('should check if player is attacking correctly', () => {
      const mockWeapon = {
        getLastAttackTime: jest.fn(() => mockScene.time.now - 50) // 50ms ago
      };
      player.setWeapon(mockWeapon);
      
      expect(player.isAttacking()).toBe(true); // Within 100ms window
      
      mockWeapon.getLastAttackTime = jest.fn(() => mockScene.time.now - 150); // 150ms ago
      expect(player.isAttacking()).toBe(false); // Outside 100ms window
    });
    
    it('should return correct state information', () => {
      player.x = 200;
      player.y = 300;
      player.lives = 8;
      player.score = 1500;
      player.isInvulnerable = true;
      player.isCrouching = true;
      player.isJumping = false;
      
      const state = player.getState();
      
      expect(state).toEqual({
        x: 200,
        y: 300,
        lives: 8,
        score: 1500,
        isInvulnerable: true,
        isCrouching: true,
        isJumping: false
      });
    });
  });
});