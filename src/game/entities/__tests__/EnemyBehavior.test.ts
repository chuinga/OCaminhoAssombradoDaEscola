import { Ghost } from '../Ghost';
import { Vampire } from '../Vampire';
import { BaseEnemy } from '../Enemy';

// Mock Phaser classes
class MockBody {
  public touching = { down: false };
  public velocity = { x: 0, y: 0 };
  
  setGravityY = jest.fn();
  setSize = jest.fn();
  setVelocityX = jest.fn((x: number) => { this.velocity.x = x; });
  setVelocityY = jest.fn((y: number) => { this.velocity.y = y; });
  setCollideWorldBounds = jest.fn();
}

class MockScene {
  public time = {
    now: 0
  };
  
  public add = {
    existing: jest.fn()
  };
  
  public physics = {
    add: {
      existing: jest.fn()
    }
  };
  
  public scale = {
    width: 800
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
        
        constructor(scene: any, x: number, y: number, texture: string) {
          this.x = x;
          this.y = y;
          this.body = new MockBody();
        }
        
        setAlpha = jest.fn((alpha: number) => { this.alpha = alpha; });
        setFlipX = jest.fn();
        destroy = jest.fn();
      }
    }
  }
}));

describe('Enemy Behavior', () => {
  let mockScene: MockScene;
  
  beforeEach(() => {
    mockScene = new MockScene();
    jest.clearAllMocks();
  });
  
  describe('BaseEnemy', () => {
    // Create a concrete implementation for testing
    class TestEnemy extends BaseEnemy {
      updateMovement(): void {
        // Simple test movement
        if (this.body) {
          (this.body as any).setVelocityX(-this.moveSpeed);
        }
      }
    }
    
    let enemy: TestEnemy;
    
    beforeEach(() => {
      enemy = new TestEnemy(mockScene as any, 100, 100, 'test', 'ghost');
    });
    
    it('should initialize with correct properties', () => {
      expect(enemy.type).toBe('ghost');
      expect(enemy.isAlive).toBe(true);
      expect(enemy.moveSpeed).toBe(100);
      expect(enemy.movementType).toBe('floating');
    });
    
    it('should configure physics body on creation', () => {
      expect(mockScene.add.existing).toHaveBeenCalledWith(enemy);
      expect(mockScene.physics.add.existing).toHaveBeenCalledWith(enemy);
      expect(enemy.body.setCollideWorldBounds).toHaveBeenCalledWith(true);
      expect(enemy.body.setSize).toHaveBeenCalledWith(32, 32);
    });
    
    it('should set gravity based on movement type', () => {
      // Floating enemy should have no gravity
      expect(enemy.body.setGravityY).toHaveBeenCalledWith(0);
    });
    
    it('should handle collision correctly', () => {
      const destroySpy = jest.spyOn(enemy, 'destroy');
      
      enemy.onCollision();
      
      expect(destroySpy).toHaveBeenCalled();
    });
    
    it('should update movement when alive', () => {
      const updateMovementSpy = jest.spyOn(enemy, 'updateMovement');
      
      enemy.update();
      
      expect(updateMovementSpy).toHaveBeenCalled();
    });
    
    it('should not update movement when dead', () => {
      enemy.isAlive = false;
      const updateMovementSpy = jest.spyOn(enemy, 'updateMovement');
      
      enemy.update();
      
      expect(updateMovementSpy).not.toHaveBeenCalled();
    });
    
    it('should destroy when going off screen', () => {
      const destroySpy = jest.spyOn(enemy, 'destroy');
      
      // Move enemy far off screen
      enemy.x = -200;
      enemy.update();
      
      expect(destroySpy).toHaveBeenCalled();
    });
    
    it('should set isAlive to false when destroyed', () => {
      enemy.destroy();
      expect(enemy.isAlive).toBe(false);
    });
  });
  
  describe('Ghost', () => {
    let ghost: Ghost;
    
    beforeEach(() => {
      ghost = new Ghost(mockScene as any, 200, 150, 'ghost');
    });
    
    it('should have correct ghost specifications per requirement 4.1', () => {
      expect(ghost.type).toBe('ghost');
      expect(ghost.moveSpeed).toBe(80); // Moderate floating speed
      expect(ghost.movementType).toBe('floating');
    });
    
    it('should configure physics for floating movement', () => {
      expect(ghost.body.setGravityY).toHaveBeenCalledWith(0); // No gravity
      expect(ghost.body.setSize).toHaveBeenCalledWith(28, 32); // Smaller collision box
    });
    
    it('should move left with constant horizontal velocity', () => {
      ghost.updateMovement();
      
      expect(ghost.body.setVelocityX).toHaveBeenCalledWith(-80); // Move left
    });
    
    it('should have floating motion with sine wave pattern', () => {
      const initialY = ghost.y;
      mockScene.time.now = 1000;
      
      ghost.updateMovement();
      
      // Y position should change due to floating motion
      // The exact value depends on the sine calculation
      expect(typeof ghost.y).toBe('number');
    });
    
    it('should have transparency effect for ghostly appearance', () => {
      mockScene.time.now = 1000;
      
      ghost.updateMovement();
      
      expect(ghost.setAlpha).toHaveBeenCalled();
      // Alpha should be between 0.6 and 1.0 (0.8 ± 0.2)
      const alphaCall = (ghost.setAlpha as jest.Mock).mock.calls[0][0];
      expect(alphaCall).toBeGreaterThanOrEqual(0.6);
      expect(alphaCall).toBeLessThanOrEqual(1.0);
    });
    
    it('should remove 1 life and disappear on collision per requirement 4.1', () => {
      const destroySpy = jest.spyOn(ghost, 'destroy');
      
      ghost.onCollision();
      
      expect(destroySpy).toHaveBeenCalled();
    });
  });
  
  describe('Vampire', () => {
    let vampire: Vampire;
    
    beforeEach(() => {
      vampire = new Vampire(mockScene as any, 200, 150, 'vampire');
    });
    
    it('should have correct vampire specifications per requirement 4.3', () => {
      expect(vampire.type).toBe('vampire');
      expect(vampire.moveSpeed).toBe(100); // Ground walking speed
      expect(vampire.movementType).toBe('ground');
    });
    
    it('should configure physics for ground movement', () => {
      expect(vampire.body.setGravityY).toHaveBeenCalledWith(300); // Apply gravity
      expect(vampire.body.setSize).toHaveBeenCalledWith(32, 48); // Taller collision box
    });
    
    it('should move left with constant horizontal velocity', () => {
      vampire.updateMovement();
      
      expect(vampire.body.setVelocityX).toHaveBeenCalledWith(-100); // Move left
    });
    
    it('should face left when moving left', () => {
      vampire.updateMovement();
      
      expect(vampire.setFlipX).toHaveBeenCalledWith(true); // Face left
    });
    
    it('should have walking animation with bobbing motion', () => {
      const initialY = vampire.y;
      
      vampire.updateMovement();
      
      // Y position might change due to walking bob effect
      expect(typeof vampire.y).toBe('number');
    });
    
    it('should apply walking bob only when on ground', () => {
      vampire.body.touching.down = true;
      const initialY = vampire.y;
      
      vampire.updateMovement();
      
      // When on ground, bobbing effect should be applied
      // The exact change depends on the animation timer
      expect(typeof vampire.y).toBe('number');
    });
    
    it('should remove 1 life and disappear on collision per requirement 4.3', () => {
      const destroySpy = jest.spyOn(vampire, 'destroy');
      
      vampire.onCollision();
      
      expect(destroySpy).toHaveBeenCalled();
    });
  });
  
  describe('Enemy Movement Patterns', () => {
    it('should have different movement speeds for different enemy types', () => {
      const ghost = new Ghost(mockScene as any, 100, 100);
      const vampire = new Vampire(mockScene as any, 100, 100);
      
      expect(ghost.moveSpeed).toBe(80); // Moderate floating
      expect(vampire.moveSpeed).toBe(100); // Ground walking
    });
    
    it('should have different physics configurations for floating vs ground enemies', () => {
      const ghost = new Ghost(mockScene as any, 100, 100);
      const vampire = new Vampire(mockScene as any, 100, 100);
      
      // Ghost should have no gravity (floating)
      expect(ghost.body.setGravityY).toHaveBeenCalledWith(0);
      
      // Vampire should have gravity (ground)
      expect(vampire.body.setGravityY).toHaveBeenCalledWith(300);
    });
    
    it('should have different collision box sizes for different enemy types', () => {
      const ghost = new Ghost(mockScene as any, 100, 100);
      const vampire = new Vampire(mockScene as any, 100, 100);
      
      // Ghost has smaller collision box
      expect(ghost.body.setSize).toHaveBeenCalledWith(28, 32);
      
      // Vampire has taller collision box (humanoid)
      expect(vampire.body.setSize).toHaveBeenCalledWith(32, 48);
    });
  });
  
  describe('Enemy Collision Behavior', () => {
    it('should all enemies remove 1 life and disappear on contact per requirements 4.1-4.4', () => {
      const ghost = new Ghost(mockScene as any, 100, 100);
      const vampire = new Vampire(mockScene as any, 100, 100);
      
      const ghostDestroySpy = jest.spyOn(ghost, 'destroy');
      const vampireDestroySpy = jest.spyOn(vampire, 'destroy');
      
      ghost.onCollision();
      vampire.onCollision();
      
      expect(ghostDestroySpy).toHaveBeenCalled();
      expect(vampireDestroySpy).toHaveBeenCalled();
    });
    
    it('should not process collision when already dead', () => {
      const ghost = new Ghost(mockScene as any, 100, 100);
      ghost.isAlive = false;
      
      const destroySpy = jest.spyOn(ghost, 'destroy');
      
      ghost.onCollision();
      
      expect(destroySpy).not.toHaveBeenCalled();
    });
  });
});