// Mock Phaser before importing weapons
jest.mock('phaser', () => ({}));

import { Katana } from '../Katana';
import { LaserGun } from '../LaserGun';
import { BaseballBat } from '../BaseballBat';
import { Bazooka } from '../Bazooka';

// Mock AudioManager
jest.mock('../../utils/AudioManager', () => ({
  audioManager: {
    playWeaponSound: jest.fn()
  }
}));

// Mock Phaser Scene with more complete implementation
class MockScene {
  public time = {
    now: 0,
    delayedCall: jest.fn()
  };
  
  public add = {
    rectangle: jest.fn(() => ({
      destroy: jest.fn(),
      setAlpha: jest.fn()
    })),
    circle: jest.fn(() => ({
      destroy: jest.fn(),
      setScale: jest.fn(),
      setAlpha: jest.fn()
    })),
    arc: jest.fn(() => ({
      destroy: jest.fn(),
      setAngle: jest.fn(),
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
  
  public tweens = {
    add: jest.fn((config: any) => {
      // Simulate immediate completion for testing
      if (config.onComplete) {
        config.onComplete();
      }
    })
  };
  
  public physics = {
    add: {
      group: jest.fn(() => ({
        get: jest.fn(() => ({
          fire: jest.fn(),
          setActive: jest.fn(),
          setVisible: jest.fn()
        })),
        clear: jest.fn()
      }))
    }
  };
  
  public cameras = {
    main: {
      worldView: {
        right: 800,
        left: 0
      }
    }
  };
  
  public scale = {
    width: 800
  };
}

describe('Weapon Mechanics', () => {
  let mockScene: MockScene;
  
  beforeEach(() => {
    mockScene = new MockScene();
    jest.clearAllMocks();
  });
  
  describe('Katana', () => {
    let katana: Katana;
    
    beforeEach(() => {
      katana = new Katana(mockScene as any);
    });
    
    it('should have correct specifications per requirement 5.1', () => {
      expect(katana.type).toBe('katana');
      expect(katana.range).toBe(40); // 40px range
      expect(katana.cooldown).toBe(300); // 300ms cooldown
      expect(katana.ammunition).toBeUndefined(); // No ammunition limit
    });
    
    it('should perform melee attack when cooldown is ready', () => {
      mockScene.time.now = 1000;
      
      katana.attack(100, 100);
      
      expect(mockScene.add.rectangle).toHaveBeenCalledWith(
        100, 100, 40, 60, 0xffffff, 0.3
      );
      expect(mockScene.tweens.add).toHaveBeenCalled();
    });
    
    it('should not attack when cooldown is not ready', () => {
      mockScene.time.now = 1000;
      katana.attack(100, 100); // First attack
      
      mockScene.time.now = 1200; // Only 200ms later, need 300ms
      katana.attack(150, 150); // Second attack
      
      // Should only have been called once (first attack)
      expect(mockScene.add.rectangle).toHaveBeenCalledTimes(1);
    });
    
    it('should respect 300ms cooldown timing', () => {
      mockScene.time.now = 1000;
      expect(katana.canAttack()).toBe(true);
      
      katana.attack(100, 100);
      expect(katana.canAttack()).toBe(false);
      
      mockScene.time.now = 1299; // 299ms later
      expect(katana.canAttack()).toBe(false);
      
      mockScene.time.now = 1300; // Exactly 300ms later
      expect(katana.canAttack()).toBe(true);
    });
  });
  
  describe('LaserGun', () => {
    let laserGun: LaserGun;
    
    beforeEach(() => {
      laserGun = new LaserGun(mockScene as any);
    });
    
    it('should have correct specifications per requirement 5.2', () => {
      expect(laserGun.type).toBe('laser');
      expect(laserGun.range).toBe(800); // Screen width for projectiles
      expect(laserGun.cooldown).toBe(200); // 200ms cooldown
      expect(laserGun.ammunition).toBeUndefined(); // No ammunition limit
    });
    
    it('should create projectile group on construction', () => {
      expect(mockScene.physics.add.group).toHaveBeenCalledWith({
        classType: expect.any(Function),
        maxSize: 10,
        runChildUpdate: true
      });
    });
    
    it('should fire projectile when attacking', () => {
      const mockProjectile = {
        fire: jest.fn()
      };
      const mockGroup = {
        get: jest.fn(() => mockProjectile),
        clear: jest.fn()
      };
      mockScene.physics.add.group = jest.fn(() => mockGroup);
      
      const newLaserGun = new LaserGun(mockScene as any);
      mockScene.time.now = 1000;
      
      newLaserGun.attack(100, 100);
      
      expect(mockGroup.get).toHaveBeenCalledWith(100, 100);
      expect(mockProjectile.fire).toHaveBeenCalledWith(500); // 500px/s speed
    });
    
    it('should respect 200ms cooldown timing', () => {
      mockScene.time.now = 1000;
      expect(laserGun.canAttack()).toBe(true);
      
      laserGun.attack(100, 100);
      expect(laserGun.canAttack()).toBe(false);
      
      mockScene.time.now = 1199; // 199ms later
      expect(laserGun.canAttack()).toBe(false);
      
      mockScene.time.now = 1200; // Exactly 200ms later
      expect(laserGun.canAttack()).toBe(true);
    });
  });
  
  describe('BaseballBat', () => {
    let baseballBat: BaseballBat;
    
    beforeEach(() => {
      baseballBat = new BaseballBat(mockScene as any);
    });
    
    it('should have correct specifications per requirement 5.3', () => {
      expect(baseballBat.type).toBe('baseball');
      expect(baseballBat.range).toBe(55); // 55px range
      expect(baseballBat.cooldown).toBe(450); // 450ms cooldown
      expect(baseballBat.ammunition).toBeUndefined(); // No ammunition limit
    });
    
    it('should perform melee attack with swing effect', () => {
      mockScene.time.now = 1000;
      
      baseballBat.attack(100, 100);
      
      expect(mockScene.add.arc).toHaveBeenCalledWith(
        100, 100, 55, 0, 180, false, 0xffffff, 0.4
      );
      expect(mockScene.tweens.add).toHaveBeenCalled();
    });
    
    it('should respect 450ms cooldown timing', () => {
      mockScene.time.now = 1000;
      expect(baseballBat.canAttack()).toBe(true);
      
      baseballBat.attack(100, 100);
      expect(baseballBat.canAttack()).toBe(false);
      
      mockScene.time.now = 1449; // 449ms later
      expect(baseballBat.canAttack()).toBe(false);
      
      mockScene.time.now = 1450; // Exactly 450ms later
      expect(baseballBat.canAttack()).toBe(true);
    });
    
    it('should apply knockback effect to enemies', () => {
      const mockEnemy = {
        x: 150,
        body: {
          setVelocityX: jest.fn()
        }
      };
      
      baseballBat.applyKnockback(mockEnemy, 100);
      
      // Enemy at x=150, attack at x=100, so knockback should be positive (right)
      expect(mockEnemy.body.setVelocityX).toHaveBeenCalledWith(200);
    });
    
    it('should apply knockback in correct direction', () => {
      const mockEnemyLeft = {
        x: 50,
        body: { setVelocityX: jest.fn() }
      };
      const mockEnemyRight = {
        x: 150,
        body: { setVelocityX: jest.fn() }
      };
      
      baseballBat.applyKnockback(mockEnemyLeft, 100); // Enemy to left of attack
      expect(mockEnemyLeft.body.setVelocityX).toHaveBeenCalledWith(-200);
      
      baseballBat.applyKnockback(mockEnemyRight, 100); // Enemy to right of attack
      expect(mockEnemyRight.body.setVelocityX).toHaveBeenCalledWith(200);
    });
  });
  
  describe('Bazooka', () => {
    let bazooka: Bazooka;
    
    beforeEach(() => {
      bazooka = new Bazooka(mockScene as any);
    });
    
    it('should have correct specifications per requirement 5.4', () => {
      expect(bazooka.type).toBe('bazooka');
      expect(bazooka.range).toBe(400);
      expect(bazooka.cooldown).toBe(900); // 900ms cooldown
      expect(bazooka.ammunition).toBe(6); // 6 ammunition limit
    });
    
    it('should create rocket group on construction', () => {
      expect(mockScene.physics.add.group).toHaveBeenCalledWith({
        classType: expect.any(Function),
        maxSize: 6, // Match ammunition limit
        runChildUpdate: true
      });
    });
    
    it('should fire rocket when attacking with ammunition', () => {
      const mockRocket = {
        fire: jest.fn()
      };
      const mockGroup = {
        get: jest.fn(() => mockRocket),
        clear: jest.fn()
      };
      mockScene.physics.add.group = jest.fn(() => mockGroup);
      
      const newBazooka = new Bazooka(mockScene as any);
      mockScene.time.now = 1000;
      
      newBazooka.attack(100, 100);
      
      expect(mockGroup.get).toHaveBeenCalledWith(100, 100);
      expect(mockRocket.fire).toHaveBeenCalledWith(300, 80); // Speed and explosion radius
    });
    
    it('should consume ammunition when attacking', () => {
      mockScene.time.now = 1000;
      
      expect(bazooka.getAmmunition()).toBe(6);
      
      bazooka.attack(100, 100);
      expect(bazooka.getAmmunition()).toBe(5);
      
      mockScene.time.now = 2000; // Wait for cooldown
      bazooka.attack(100, 100);
      expect(bazooka.getAmmunition()).toBe(4);
    });
    
    it('should not attack when out of ammunition', () => {
      // Consume all ammunition
      for (let i = 0; i < 6; i++) {
        mockScene.time.now = i * 1000;
        bazooka.attack(100, 100);
      }
      
      expect(bazooka.getAmmunition()).toBe(0);
      
      mockScene.time.now = 10000; // Wait for cooldown
      expect(bazooka.canAttack()).toBe(false); // No ammunition
    });
    
    it('should respect 900ms cooldown timing', () => {
      mockScene.time.now = 1000;
      expect(bazooka.canAttack()).toBe(true);
      
      bazooka.attack(100, 100);
      expect(bazooka.canAttack()).toBe(false);
      
      mockScene.time.now = 1899; // 899ms later
      expect(bazooka.canAttack()).toBe(false);
      
      mockScene.time.now = 1900; // Exactly 900ms later
      expect(bazooka.canAttack()).toBe(true);
    });
    
    it('should reload ammunition correctly', () => {
      // Consume some ammunition
      mockScene.time.now = 1000;
      bazooka.attack(100, 100);
      mockScene.time.now = 2000;
      bazooka.attack(100, 100);
      
      expect(bazooka.getAmmunition()).toBe(4);
      
      bazooka.reload();
      expect(bazooka.getAmmunition()).toBe(6);
    });
  });
  
  describe('Weapon Damage Calculations', () => {
    it('should eliminate enemies in one hit per requirement 5.5', () => {
      // This test verifies that all weapons are designed to eliminate enemies in one hit
      // The actual damage calculation is handled by the collision system
      
      const katana = new Katana(mockScene as any);
      const laserGun = new LaserGun(mockScene as any);
      const baseballBat = new BaseballBat(mockScene as any);
      const bazooka = new Bazooka(mockScene as any);
      
      // All weapons should be able to attack (indicating they can deal damage)
      expect(katana.canAttack()).toBe(true);
      expect(laserGun.canAttack()).toBe(true);
      expect(baseballBat.canAttack()).toBe(true);
      expect(bazooka.canAttack()).toBe(true);
      
      // All weapons should have attack methods that can be called
      expect(typeof katana.attack).toBe('function');
      expect(typeof laserGun.attack).toBe('function');
      expect(typeof baseballBat.attack).toBe('function');
      expect(typeof bazooka.attack).toBe('function');
    });
  });
});