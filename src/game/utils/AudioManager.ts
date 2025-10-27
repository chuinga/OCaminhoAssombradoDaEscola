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
  
  // Volume settings (will be overridden by audio store)
  private musicVolume = 0.3;
  private sfxVolume = 0.7;
  
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
      console.log('Loading real background ambient music...');
      this.backgroundMusic = new Howl({
        src: ['/assets/audio/background-ambient.mp3'],
        loop: true,
        volume: this.musicVolume,
        autoplay: false,
        onload: () => {
          console.log('Background ambient music loaded successfully');
        },
        onloaderror: (_, error) => {
          console.warn('Failed to load background music, creating silent fallback:', error);
          // Create silent fallback if real audio fails
          this.backgroundMusic = new Howl({
            src: ['data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAAAQESsAEAEAAABAAgAZGF0YQAAAAA='],
            loop: true,
            volume: 0
          });
        }
      });
    } catch (error) {
      console.warn('Error loading background music:', error);
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
      { key: 'jump', src: '/assets/audio/jump.mp3', fallbackFreq: 800, fallbackDuration: 150 },
      { key: 'damage', src: '/assets/audio/damage.mp3', fallbackFreq: 200, fallbackDuration: 300 },
      { key: 'item_collect', src: '/assets/audio/item-collect.mp3', fallbackFreq: 1000, fallbackDuration: 200 },
      
      // Weapon sounds
      { key: 'slash', src: '/assets/audio/slash.mp3', fallbackFreq: 600, fallbackDuration: 100 },
      { key: 'laser', src: '/assets/audio/laser.mp3', fallbackFreq: 1200, fallbackDuration: 250 },
      { key: 'explosion', src: '/assets/audio/explosion.mp3', fallbackFreq: 100, fallbackDuration: 400 },
    ];
    
    soundEffects.forEach(({ key, src, fallbackFreq, fallbackDuration }) => {
      try {
        console.log(`Loading real audio file for: ${key}`);
        const sound = new Howl({
          src: [src],
          volume: this.sfxVolume,
          onload: () => {
            console.log(`Successfully loaded real audio file: ${key}`);
          },
          onloaderror: (_, error) => {
            console.warn(`Failed to load real audio file '${key}', creating fallback:`, error);
            // Replace with fallback sound if real audio fails
            const fallbackSound = this.createFallbackSound(fallbackFreq, fallbackDuration);
            this.sounds.set(key, fallbackSound);
          }
        });
        this.sounds.set(key, sound);
      } catch (error) {
        console.warn(`Error loading sound '${key}':`, error);
        // Create fallback sound as backup
        try {
          const fallbackSound = this.createFallbackSound(fallbackFreq, fallbackDuration);
          this.sounds.set(key, fallbackSound);
        } catch (fallbackError) {
          console.warn(`Failed to create fallback for '${key}':`, fallbackError);
          // Create silent fallback as last resort
          this.sounds.set(key, new Howl({
            src: ['data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAAAQESsAEAEAAABAAgAZGF0YQAAAAA='],
            volume: 0
          }));
        }
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
        // Trigger accessibility events
        this.triggerAccessibilityEvents('background_music');
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
    // Trigger accessibility events
    this.triggerAccessibilityEvents('jump');
  }
  
  /**
   * Play damage sound effect
   * Requirements: 11.3
   */
  public playDamageSound(): void {
    this.playSound('damage');
    // Trigger accessibility events
    this.triggerAccessibilityEvents('damage');
  }
  
  /**
   * Play item collection sound effect
   * Requirements: 11.4
   */
  public playItemCollectSound(): void {
    this.playSound('item_collect');
    // Trigger accessibility events
    this.triggerAccessibilityEvents('item_collect');
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
    // Trigger accessibility events
    this.triggerAccessibilityEvents('weapon_attack', weaponType);
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
    this.musicVolume = clampedVolume;
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
    this.sfxVolume = clampedVolume;
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
   * Trigger accessibility events for audio cues
   * Requirements: 18.2 - Visual indicators for audio events
   */
  private triggerAccessibilityEvents(
    type: 'jump' | 'damage' | 'item_collect' | 'weapon_attack' | 'background_music',
    weaponType?: string
  ): void {
    try {
      // Trigger audio subtitle event
      window.dispatchEvent(new CustomEvent('audioEvent', {
        detail: { type, weaponType }
      }));

      // Trigger visual indicator event
      window.dispatchEvent(new CustomEvent('visualIndicator', {
        detail: { 
          type, 
          weaponType,
          intensity: type === 'damage' ? 'high' : type === 'weapon_attack' ? 'medium' : 'low'
        }
      }));
    } catch (error) {
      console.warn('Failed to trigger accessibility events:', error);
    }
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
      masterVolume: typeof Howler.volume === 'function' ? Howler.volume() : 1.0
    };
  }
}

// Export singleton instance for easy access
export const audioManager = AudioManager.getInstance();