import { AudioManager, audioManager } from '../AudioManager';

// Mock Howler.js
jest.mock('howler', () => ({
  Howl: jest.fn().mockImplementation(() => ({
    play: jest.fn(),
    stop: jest.fn(),
    unload: jest.fn(),
    volume: jest.fn(),
    playing: jest.fn().mockReturnValue(false)
  })),
  Howler: {
    volume: jest.fn(),
    mute: jest.fn()
  }
}));

describe('AudioManager', () => {
  beforeEach(() => {
    // Reset the singleton instance for each test
    (AudioManager as any).instance = undefined;
    jest.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AudioManager.getInstance();
      const instance2 = AudioManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should export a singleton instance', () => {
      expect(audioManager).toBeInstanceOf(AudioManager);
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully', () => {
      const manager = AudioManager.getInstance();
      expect(manager.isReady()).toBe(false);
      
      manager.initialize();
      expect(manager.isReady()).toBe(true);
    });

    it('should not initialize twice', () => {
      const manager = AudioManager.getInstance();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      manager.initialize();
      manager.initialize(); // Second call should be ignored
      
      expect(consoleSpy).toHaveBeenCalledWith('AudioManager initialized successfully');
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Background Music', () => {
    it('should play background music when initialized', () => {
      const manager = AudioManager.getInstance();
      manager.initialize();
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      manager.playBackgroundMusic();
      
      expect(consoleSpy).toHaveBeenCalledWith('Background music started');
      consoleSpy.mockRestore();
    });

    it('should stop background music', () => {
      const manager = AudioManager.getInstance();
      manager.initialize();
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      manager.stopBackgroundMusic();
      
      expect(consoleSpy).toHaveBeenCalledWith('Background music stopped');
      consoleSpy.mockRestore();
    });
  });

  describe('Sound Effects', () => {
    let manager: AudioManager;

    beforeEach(() => {
      manager = AudioManager.getInstance();
      manager.initialize();
    });

    it('should play jump sound', () => {
      expect(() => manager.playJumpSound()).not.toThrow();
    });

    it('should play damage sound', () => {
      expect(() => manager.playDamageSound()).not.toThrow();
    });

    it('should play item collect sound', () => {
      expect(() => manager.playItemCollectSound()).not.toThrow();
    });

    it('should play weapon sounds for different weapon types', () => {
      expect(() => manager.playWeaponSound('katana')).not.toThrow();
      expect(() => manager.playWeaponSound('laser')).not.toThrow();
      expect(() => manager.playWeaponSound('baseball')).not.toThrow();
      expect(() => manager.playWeaponSound('bazooka')).not.toThrow();
    });

    it('should handle unknown weapon types gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      manager.playWeaponSound('unknown' as any);
      
      expect(consoleSpy).toHaveBeenCalledWith('Unknown weapon type: unknown');
      consoleSpy.mockRestore();
    });
  });

  describe('Volume Control', () => {
    let manager: AudioManager;

    beforeEach(() => {
      manager = AudioManager.getInstance();
      manager.initialize();
    });

    it('should set master volume', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      manager.setVolume(0.5);
      
      expect(consoleSpy).toHaveBeenCalledWith('Master volume set to: 0.5');
      consoleSpy.mockRestore();
    });

    it('should clamp volume values', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      manager.setVolume(-0.5); // Should clamp to 0
      expect(consoleSpy).toHaveBeenCalledWith('Master volume set to: 0');
      
      manager.setVolume(1.5); // Should clamp to 1
      expect(consoleSpy).toHaveBeenCalledWith('Master volume set to: 1');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Mute Control', () => {
    let manager: AudioManager;

    beforeEach(() => {
      manager = AudioManager.getInstance();
      manager.initialize();
    });

    it('should mute and unmute audio', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      expect(manager.isMutedState()).toBe(false);
      
      manager.mute();
      expect(manager.isMutedState()).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Audio muted');
      
      manager.unmute();
      expect(manager.isMutedState()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Audio unmuted');
      
      consoleSpy.mockRestore();
    });

    it('should toggle mute state', () => {
      expect(manager.isMutedState()).toBe(false);
      
      manager.toggleMute();
      expect(manager.isMutedState()).toBe(true);
      
      manager.toggleMute();
      expect(manager.isMutedState()).toBe(false);
    });
  });

  describe('Debug Information', () => {
    it('should provide debug information', () => {
      const manager = AudioManager.getInstance();
      manager.initialize();
      
      const debugInfo = manager.getDebugInfo();
      
      expect(debugInfo).toHaveProperty('isInitialized', true);
      expect(debugInfo).toHaveProperty('isMuted', false);
      expect(debugInfo).toHaveProperty('backgroundMusicLoaded', true);
      expect(debugInfo).toHaveProperty('soundEffectsLoaded');
      expect(debugInfo).toHaveProperty('masterVolume');
      expect(Array.isArray(debugInfo.soundEffectsLoaded)).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should destroy and cleanup resources', () => {
      const manager = AudioManager.getInstance();
      manager.initialize();
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      manager.destroy();
      
      expect(manager.isReady()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('AudioManager destroyed');
      
      consoleSpy.mockRestore();
    });
  });
});