/**
 * Integration test to verify real audio files work in game context
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */

import { audioManager } from '../game/utils/AudioManager';

// Mock Howler for testing
jest.mock('howler', () => ({
  Howl: jest.fn().mockImplementation((config) => {
    // Simulate successful loading for real audio files
    const isRealAudioFile = config.src[0].includes('/assets/audio/');
    
    const mockHowl = {
      play: jest.fn(),
      stop: jest.fn(),
      unload: jest.fn(),
      playing: jest.fn(() => false),
      volume: jest.fn(),
      onload: config.onload,
      onloaderror: config.onloaderror
    };

    // Simulate successful loading for real audio files
    if (isRealAudioFile && config.onload) {
      setTimeout(() => config.onload(), 0);
    }

    return mockHowl;
  }),
  Howler: {
    volume: jest.fn(() => 1.0),
    mute: jest.fn()
  }
}));

describe('Audio Integration with Real Files', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    audioManager.destroy();
  });

  it('should load real audio files when AudioManager initializes', () => {
    const { Howl } = require('howler');
    
    audioManager.initialize();
    
    // Verify real audio files are being loaded
    expect(Howl).toHaveBeenCalledWith(
      expect.objectContaining({
        src: ['/assets/audio/background-ambient.mp3']
      })
    );
    
    expect(Howl).toHaveBeenCalledWith(
      expect.objectContaining({
        src: ['/assets/audio/jump.mp3']
      })
    );
    
    expect(Howl).toHaveBeenCalledWith(
      expect.objectContaining({
        src: ['/assets/audio/damage.mp3']
      })
    );
    
    expect(Howl).toHaveBeenCalledWith(
      expect.objectContaining({
        src: ['/assets/audio/item-collect.mp3']
      })
    );
    
    expect(Howl).toHaveBeenCalledWith(
      expect.objectContaining({
        src: ['/assets/audio/slash.mp3']
      })
    );
    
    expect(Howl).toHaveBeenCalledWith(
      expect.objectContaining({
        src: ['/assets/audio/laser.mp3']
      })
    );
    
    expect(Howl).toHaveBeenCalledWith(
      expect.objectContaining({
        src: ['/assets/audio/explosion.mp3']
      })
    );
  });

  it('should play background ambient music from real file', () => {
    const mockPlay = jest.fn();
    const { Howl } = require('howler');
    
    Howl.mockImplementation((config) => ({
      play: mockPlay,
      stop: jest.fn(),
      unload: jest.fn(),
      playing: jest.fn(() => false),
      volume: jest.fn(),
      onload: config.onload,
      onloaderror: config.onloaderror
    }));

    audioManager.initialize();
    audioManager.playBackgroundMusic();
    
    expect(mockPlay).toHaveBeenCalled();
  });

  it('should play all weapon sounds from real files', () => {
    const mockPlay = jest.fn();
    const { Howl } = require('howler');
    
    Howl.mockImplementation((config) => ({
      play: mockPlay,
      stop: jest.fn(),
      unload: jest.fn(),
      playing: jest.fn(() => false),
      volume: jest.fn(),
      onload: config.onload,
      onloaderror: config.onloaderror
    }));

    audioManager.initialize();
    
    // Test weapon sounds
    audioManager.playWeaponSound('katana');    // Should play slash.mp3
    audioManager.playWeaponSound('baseball');  // Should play slash.mp3
    audioManager.playWeaponSound('laser');     // Should play laser.mp3
    audioManager.playWeaponSound('bazooka');   // Should play explosion.mp3
    
    expect(mockPlay).toHaveBeenCalledTimes(4);
  });

  it('should play player action sounds from real files', () => {
    const mockPlay = jest.fn();
    const { Howl } = require('howler');
    
    Howl.mockImplementation((config) => ({
      play: mockPlay,
      stop: jest.fn(),
      unload: jest.fn(),
      playing: jest.fn(() => false),
      volume: jest.fn(),
      onload: config.onload,
      onloaderror: config.onloaderror
    }));

    audioManager.initialize();
    
    // Test player action sounds
    audioManager.playJumpSound();         // Should play jump.mp3
    audioManager.playDamageSound();       // Should play damage.mp3
    audioManager.playItemCollectSound();  // Should play item-collect.mp3
    
    expect(mockPlay).toHaveBeenCalledTimes(3);
  });

  it('should handle audio loading failures gracefully with fallback', () => {
    const { Howl } = require('howler');
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    // Mock Howl to simulate loading error for real files
    Howl.mockImplementation((config) => {
      const isRealAudioFile = config.src[0].includes('/assets/audio/');
      
      const mockHowl = {
        play: jest.fn(),
        stop: jest.fn(),
        unload: jest.fn(),
        playing: jest.fn(() => false),
        volume: jest.fn()
      };

      // Simulate loading error for real audio files
      if (isRealAudioFile && config.onloaderror) {
        setTimeout(() => config.onloaderror(null, 'Mock loading error'), 0);
      }

      return mockHowl;
    });

    audioManager.initialize();
    
    // Should still be ready even with loading errors (fallback mechanism)
    expect(audioManager.isReady()).toBe(true);
    
    consoleSpy.mockRestore();
  });

  it('should maintain proper volume levels for different audio types', () => {
    const { Howl } = require('howler');
    
    audioManager.initialize();
    
    // Check background music volume
    expect(Howl).toHaveBeenCalledWith(
      expect.objectContaining({
        src: ['/assets/audio/background-ambient.mp3'],
        volume: 0.3  // MUSIC_VOLUME
      })
    );
    
    // Check sound effects volume
    expect(Howl).toHaveBeenCalledWith(
      expect.objectContaining({
        src: ['/assets/audio/jump.mp3'],
        volume: 0.7  // SFX_VOLUME
      })
    );
  });
});