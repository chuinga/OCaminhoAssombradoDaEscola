import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { audioManager } from '../game/utils/AudioManager';

interface AudioSettings {
  // Volume settings (0.0 to 1.0)
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  
  // Mute states
  isMuted: boolean;
  isMusicMuted: boolean;
  isSfxMuted: boolean;
  
  // Actions
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleMusicMute: () => void;
  toggleSfxMute: () => void;
  resetToDefaults: () => void;
  applySettings: () => void;
}

const defaultSettings = {
  masterVolume: 1.0,
  musicVolume: 0.3,
  sfxVolume: 0.7,
  isMuted: false,
  isMusicMuted: false,
  isSfxMuted: false,
};

export const useAudioStore = create<AudioSettings>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      
      setMasterVolume: (volume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        set({ masterVolume: clampedVolume });
        get().applySettings();
      },
      
      setMusicVolume: (volume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        set({ musicVolume: clampedVolume });
        get().applySettings();
      },
      
      setSfxVolume: (volume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        set({ sfxVolume: clampedVolume });
        get().applySettings();
      },
      
      toggleMute: () => {
        const currentState = get();
        const newMutedState = !currentState.isMuted;
        set({ isMuted: newMutedState });
        
        if (newMutedState) {
          audioManager.mute();
        } else {
          audioManager.unmute();
        }
      },
      
      toggleMusicMute: () => {
        const currentState = get();
        const newMutedState = !currentState.isMusicMuted;
        set({ isMusicMuted: newMutedState });
        get().applySettings();
      },
      
      toggleSfxMute: () => {
        const currentState = get();
        const newMutedState = !currentState.isSfxMuted;
        set({ isSfxMuted: newMutedState });
        get().applySettings();
      },
      
      resetToDefaults: () => {
        set(defaultSettings);
        get().applySettings();
      },
      
      applySettings: () => {
        const settings = get();
        
        // Apply master volume
        if (!settings.isMuted) {
          audioManager.setVolume(settings.masterVolume);
        }
        
        // Apply music volume
        const effectiveMusicVolume = settings.isMusicMuted ? 0 : settings.musicVolume;
        audioManager.setMusicVolume(effectiveMusicVolume);
        
        // Apply SFX volume
        const effectiveSfxVolume = settings.isSfxMuted ? 0 : settings.sfxVolume;
        audioManager.setSFXVolume(effectiveSfxVolume);
      },
    }),
    {
      name: 'caminho-assombrado-audio-settings',
      version: 1,
    }
  )
);