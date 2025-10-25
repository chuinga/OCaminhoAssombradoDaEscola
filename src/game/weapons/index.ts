// Export all weapon classes
export { BaseWeapon } from './BaseWeapon';
export { Katana } from './Katana';
export { LaserGun } from './LaserGun';
export { BaseballBat } from './BaseballBat';
export { Bazooka } from './Bazooka';

// Weapon factory function
import { Katana } from './Katana';
import { LaserGun } from './LaserGun';
import { BaseballBat } from './BaseballBat';
import { Bazooka } from './Bazooka';
import { WeaponEntity } from '../../types';

/**
 * Factory function to create weapon instances
 */
export function createWeapon(
  scene: Phaser.Scene, 
  weaponType: 'katana' | 'laser' | 'baseball' | 'bazooka'
): WeaponEntity {
  switch (weaponType) {
    case 'katana':
      return new Katana(scene);
    case 'laser':
      return new LaserGun(scene);
    case 'baseball':
      return new BaseballBat(scene);
    case 'bazooka':
      return new Bazooka(scene);
    default:
      throw new Error(`Unknown weapon type: ${weaponType}`);
  }
}

/**
 * Get weapon specifications for UI display
 */
export function getWeaponSpecs(weaponType: 'katana' | 'laser' | 'baseball' | 'bazooka') {
  const specs = {
    katana: {
      name: 'Katana',
      description: 'Fast melee weapon with moderate range',
      range: 40,
      cooldown: 300,
      type: 'melee',
      special: 'Quick attacks'
    },
    laser: {
      name: 'Pistola de Laser',
      description: 'Rapid-fire projectile weapon',
      range: 800,
      cooldown: 200,
      type: 'projectile',
      special: 'High fire rate'
    },
    baseball: {
      name: 'Taco de Basebol',
      description: 'Powerful melee weapon with knockback',
      range: 55,
      cooldown: 450,
      type: 'melee',
      special: 'Knockback effect'
    },
    bazooka: {
      name: 'Bazuca',
      description: 'Area damage weapon with limited ammo',
      range: 400,
      cooldown: 900,
      type: 'explosive',
      special: 'Area damage, 6 shots',
      ammunition: 6
    }
  };
  
  return specs[weaponType];
}