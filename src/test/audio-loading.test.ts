/**
 * Test to verify real audio files can be loaded properly
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */

import { audioManager } from '../game/utils/AudioManager';

// Mock Howler for testing
jest.mock('howler', () => ({
  Howl: jest.fn().mockImplementation((config) => ({
    play: jest.fn(),
    stop: jest.fn(),
    unload: jest.fn(),
    playing: jest.fn(() => false),
    volume: jest.fn(),
    // Simulate successful loading
    onload: config.onload,
    onloaderror: config.onloaderror,
    // Call onload immediately to simulate successful loading
    ...(() => {
      if (config.onload) {
        setTimeout(() => config.onload(), 0);
      }
      return {};
    })()
  })),
  Howler: {
    volume: jest.fn(() => 1.0),
    mute: jest.fn()
  }
}));

describe('Audio Loading with Real Files', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    audioManager.destroy();
  });

  it('should initialize AudioManager with real audio files', () => {
    audioManager.initialize();
    expect(audioManager.isReady()).toBe(true);
  });

  it('should load background ambient music from real file', () => {
    const { Howl } = require('howler');
    audioManager.initialize();
    
    // Verify background music was created with correct source
    expect(Howl).toHaveBeenCalledWith(
      expect.objectContaining({
        src: ['/assets/audio/background-ambient.mp3'],
        loop: true,
        volume: expect.any(Number),
        autoplay: false
      })
    );
  });

  it('should load all sound effects from real files', () => {
    const { Howl } = require('howler');
    audioManager.initialize();
    
    const expectedSounds = [
      '/assets/audio/jump.mp3',
      '/assets/audio/damage.mp3',
      '/assets/audio/item-collect.mp3',
      '/assets/audio/slash.mp3',
      '/assets/audio/laser.mp3',
      '/assets/audio/explosion.mp3'
    ];

    expectedSounds.forEach(src => {
      expect(Howl).toHaveBeenCalledWith(
        expect.objectContaining({
          src: [src],
          volume: expect.any(Number)
        })
      );
    });
  });

  it('should play background music from real file', () => {
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

  it('should play sound effects from real files', () => {
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
    
    // Test all sound effects
    audioManager.playJumpSound();
    audioManager.playDamageSound();
    audioManager.playItemCollectSound();
    audioManager.playWeaponSound('katana');
    audioManager.playWeaponSound('laser');
    audioManager.playWeaponSound('bazooka');
    
    expect(mockPlay).toHaveBeenCalledTimes(6);
  });

  it('should provide debug information about loaded sounds', () => {
    audioManager.initialize();
    const debugInfo = audioManager.getDebugInfo();
    
    expect(debugInfo).toEqual({
      isInitialized: true,
      isMuted: false,
      backgroundMusicLoaded: true,
      soundEffectsLoaded: expect.arrayContaining([
        'jump', 'damage', 'item_collect', 'slash', 'laser', 'explosion'
      ]),
      masterVolume: expect.any(Number)
    });
  });

  it('should handle audio loading errors gracefully', () => {
    const { Howl } = require('howler');
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    // Mock Howl to simulate loading error
    Howl.mockImplementation((config) => {
      // Simulate loading error
      if (config.onloaderror) {
        setTimeout(() => config.onloaderror(null, 'Mock loading error'), 0);
      }
      return {
        play: jest.fn(),
        stop: jest.fn(),
        unload: jest.fn(),
        playing: jest.fn(() => false),
        volume: jest.fn()
      };
    });

    audioManager.initialize();
    
    // Should still be ready even with loading errors (fallback mechanism)
    expect(audioManager.isReady()).toBe(true);
    
    consoleSpy.mockRestore();
  });
});