'use client';

import React from 'react';
import { useAudioStore } from '../../store/audioStore';
import { Volume2, VolumeX, Music, Volume1 } from 'lucide-react';

interface AudioControlsProps {
  className?: string;
  showLabels?: boolean;
  compact?: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  className = '',
  showLabels = true,
  compact = false
}) => {
  const {
    masterVolume,
    musicVolume,
    sfxVolume,
    isMuted,
    isMusicMuted,
    isSfxMuted,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,
    toggleMute,
    toggleMusicMute,
    toggleSfxMute,
    resetToDefaults
  } = useAudioStore();

  const handleMasterVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMasterVolume(parseFloat(e.target.value));
  };

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMusicVolume(parseFloat(e.target.value));
  };

  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSfxVolume(parseFloat(e.target.value));
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={toggleMute}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-red-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-green-400" />
          )}
        </button>
        
        <div className="flex items-center gap-1">
          <Volume1 className="w-4 h-4 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={masterVolume}
            onChange={handleMasterVolumeChange}
            className="w-16 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            disabled={isMuted}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showLabels && (
        <h3 className="text-lg font-bold text-orange-400 mb-4">Controlos de Áudio</h3>
      )}
      
      {/* Master Volume Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-white font-medium">Volume Geral</label>
          <button
            onClick={toggleMute}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-red-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-green-400" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 w-8">0%</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={masterVolume}
            onChange={handleMasterVolumeChange}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            disabled={isMuted}
          />
          <span className="text-sm text-gray-400 w-12">100%</span>
          <span className="text-sm text-white w-12">{Math.round(masterVolume * 100)}%</span>
        </div>
      </div>

      {/* Music Volume Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-white font-medium">Música</label>
          <button
            onClick={toggleMusicMute}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
            title={isMusicMuted ? 'Unmute Music' : 'Mute Music'}
          >
            {isMusicMuted ? (
              <VolumeX className="w-5 h-5 text-red-400" />
            ) : (
              <Music className="w-5 h-5 text-blue-400" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 w-8">0%</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={musicVolume}
            onChange={handleMusicVolumeChange}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            disabled={isMuted || isMusicMuted}
          />
          <span className="text-sm text-gray-400 w-12">100%</span>
          <span className="text-sm text-white w-12">{Math.round(musicVolume * 100)}%</span>
        </div>
      </div>

      {/* SFX Volume Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-white font-medium">Efeitos Sonoros</label>
          <button
            onClick={toggleSfxMute}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
            title={isSfxMuted ? 'Unmute SFX' : 'Mute SFX'}
          >
            {isSfxMuted ? (
              <VolumeX className="w-5 h-5 text-red-400" />
            ) : (
              <Volume1 className="w-5 h-5 text-yellow-400" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 w-8">0%</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={sfxVolume}
            onChange={handleSfxVolumeChange}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            disabled={isMuted || isSfxMuted}
          />
          <span className="text-sm text-gray-400 w-12">100%</span>
          <span className="text-sm text-white w-12">{Math.round(sfxVolume * 100)}%</span>
        </div>
      </div>

      {/* Reset Button */}
      <div className="pt-2">
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
        >
          Restaurar Padrões
        </button>
      </div>
    </div>
  );
};