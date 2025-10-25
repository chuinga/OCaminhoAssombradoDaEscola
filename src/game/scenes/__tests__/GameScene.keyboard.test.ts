import { GameScene } from '../GameScene';
import * as Phaser from 'phaser';

// Mock Phaser components
jest.mock('phaser', () => ({
  Scene: class MockScene {
    registry = new Map();
    input = {
      keyboard: {
        createCursorKeys: jest.fn(() => ({
          left: { isDown: false },
          right: { isDown: false },
          up: { isDown: false },
          down: { isDown: false }
        })),
        addKeys: jest.fn(() => ({
          W: { isDown: false },
          A: { isDown: false },
          S: { isDown: false },
          D: { isDown: false }
        })),
        addKey: jest.fn(() => ({ isDown: false })),
        addCapture: jest.fn()
      }
    };
    events = {
      emit: jest.fn()
    };
    scene = {
      isPaused: jest.fn(() => false),
      pause: jest.fn(),
      resume: jest.fn()
    };
    physics = {
      world: {
        setBounds: jest.fn(),
        gravity: { y: 0 }
      },
      add: {
        group: jest.fn(() => ({
          children: { entries: [] }
        })),
        existing: jest.fn(),
        overlap: jest.fn()
      }
    };
    add = {
      graphics: jest.fn(() => ({
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        generateTexture: jest.fn().mockReturnThis()
      })),
      tileSprite: jest.fn(() => ({
        setOrigin: jest.fn().mockReturnThis(),
        setScrollFactor: jest.fn().mockReturnThis()
      })),
      rectangle: jest.fn(() => ({})),
      existing: jest.fn()
    };
    cameras = {
      main: {
        startFollow: jest.fn(),
        setBounds: jest.fn(),
        setFollowOffset: jest.fn(),
        setLerp: jest.fn(),
        setDeadzone: jest.fn(),
        scrollX: 0
      }
    };
    time = {
      now: 0
    };
  },
  Input: {
    Keyboard: {
      KeyCodes: {
        W: 87,
        A: 65,
        S: 83,
        D: 68,
        SPACE: 32,
        ESC: 27,
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39
      },
      JustDown: jest.fn(() => false)
    }
  },
  Physics: {
    Arcade: {
      Sprite: class MockSprite {
        x = 0;
        y = 0;
        flipX = false;
        body = {
          setCollideWorldBounds: jest.fn(),
          setGravityY: jest.fn(),
          setSize: jest.fn(),
          touching: { down: true }
        };
        setFlipX = jest.fn();
        constructor(scene: any, x: number, y: number, texture: string) {
          this.x = x;
          this.y = y;
        }
      }
    }
  }
}));

