/**
 * Test audio store functionality
 * Requirements: 11.1
 */

import { useAudioStore } from '../store/audioStore';
import { renderHook, act } from '@testing-library/react';

// Mock the AudioManager
jest.mock('../game/utils/AudioManager', () => ({
  audioManager: {
    setVolume: jest.fn(),
    setMusicVolume: jest.fn(),
    setSFXVolume: jest.fn(),
    mute: jest.fn(),
    unmute: jest.fn(),
  }
}));

describe('Audio Store', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAudioStore());
    
    expect(result.current.masterVolume).toBe(1.0);
    expect(result.current.musicVolume).toBe(0.3);
    expect(result.current.sfxVolume).toBe(0.7);
    expect(result.current.isMuted).toBe(false);
    expect(result.current.isMusicMuted).toBe(false);
    expect(result.current.isSfxMuted).toBe(false);
  });

  it('should update master volume', () => {
    const { result } = renderHook(() => useAudioStore());
    
    act(() => {
      result.current.setMasterVolume(0.5);
    });
    
    expect(result.current.masterVolume).toBe(0.5);
  });

  it('should clamp volume values between 0 and 1', () => {
    const { result } = renderHook(() => useAudioStore());
    
    act(() => {
      result.current.setMasterVolume(1.5); // Above max
    });
    expect(result.current.masterVolume).toBe(1.0);
    
    act(() => {
      result.current.setMasterVolume(-0.5); // Below min
    });
    expect(result.current.masterVolume).toBe(0.0);
  });

  it('should toggle mute state', () => {
    const { result } = renderHook(() => useAudioStore());
    
    expect(result.current.isMuted).toBe(false);
    
    act(() => {
      result.current.toggleMute();
    });
    
    expect(result.current.isMuted).toBe(true);
    
    act(() => {
      result.current.toggleMute();
    });
    
    expect(result.current.isMuted).toBe(false);
  });

  it('should toggle music mute state', () => {
    const { result } = renderHook(() => useAudioStore());
    
    expect(result.current.isMusicMuted).toBe(false);
    
    act(() => {
      result.current.toggleMusicMute();
    });
    
    expect(result.current.isMusicMuted).toBe(true);
  });

  it('should toggle SFX mute state', () => {
    const { result } = renderHook(() => useAudioStore());
    
    expect(result.current.isSfxMuted).toBe(false);
    
    act(() => {
      result.current.toggleSfxMute();
    });
    
    expect(result.current.isSfxMuted).toBe(true);
  });

  it('should reset to default values', () => {
    const { result } = renderHook(() => useAudioStore());
    
    // Change some values
    act(() => {
      result.current.setMasterVolume(0.5);
      result.current.setMusicVolume(0.8);
      result.current.toggleMute();
    });
    
    // Reset to defaults
    act(() => {
      result.current.resetToDefaults();
    });
    
    expect(result.current.masterVolume).toBe(1.0);
    expect(result.current.musicVolume).toBe(0.3);
    expect(result.current.sfxVolume).toBe(0.7);
    expect(result.current.isMuted).toBe(false);
    expect(result.current.isMusicMuted).toBe(false);
    expect(result.current.isSfxMuted).toBe(false);
  });

  it('should persist settings in localStorage', () => {
    const { result } = renderHook(() => useAudioStore());
    
    act(() => {
      result.current.setMasterVolume(0.8);
      result.current.setMusicVolume(0.5);
    });
    
    // Check that localStorage was updated
    const storedData = localStorage.getItem('caminho-assombrado-audio-settings');
    expect(storedData).toBeTruthy();
    
    if (storedData) {
      const parsed = JSON.parse(storedData);
      expect(parsed.state.masterVolume).toBe(0.8);
      expect(parsed.state.musicVolume).toBe(0.5);
    }
  });
});