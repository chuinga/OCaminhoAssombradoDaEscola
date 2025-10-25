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
    try {
      // For now, create a silent background music since audio file is placeholder
      // In production, you would load actual ambient audio files
      console.log('Creating silent background music (placeholder audio files detected)');
      this.backgroundMusic = new Howl({
        src: ['data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAAAQESsAEAEAAABAAgAZGF0YQAAAAA='],
        loop: true,
        volume: 0
      });
    } catch (error) {
      console.warn('Error creating background music:', error);
      // Create silent fallback
      this.backgroundMusic = new Howl({
        src: ['data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAAAQESsAEAEAAABAAgAZGF0YQAAAAA='],
        loop: true,
        volume: 0
      });
    }
  }
  
  /**
   * Load all sound effects
   * Requirements: 11.2, 11.3, 11.4, 11.5
   */
  private loadSoundEffects(): void {
    const soundEffects = [
      // Player action sounds
      { key: 'jump', fallbackFreq: 800, fallbackDuration: 150 },
      { key: 'damage', fallbackFreq: 200, fallbackDuration: 300 },
      { key: 'item_collect', fallbackFreq: 1000, fallbackDuration: 200 },
      
      // Weapon sounds
      { key: 'slash', fallbackFreq: 600, fallbackDuration: 100 },
      { key: 'laser', fallbackFreq: 1200, fallbackDuration: 250 },
      { key: 'explosion', fallbackFreq: 100, fallbackDuration: 400 },
    ];
    
    soundEffects.forEach(({ key, fallbackFreq, fallbackDuration }) => {
      try {
        // For now, directly create fallback sounds since audio files are placeholders
        // In production, you would first try to load actual audio files
        console.log(`Creating fallback beep sound for: ${key}`);
        const sound = this.createFallbackSound(fallbackFreq, fallbackDuration);
        this.sounds.set(key, sound);
      } catch (error) {
        console.warn(`Error creating sound '${key}':`, error);
        // Create silent fallback as last resort
        this.sounds.set(key, new Howl({
          src: ['data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAAAQESsAEAEAAABAAgAZGF0YQAAAAA='],
          volume: 0
        }));
      }
    });
  }
  
  /**
   * Create a simple beep sound as fallback when audio files fail to load
   */
  private createFallbackSound(frequency: number = 440, duration: number = 200): Howl {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const sampleRate = audioContext.sampleRate;
      const numSamples = Math.floor(sampleRate * (duration / 1000));
      const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
      const channelData = buffer.getChannelData(0);
      
      // Generate a simple sine wave
      for (let i = 0; i < numSamples; i++) {
        channelData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.1; // Low volume
      }
      
      // Convert buffer to WAV blob and create object URL
      const wavBlob = this.bufferToWav(buffer);
      const audioUrl = URL.createObjectURL(wavBlob);
      
      return new Howl({
        src: [audioUrl],
        volume: 0.1
      });
    } catch (error) {
      console.warn('Failed to create fallback sound:', error);
      // Return a completely silent sound as last resort
      return new Howl({
        src: ['data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAAAQESsAEAEAAABAAgAZGF0YQAAAAA='],
        volume: 0
      });
    }
  }
  
  /**
   * Convert AudioBuffer to WAV blob
   */
  private bufferToWav(buffer: AudioBuffer): Blob {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Convert float samples to 16-bit PCM
    const channelData = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
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
   * Load real audio files (for when actual audio assets are available)
   * This method can be called to replace fallback sounds with real audio
   */
  public loadRealAudioFiles(): void {
    console.log('Attempting to load real audio files...');
    
    const soundEffects = [
      { key: 'jump', src: ['/assets/audio/jump.mp3'] },
      { key: 'damage', src: ['/assets/audio/damage.mp3'] },
      { key: 'item_collect', src: ['/assets/audio/item-collect.mp3'] },
      { key: 'slash', src: ['/assets/audio/slash.mp3'] },
      { key: 'laser', src: ['/assets/audio/laser.mp3'] },
      { key: 'explosion', src: ['/assets/audio/explosion.mp3'] },
    ];
    
    soundEffects.forEach(({ key, src }) => {
      const sound = new Howl({
        src,
        volume: this.SFX_VOLUME,
        onload: () => {
          console.log(`Successfully loaded real audio file: ${key}`);
          // Replace the fallback sound with the real one
          const oldSound = this.sounds.get(key);
          if (oldSound) {
            oldSound.unload();
          }
          this.sounds.set(key, sound);
        },
        onloaderror: (_, error) => {
          console.warn(`Real audio file '${key}' still not available:`, error);
          // Keep using fallback sound
        }
      });
    });
    
    // Try to load real background music
    const backgroundMusic = new Howl({
      src: ['/assets/audio/background-ambient.mp3'],
      loop: true,
      volume: this.MUSIC_VOLUME,
      autoplay: false,
      onload: () => {
        console.log('Successfully loaded real background music');
        // Replace the silent background with real music
        if (this.backgroundMusic) {
          this.backgroundMusic.unload();
        }
        this.backgroundMusic = backgroundMusic;
      },
      onloaderror: (_, error) => {
        console.warn('Real background music still not available:', error);
        // Keep using silent background
      }
    });
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