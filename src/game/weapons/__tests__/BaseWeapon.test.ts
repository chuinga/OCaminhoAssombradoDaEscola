import { BaseWeapon } from '../BaseWeapon';

// Mock Phaser Scene
class MockScene {
  public time = {
    now: 0
  };
  
  public add = {
    rectangle: jest.fn(() => ({
      destroy: jest.fn()
    })),
    circle: jest.fn(() => ({
      destroy: jest.fn()
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
  
  public tweens = {
    add: jest.fn((config: any) => {
      // Simulate immediate completion for testing
      if (config.onComplete) {
        config.onComplete();
      }
    })
  };
}

// Concrete implementation for testing
class TestWeapon extends BaseWeapon {
  public attackCalled = false;
  public attackX = 0;
  public attackY = 0;
  
  attack(x: number, y: number): void {
    if (!this.canAttack()) return;
    
    this.onAttack();
    this.attackCalled = true;
    this.attackX = x;
    this.attackY = y;
  }
}

describe('BaseWeapon', () => {
  let mockScene: MockScene;
  let weapon: TestWeapon;
  
  beforeEach(() => {
    mockScene = new MockScene();
    weapon = new TestWeapon(mockScene as any, 'katana', 40, 300);
  });
  
  describe('constructor', () => {
    it('should initialize weapon properties correctly', () => {
      expect(weapon.type).toBe('katana');
      expect(weapon.range).toBe(40);
      expect(weapon.cooldown).toBe(300);
      expect(weapon.ammunition).toBeUndefined();
    });
    
    it('should initialize weapon with ammunition when provided', () => {
      const bazookaWeapon = new TestWeapon(mockScene as any, 'bazooka', 400, 900, 6);
      expect(bazookaWeapon.ammunition).toBe(6);
    });
  });
  
  describe('canAttack', () => {
    it('should return true when cooldown is ready and has ammo', () => {
      mockScene.time.now = 1000;
      expect(weapon.canAttack()).toBe(true);
    });
    
    it('should return false when cooldown is not ready', () => {
      mockScene.time.now = 1000;
      weapon.attack(100, 100); // First attack
      
      mockScene.time.now = 1200; // Only 200ms later, cooldown is 300ms
      expect(weapon.canAttack()).toBe(false);
    });
    
    it('should return true when cooldown is ready after waiting', () => {
      mockScene.time.now = 1000;
      weapon.attack(100, 100); // First attack
      
      mockScene.time.now = 1400; // 400ms later, cooldown is 300ms
      expect(weapon.canAttack()).toBe(true);
    });
    
    it('should return false when out of ammunition', () => {
      const bazookaWeapon = new TestWeapon(mockScene as any, 'bazooka', 400, 900, 0);
      expect(bazookaWeapon.canAttack()).toBe(false);
    });
    
    it('should return true when has ammunition', () => {
      const bazookaWeapon = new TestWeapon(mockScene as any, 'bazooka', 400, 900, 3);
      mockScene.time.now = 1000; // Set time to ensure cooldown is ready
      expect(bazookaWeapon.canAttack()).toBe(true);
    });
  });
  
  describe('attack', () => {
    it('should call onAttack when attack is successful', () => {
      mockScene.time.now = 1000;
      weapon.attack(100, 100);
      
      expect(weapon.attackCalled).toBe(true);
      expect(weapon.attackX).toBe(100);
      expect(weapon.attackY).toBe(100);
    });
    
    it('should not attack when cooldown is not ready', () => {
      mockScene.time.now = 1000;
      weapon.attack(100, 100); // First attack
      weapon.attackCalled = false; // Reset flag
      
      mockScene.time.now = 1200; // Only 200ms later
      weapon.attack(150, 150); // Second attack attempt
      
      expect(weapon.attackCalled).toBe(false);
    });
  });
  
  describe('onAttack', () => {
    it('should update last attack time', () => {
      mockScene.time.now = 1500;
      weapon.attack(100, 100);
      
      expect(weapon.getLastAttackTime()).toBe(1500);
    });
    
    it('should consume ammunition when applicable', () => {
      const bazookaWeapon = new TestWeapon(mockScene as any, 'bazooka', 400, 900, 6);
      mockScene.time.now = 1000;
      
      bazookaWeapon.attack(100, 100);
      expect(bazookaWeapon.ammunition).toBe(5);
      
      mockScene.time.now = 2000; // Wait for cooldown
      bazookaWeapon.attack(100, 100);
      expect(bazookaWeapon.ammunition).toBe(4);
    });
    
    it('should not go below 0 ammunition', () => {
      const bazookaWeapon = new TestWeapon(mockScene as any, 'bazooka', 400, 900, 1);
      mockScene.time.now = 1000;
      
      bazookaWeapon.attack(100, 100);
      expect(bazookaWeapon.ammunition).toBe(0);
      
      mockScene.time.now = 2000; // Wait for cooldown
      // Should not attack when out of ammo, so ammunition stays at 0
      const attackedBefore = bazookaWeapon.attackCalled;
      bazookaWeapon.attackCalled = false;
      bazookaWeapon.attack(100, 100);
      expect(bazookaWeapon.attackCalled).toBe(false); // Attack should not happen
      expect(bazookaWeapon.ammunition).toBe(0); // Should not go negative
    });
  });
  
  describe('getLastAttackTime', () => {
    it('should return 0 initially', () => {
      expect(weapon.getLastAttackTime()).toBe(0);
    });
    
    it('should return correct time after attack', () => {
      mockScene.time.now = 2500;
      weapon.attack(100, 100);
      
      expect(weapon.getLastAttackTime()).toBe(2500);
    });
  });
});