describe('GameScene Keyboard Input', () => {
  let gameScene: GameScene;
  let mockPlayer: any;

  beforeEach(() => {
    gameScene = new GameScene();
    
    // Mock player
    mockPlayer = {
      x: 100,
      y: 100,
      lives: 10,
      score: 0,
      move: jest.fn(),
      stopMovement: jest.fn(),
      jump: jest.fn(),
      crouch: jest.fn(),
      stopCrouching: jest.fn(),
      attack: jest.fn(),
      update: jest.fn(),
      setCollideWorldBounds: jest.fn(),
      weapon: null
    };
    
    // Set up the scene with mocked components
    (gameScene as any).player = mockPlayer;
    (gameScene as any).enemies = { children: { entries: [] } };
    (gameScene as any).lifeItems = { children: { entries: [] } };
    (gameScene as any).touchControls = {
      moveLeft: false,
      moveRight: false,
      jump: false,
      crouch: false,
      attack: false
    };
  });

  describe('setupControls', () => {
    it('should initialize keyboard controls correctly', () => {
      // Call setupControls
      (gameScene as any).setupControls();
      
      // Verify keyboard controls are set up
      expect(gameScene.areKeyboardControlsReady()).toBe(true);
      
      // Verify input capture is set up
      expect(gameScene.input.keyboard?.addCapture).toHaveBeenCalledWith([
        87, 65, 83, 68, 32, 38, 40, 37, 39, 27 // W, A, S, D, SPACE, UP, DOWN, LEFT, RIGHT, ESC
      ]);
    });

    it('should handle missing keyboard input gracefully', () => {
      // Mock missing keyboard input
      (gameScene as any).input.keyboard = null;
      
      // Should not throw error
      expect(() => (gameScene as any).setupControls()).not.toThrow();
      expect(gameScene.areKeyboardControlsReady()).toBe(false);
    });
  });

  describe('handleInput', () => {
    beforeEach(() => {
      (gameScene as any).setupControls();
    });

    it('should handle WASD movement keys', () => {
      const wasd = {
        W: { isDown: false },
        A: { isDown: true },  // Press A key
        S: { isDown: false },
        D: { isDown: false }
      };
      gameScene.registry.set('wasd', wasd);
      
      (gameScene as any).handleInput();
      
      expect(mockPlayer.move).toHaveBeenCalledWith('left');
    });

    it('should handle arrow keys movement', () => {
      const cursors = {
        left: { isDown: false },
        right: { isDown: true }, // Press right arrow
        up: { isDown: false },
        down: { isDown: false }
      };
      gameScene.registry.set('cursors', cursors);
      
      (gameScene as any).handleInput();
      
      expect(mockPlayer.move).toHaveBeenCalledWith('right');
    });

    it('should handle jump with W key', () => {
      const wasd = {
        W: { isDown: true }, // Press W key
        A: { isDown: false },
        S: { isDown: false },
        D: { isDown: false }
      };
      gameScene.registry.set('wasd', wasd);
      
      (gameScene as any).handleInput();
      
      expect(mockPlayer.jump).toHaveBeenCalled();
    });

    it('should handle jump with up arrow', () => {
      const cursors = {
        left: { isDown: false },
        right: { isDown: false },
        up: { isDown: true }, // Press up arrow
        down: { isDown: false }
      };
      gameScene.registry.set('cursors', cursors);
      
      (gameScene as any).handleInput();
      
      expect(mockPlayer.jump).toHaveBeenCalled();
    });

    it('should handle crouch with S key', () => {
      const wasd = {
        W: { isDown: false },
        A: { isDown: false },
        S: { isDown: true }, // Press S key
        D: { isDown: false }
      };
      gameScene.registry.set('wasd', wasd);
      
      (gameScene as any).handleInput();
      
      expect(mockPlayer.crouch).toHaveBeenCalled();
    });

    it('should handle crouch with down arrow', () => {
      const cursors = {
        left: { isDown: false },
        right: { isDown: false },
        up: { isDown: false },
        down: { isDown: true } // Press down arrow
      };
      gameScene.registry.set('cursors', cursors);
      
      (gameScene as any).handleInput();
      
      expect(mockPlayer.crouch).toHaveBeenCalled();
    });

    it('should handle attack with space key', () => {
      const spaceKey = { isDown: true }; // Press space
      gameScene.registry.set('spaceKey', spaceKey);
      
      (gameScene as any).handleInput();
      
      expect(mockPlayer.attack).toHaveBeenCalled();
    });

    it('should combine keyboard and touch controls', () => {
      // Set touch control for left movement
      (gameScene as any).touchControls.moveLeft = true;
      
      // Set keyboard control for jump
      const wasd = {
        W: { isDown: true },
        A: { isDown: false },
        S: { isDown: false },
        D: { isDown: false }
      };
      gameScene.registry.set('wasd', wasd);
      
      (gameScene as any).handleInput();
      
      // Both touch and keyboard inputs should work
      expect(mockPlayer.move).toHaveBeenCalledWith('left');
      expect(mockPlayer.jump).toHaveBeenCalled();
    });

    it('should stop movement when no movement keys are pressed', () => {
      // No movement keys pressed
      const wasd = {
        W: { isDown: false },
        A: { isDown: false },
        S: { isDown: false },
        D: { isDown: false }
      };
      const cursors = {
        left: { isDown: false },
        right: { isDown: false },
        up: { isDown: false },
        down: { isDown: false }
      };
      gameScene.registry.set('wasd', wasd);
      gameScene.registry.set('cursors', cursors);
      
      (gameScene as any).handleInput();
      
      expect(mockPlayer.stopMovement).toHaveBeenCalled();
    });

    it('should stop crouching when crouch keys are released', () => {
      // No crouch keys pressed
      const wasd = {
        W: { isDown: false },
        A: { isDown: false },
        S: { isDown: false }, // S key not pressed
        D: { isDown: false }
      };
      const cursors = {
        left: { isDown: false },
        right: { isDown: false },
        up: { isDown: false },
        down: { isDown: false } // Down arrow not pressed
      };
      gameScene.registry.set('wasd', wasd);
      gameScene.registry.set('cursors', cursors);
      
      (gameScene as any).handleInput();
      
      expect(mockPlayer.stopCrouching).toHaveBeenCalled();
    });
  });

  describe('pause functionality', () => {
    beforeEach(() => {
      (gameScene as any).setupControls();
    });

    it('should handle pause with ESC key', () => {
      const escKey = { isDown: true };
      gameScene.registry.set('escKey', escKey);
      
      // Mock JustDown to return true for ESC
      (Phaser.Input.Keyboard.JustDown as jest.Mock).mockReturnValue(true);
      
      (gameScene as any).handleInput();
      
      expect(gameScene.scene.pause).toHaveBeenCalled();
    });

    it('should skip input processing when game is paused', () => {
      // Mock game as paused
      (gameScene.scene.isPaused as jest.Mock).mockReturnValue(true);
      
      const wasd = {
        W: { isDown: true },
        A: { isDown: true },
        S: { isDown: true },
        D: { isDown: true }
      };
      gameScene.registry.set('wasd', wasd);
      
      (gameScene as any).handleInput();
      
      // No player actions should be called when paused
      expect(mockPlayer.move).not.toHaveBeenCalled();
      expect(mockPlayer.jump).not.toHaveBeenCalled();
      expect(mockPlayer.crouch).not.toHaveBeenCalled();
    });
  });

  describe('getKeyboardState', () => {
    it('should return current keyboard state', () => {
      const wasd = {
        W: { isDown: true },
        A: { isDown: false },
        S: { isDown: true },
        D: { isDown: false }
      };
      const cursors = {
        left: { isDown: true },
        right: { isDown: false },
        up: { isDown: false },
        down: { isDown: true }
      };
      const spaceKey = { isDown: true };
      const escKey = { isDown: false };
      
      gameScene.registry.set('wasd', wasd);
      gameScene.registry.set('cursors', cursors);
      gameScene.registry.set('spaceKey', spaceKey);
      gameScene.registry.set('escKey', escKey);
      
      const state = gameScene.getKeyboardState();
      
      expect(state).toEqual({
        cursors: {
          left: true,
          right: false,
          up: false,
          down: true
        },
        wasd: {
          W: true,
          A: false,
          S: true,
          D: false
        },
        spaceKey: true,
        escKey: false
      });
    });
  });
});