import * as Phaser from 'phaser';
import { WeaponEntity } from '../../types';
import { audioManager } from '../utils/AudioManager';

export class Weapon implements WeaponEntity {
  public type: 'katana' | 'laser' | 'baseball' | 'bazooka';
  public range: number;
  public cooldown: number;
  public ammunition?: number;
  
  private scene: Phaser.Scene;
  private lastAttackTime: number = 0;
  
  constructor(
    scene: Phaser.Scene,
    type: 'katana' | 'laser' | 'baseball' | 'bazooka'
  ) {
    this.scene = scene;
    this.type = type;
    this.lastAttackTime = 0;
    
    // Set weapon properties based on type
    switch (type) {
      case 'katana':
        this.range = 40;
        this.cooldown = 300;
        break;
      case 'laser':
        this.range = 500;
        this.cooldown = 200;
        break;
      case 'baseball':
        this.range = 55;
        this.cooldown = 450;
        break;
      case 'bazooka':
        this.range = 100;
        this.cooldown = 900;
        this.ammunition = 6;
        break;
    }
  }
  
  attack(x: number, y: number): void {
    if (!this.canAttack()) return;
    
    this.lastAttackTime = this.scene.time.now;
    
    // Play weapon-specific sound
    this.playAttackSound();
    
    // Handle ammunition for bazooka
    if (this.type === 'bazooka' && this.ammunition !== undefined) {
      this.ammunition = Math.max(0, this.ammunition - 1);
    }
  }
  
  canAttack(): boolean {
    const timeSinceLastAttack = this.scene.time.now - this.lastAttackTime;
    
    // Check cooldown
    if (timeSinceLastAttack < this.cooldown) {
      return false;
    }
    
    // Check ammunition for bazooka
    if (this.type === 'bazooka' && this.ammunition !== undefined && this.ammunition <= 0) {
      return false;
    }
    
    return true;
  }
  
  getLastAttackTime(): number {
    return this.lastAttackTime;
  }
  
  private playAttackSound(): void {
    switch (this.type) {
      case 'katana':
      case 'baseball':
        audioManager.playSlashSound();
        break;
      case 'laser':
        audioManager.playLaserSound();
        break;
      case 'bazooka':
        audioManager.playExplosionSound();
        break;
    }
  }
  
  // Get remaining ammunition (for bazooka)
  getRemainingAmmo(): number {
    return this.ammunition || 0;
  }
  
  // Reload ammunition (for bazooka)
  reload(): void {
    if (this.type === 'bazooka') {
      this.ammunition = 6;
    }
  }
}

export class WeaponFactory {
  static createWeapon(
    scene: Phaser.Scene,
    type: 'katana' | 'laser' | 'baseball' | 'bazooka'
  ): Weapon {
    return new Weapon(scene, type);
  }
}