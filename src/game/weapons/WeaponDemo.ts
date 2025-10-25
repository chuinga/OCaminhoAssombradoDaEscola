import { createWeapon, getWeaponSpecs } from './index';

/**
 * Demonstration of weapon system usage
 * This file shows how to create and use weapons in the game
 */
export class WeaponDemo {
  /**
   * Demonstrate weapon creation and basic usage
   */
  static demonstrateWeapons(scene: Phaser.Scene): void {
    console.log('=== Weapon System Demonstration ===');
    
    // Create all weapon types
    const katana = createWeapon(scene, 'katana');
    const laser = createWeapon(scene, 'laser');
    const baseball = createWeapon(scene, 'baseball');
    const bazooka = createWeapon(scene, 'bazooka');
    
    const weapons = [katana, laser, baseball, bazooka];
    
    // Display weapon specifications
    weapons.forEach(weapon => {
      const specs = getWeaponSpecs(weapon.type);
      console.log(`\n${specs.name}:`);
      console.log(`  Type: ${specs.type}`);
      console.log(`  Range: ${weapon.range}px`);
      console.log(`  Cooldown: ${weapon.cooldown}ms`);
      console.log(`  Description: ${specs.description}`);
      console.log(`  Special: ${specs.special}`);
      
      if (weapon.ammunition !== undefined) {
        console.log(`  Ammunition: ${weapon.ammunition}`);
      }
    });
    
    // Demonstrate attack timing
    console.log('\n=== Attack Timing Demo ===');
    const testWeapon = katana;
    
    console.log(`Can attack initially: ${testWeapon.canAttack()}`);
    testWeapon.attack(100, 100);
    console.log(`Can attack after first attack: ${testWeapon.canAttack()}`);
    
    // Simulate time passing
    setTimeout(() => {
      console.log(`Can attack after cooldown: ${testWeapon.canAttack()}`);
    }, testWeapon.cooldown + 50);
    
    // Demonstrate bazooka ammunition system
    console.log('\n=== Bazooka Ammunition Demo ===');
    console.log(`Bazooka initial ammo: ${bazooka.ammunition}`);
    
    for (let i = 1; i <= 3; i++) {
      if (bazooka.canAttack()) {
        bazooka.attack(100, 100);
        console.log(`After shot ${i}: ${bazooka.ammunition} ammo remaining`);
      }
    }
  }
  
  /**
   * Get weapon recommendations based on difficulty
   */
  static getWeaponRecommendations(difficulty: 'easy' | 'medium' | 'impossible'): string[] {
    const recommendations = {
      easy: [
        'Katana - Good for beginners with fast attacks',
        'Pistola de Laser - High fire rate helps with multiple enemies'
      ],
      medium: [
        'Taco de Basebol - Knockback helps control enemy positioning',
        'Pistola de Laser - Versatile for various situations'
      ],
      impossible: [
        'Bazuca - Area damage essential for enemy crowds',
        'Taco de Basebol - Knockback provides crowd control'
      ]
    };
    
    return recommendations[difficulty];
  }
  
  /**
   * Calculate theoretical DPS for each weapon
   */
  static calculateWeaponDPS(): Record<string, number> {
    const weaponTypes: Array<'katana' | 'laser' | 'baseball' | 'bazooka'> = 
      ['katana', 'laser', 'baseball', 'bazooka'];
    
    const dpsCalculations: Record<string, number> = {};
    
    weaponTypes.forEach(weaponType => {
      const specs = getWeaponSpecs(weaponType);
      // Assuming 1 hit = 1 kill, DPS = 1000ms / cooldown
      const dps = 1000 / specs.cooldown;
      dpsCalculations[specs.name] = Math.round(dps * 100) / 100; // Round to 2 decimals
    });
    
    return dpsCalculations;
  }
}