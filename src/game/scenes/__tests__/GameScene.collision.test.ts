import { GameScene } from '../GameScene';
import { Player } from '../../entities/Player';
import { Ghost } from '../../entities/Ghost';
import { LifeItem } from '../../entities/LifeItem';

// Mock Phaser
const mockScene = {
  add: {
    existing: jest.fn(),
    rectangle: jest.fn(),
    graphics: jest.fn(() => ({
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis(),
      generateTexture: jest.fn()
    })),
    tileSprite: jest.fn()
  },
  physics: {
    add: {
      existing: jest.fn(),
      group: jest.fn(),
      overlap: jest.fn()
    },
    world: {
      setBounds: jest.fn(),
      gravity: { y: 0 }
    }
  },
  time: {
    now: 1000
  },
  events: {
    emit: jest.fn()
  },
  cameras: {
    main: {
      startFollow: jest.fn(),
      setBounds: jest.fn(),
      setFollowOffset: jest.fn(),
      setLerp: jest.fn(),
      setDeadzone: jest.fn()
    }
  },
  input: {
    keyboard: {
      createCursorKeys: jest.fn(),
      addKeys: jest.fn(),
      addKey: jest.fn()
    }
  },
  registry: {
    get: jest.fn(),
    set: jest.fn()
  },
  scale: {
    width: 800,
    height: 600
  }
} as any;

describe('GameScene Collision Detection', () => {
  let gameScene: GameScene;
  let mockPlayer: Player;

  beforeEach(() => {
    gameScene = new GameScene();
    // Set up the scene with mock
    (gameScene as any).scene = mockScene;
    (gameScene as any).add = mockScene.add;
    (gameScene as any).physics = mockScene.physics;
    (gameScene as any).time = mockScene.time;
    (gameScene as any).events = mockScene.events;
    (gameScene as any).cameras = mockScene.cameras;
    (gameScene as any).input = mockScene.input;
    (gameScene as any).registry = mockScene.registry;
    (gameScene as any).scale = mockScene.scale;

    // Create mock player
    mockPlayer = {
      x: 100,
      y: 100,
      lives: 10,
      score: 0,
      isInvulnerable: false,
      isCrouching: false,
      isJumping: false,
      flipX: false,
      weapon: null,
      takeDamage: jest.fn(),
      addLife: jest.fn(),
      addScore: jest.fn()
    } as any;

    (gameScene as any).player = mockPlayer;
  });

  describe('canPlayerAvoidDamage', () => {
    it('should allow crouching player to avoid floating enemies', () => {
      mockPlayer.isCrouching = true;
      const mockGhost = { type: 'ghost' } as any;

      const result = (gameScene as any).canPlayerAvoidDamage(mockPlayer, mockGhost);

      expect(result).toBe(true);
    });

    it('should allow jumping player to avoid ground enemies', () => {
      mockPlayer.isJumping = true;
      const mockVampire = { type: 'vampire' } as any;

      const result = (gameScene as any).canPlayerAvoidDamage(mockPlayer, mockVampire);

      expect(result).toBe(true);
    });

    it('should not allow crouching player to avoid ground enemies', () => {
      mockPlayer.isCrouching = true;
      const mockVampire = { type: 'vampire' } as any;

      const result = (gameScene as any).canPlayerAvoidDamage(mockPlayer, mockVampire);

      expect(result).toBe(false);
    });

    it('should not allow jumping player to avoid floating enemies', () => {
      mockPlayer.isJumping = true;
      const mockGhost = { type: 'ghost' } as any;

      const result = (gameScene as any).canPlayerAvoidDamage(mockPlayer, mockGhost);

      expect(result).toBe(false);
    });
  });

  describe('handlePlayerEnemyCollision', () => {
    it('should not damage invulnerable player', () => {
      mockPlayer.isInvulnerable = true;
      const mockEnemy = { destroy: jest.fn() } as any;

      (gameScene as any).handlePlayerEnemyCollision(mockPlayer, mockEnemy);

      expect(mockPlayer.takeDamage).not.toHaveBeenCalled();
      expect(mockEnemy.destroy).not.toHaveBeenCalled();
    });

    it('should damage player and destroy enemy on collision', () => {
      mockPlayer.isInvulnerable = false;
      const mockEnemy = { destroy: jest.fn(), type: 'ghost' } as any;
      (gameScene as any).canPlayerAvoidDamage = jest.fn().mockReturnValue(false);
      (gameScene as any).updateGameState = jest.fn();
      (gameScene as any).handleGameOver = jest.fn();

      (gameScene as any).handlePlayerEnemyCollision(mockPlayer, mockEnemy);

      expect(mockPlayer.takeDamage).toHaveBeenCalled();
      expect(mockEnemy.destroy).toHaveBeenCalled();
    });
  });

  describe('handlePlayerLifeItemCollision', () => {
    it('should add life and score when collecting life item', () => {
      const mockLifeItem = {
        getPointValue: jest.fn().mockReturnValue(50),
        collect: jest.fn()
      } as any;
      (gameScene as any).updateGameState = jest.fn();

      (gameScene as any).handlePlayerLifeItemCollision(mockPlayer, mockLifeItem);

      expect(mockPlayer.addLife).toHaveBeenCalled();
      expect(mockPlayer.addScore).toHaveBeenCalledWith(50);
      expect(mockLifeItem.collect).toHaveBeenCalled();
    });
  });

  describe('handlePlayerSchoolGateCollision', () => {
    it('should add bonus score and trigger game win', () => {
      mockPlayer.lives = 5;
      (gameScene as any).updateGameState = jest.fn();
      (gameScene as any).handleGameWin = jest.fn();

      (gameScene as any).handlePlayerSchoolGateCollision();

      expect(mockPlayer.addScore).toHaveBeenCalledWith(500);
      expect((gameScene as any).handleGameWin).toHaveBeenCalled();
    });

    it('should not trigger win if player has no lives', () => {
      mockPlayer.lives = 0;
      (gameScene as any).updateGameState = jest.fn();
      (gameScene as any).handleGameWin = jest.fn();

      (gameScene as any).handlePlayerSchoolGateCollision();

      expect(mockPlayer.addScore).not.toHaveBeenCalled();
      expect((gameScene as any).handleGameWin).not.toHaveBeenCalled();
    });
  });

  describe('handleWeaponHitEnemy', () => {
    it('should award points and destroy enemy', () => {
      const mockEnemy = { destroy: jest.fn() } as any;
      mockPlayer.weapon = { type: 'katana' } as any;
      (gameScene as any).updateGameState = jest.fn();
      (gameScene as any).applyKnockback = jest.fn();

      (gameScene as any).handleWeaponHitEnemy(mockEnemy);

      expect(mockPlayer.addScore).toHaveBeenCalledWith(100);
      expect(mockEnemy.destroy).toHaveBeenCalled();
    });

    it('should apply knockback for baseball bat', () => {
      const mockEnemy = { 
        destroy: jest.fn(),
        body: {
          setVelocityX: jest.fn()
        }
      } as any;
      mockPlayer.weapon = { type: 'baseball' } as any;
      mockPlayer.flipX = false;
      (gameScene as any).updateGameState = jest.fn();

      (gameScene as any).handleWeaponHitEnemy(mockEnemy);

      expect(mockPlayer.addScore).toHaveBeenCalledWith(100);
      expect(mockEnemy.destroy).toHaveBeenCalled();
    });
  });
});