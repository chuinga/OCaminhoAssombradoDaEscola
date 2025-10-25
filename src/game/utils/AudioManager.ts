import { Howl, Howler } from 'howler';

/**
 * AudioManager handles all game audio using Howler.js
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */
export class AudioManager {
  private static instance: AudioManager;
  private sounds: Map<string, Howl> = new Map();
  private backgroundMusic: Howl | null = null;
  private isInitialized: boolean = false;
  private isMuted: boolean = false;
  
  // Volume settings
  private readonly MUSIC_VOLUME = 0.3;
  private readonly SFX_VOLUME = 0.7;
  
  private constructor() {
    // Private constructor for singleton pattern
  }
  
  /**
   * Get singleton instance of AudioManager
   */
  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }
  
  /**
   * Initialize audio system and load all sounds
   * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
   */
  public initialize(): void {
    if (this.isInitialized) return;
    
    try {
      // Set global volume
      Howler.volume(1.0);
      
      // Load background music
      this.loadBackgroundMusic();
      
      // Load sound effects
      this.loadSoundEffects();
      
      this.isInitialized = true;
      console.log('AudioManager initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize AudioManager:', error);
      // Graceful degradation - game continues without sound
    }
  }
  
  /**
   * Load background music (wind and crickets ambient sound)
   * Requirements: 11.1
   */
  private loadBackgroundMusic(): void {
    // For now, we'll create a placeholder for background music
    // In a real implementation, this would load actual audio files
    this.backgroundMusic = new Howl({
      src: ['/assets/audio/background-ambient.mp3', '/assets/audio/background-ambient.ogg'],
      loop: true,
      volume: this.MUSIC_VOLUME,
      autoplay: false,
      onloaderror: (_, error) => {
        console.warn('Failed to load background music:', error);
        // Create a silent placeholder to prevent errors
        this.backgroundMusic = this.createSilentSound(30000); // 30 second silent loop
      }
    });
  }
  
  /**
   * Load all sound effects
   * Requirements: 11.2, 11.3, 11.4, 11.5
   */
  private loadSoundEffects(): void {
    const soundEffects = [
      // Player action sounds
      { key: 'jump', src: ['/assets/audio/jump.mp3', '/assets/audio/jump.ogg'] },
      { key: 'damage', src: ['/assets/audio/damage.mp3', '/assets/audio/damage.ogg'] },
      { key: 'item_collect', src: ['/assets/audio/item-collect.mp3', '/assets/audio/item-collect.ogg'] },
      
      // Weapon sounds
      { key: 'slash', src: ['/assets/audio/slash.mp3', '/assets/audio/slash.ogg'] }, // Katana & Baseball Bat
      { key: 'laser', src: ['/assets/audio/laser.mp3', '/assets/audio/laser.ogg'] }, // Laser Gun
      { key: 'explosion', src: ['/assets/audio/explosion.mp3', '/assets/audio/explosion.ogg'] }, // Bazooka
    ];
    
    soundEffects.forEach(({ key, src }) => {
      const sound = new Howl({
        src,
        volume: this.SFX_VOLUME,
        onloaderror: (_, error) => {
          console.warn(`Failed to load sound effect '${key}':`, error);
          // Create a silent placeholder to prevent errors
          this.sounds.set(key, this.createSilentSound(500)); // 500ms silent sound
        }
      });
      
      this.sounds.set(key, sound);
    });
  }
  
  /**
   * Create a silent sound as fallback when audio files fail to load
   */
  private createSilentSound(duration: number): Howl {
    // Create a minimal silent audio buffer
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContext.createBuffer(1, audioContext.sampleRate * (duration / 1000), audioContext.sampleRate);
    
    // Convert buffer to base64 data URL (silent audio)
    const silentDataUrl = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    
    return new Howl({
      src: [silentDataUrl],
      volume: 0
    });
  }
  
  /**
   * Start playing background music
   * Requirements: 11.1
   */
  public playBackgroundMusic(): void {
    if (!this.isInitialized || this.isMuted || !this.backgroundMusic) return;
    
    try {
      if (!this.backgroundMusic.playing()) {
        this.backgroundMusic.play();
        console.log('Background music started');
      }
    } catch (error) {
      console.warn('Failed to play background music:', error);
    }
  }
  
  /**
   * Stop background music
   */
  public stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
      console.log('Background music stopped');
    }
  }
  
  /**
   * Play jump sound effect
   * Requirements: 11.2
   */
  public playJumpSound(): void {
    this.playSound('jump');
  }
  
  /**
   * Play damage sound effect
   * Requirements: 11.3
   */
  public playDamageSound(): void {
    this.playSound('damage');
  }
  
  /**
   * Play item collection sound effect
   * Requirements: 11.4
   */
  public playItemCollectSound(): void {
    this.playSound('item_collect');
  }
  
  /**
   * Play weapon-specific attack sound
   * Requirements: 11.5
   */
  public playWeaponSound(weaponType: 'katana' | 'laser' | 'baseball' | 'bazooka'): void {
    switch (weaponType) {
      case 'katana':
      case 'baseball':
        this.playSound('slash');
        break;
      case 'laser':
        this.playSound('laser');
        break;
      case 'bazooka':
        this.playSound('explosion');
        break;
      default:
        console.warn(`Unknown weapon type: ${weaponType}`);
    }
  }
  
  /**
   * Play a specific sound effect by key
   */
  private playSound(key: string): void {
    if (!this.isInitialized || this.isMuted) return;
    
    const sound = this.sounds.get(key);
    if (sound) {
      try {
        sound.play();
      } catch (error) {
        console.warn(`Failed to play sound '${key}':`, error);
      }
    } else {
      console.warn(`Sound '${key}' not found`);
    }
  }
  
  /**
   * Mute all audio
   */
  public mute(): void {
    this.isMuted = true;
    Howler.mute(true);
    console.log('Audio muted');
  }
  
  /**
   * Unmute all audio
   */
  public unmute(): void {
    this.isMuted = false;
    Howler.mute(false);
    console.log('Audio unmuted');
  }
  
  /**
   * Toggle mute state
   */
  public toggleMute(): void {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }
  
  /**
   * Set master volume (0.0 to 1.0)
   */
  public setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    Howler.volume(clampedVolume);
    console.log(`Master volume set to: ${clampedVolume}`);
  }
  
  /**
   * Set background music volume (0.0 to 1.0)
   */
  public setMusicVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundMusic) {
      this.backgroundMusic.volume(clampedVolume);
      console.log(`Music volume set to: ${clampedVolume}`);
    }
  }
  
  /**
   * Set sound effects volume (0.0 to 1.0)
   */
  public setSFXVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((sound) => {
      sound.volume(clampedVolume);
    });
    console.log(`SFX volume set to: ${clampedVolume}`);
  }
  
  /**
   * Get current mute state
   */
  public isMutedState(): boolean {
    return this.isMuted;
  }
  
  /**
   * Get initialization state
   */
  public isReady(): boolean {
    return this.isInitialized;
  }
  
  /**
   * Cleanup audio resources
   */
  public destroy(): void {
    // Stop and unload background music
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
      this.backgroundMusic.unload();
      this.backgroundMusic = null;
    }
    
    // Stop and unload all sound effects
    this.sounds.forEach((sound) => {
      sound.stop();
      sound.unload();
    });
    this.sounds.clear();
    
    this.isInitialized = false;
    console.log('AudioManager destroyed');
  }
  
  /**
   * Get debug information about loaded sounds
   */
  public getDebugInfo(): {
    isInitialized: boolean;
    isMuted: boolean;
    backgroundMusicLoaded: boolean;
    soundEffectsLoaded: string[];
    masterVolume: number;
  } {
    return {
      isInitialized: this.isInitialized,
      isMuted: this.isMuted,
      backgroundMusicLoaded: !!this.backgroundMusic,
      soundEffectsLoaded: Array.from(this.sounds.keys()),
      masterVolume: Howler.volume()
    };
  }
}

// Export singleton instance for easy access
export const audioManager = AudioManager.getInstance();