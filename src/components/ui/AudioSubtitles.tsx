'use client';

import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

interface AudioEvent {
  id: string;
  type: 'jump' | 'damage' | 'item_collect' | 'weapon_attack' | 'background_music';
  message: string;
  timestamp: number;
  duration: number;
  priority: 'low' | 'medium' | 'high';
}

interface AudioSubtitlesProps {
  className?: string;
}

export const AudioSubtitles: React.FC<AudioSubtitlesProps> = ({ className = '' }) => {
  const { display } = useSettingsStore();
  const [activeEvents, setActiveEvents] = useState<AudioEvent[]>([]);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    // Listen for audio events from the game
    const handleAudioEvent = (event: CustomEvent<{
      type: AudioEvent['type'];
      weaponType?: string;
    }>) => {
      if (!showSubtitles) return;

      const { type, weaponType } = event.detail;
      const timestamp = Date.now();
      const id = `${type}-${timestamp}`;

      let message = '';
      let duration = 2000;
      let priority: AudioEvent['priority'] = 'medium';

      switch (type) {
        case 'jump':
          message = '🦘 Salto';
          duration = 1000;
          priority = 'low';
          break;
        case 'damage':
          message = '💥 Dano recebido';
          duration = 2000;
          priority = 'high';
          break;
        case 'item_collect':
          message = '✨ Item coletado';
          duration = 1500;
          priority = 'medium';
          break;
        case 'weapon_attack':
          const weaponMessages = {
            katana: '⚔️ Katana - Corte',
            laser: '🔫 Laser - Disparo',
            baseball: '⚾ Taco - Pancada',
            bazooka: '🚀 Bazuca - Explosão'
          };
          message = weaponMessages[weaponType as keyof typeof weaponMessages] || '⚔️ Ataque';
          duration = 1500;
          priority = 'medium';
          break;
        case 'background_music':
          message = '🎵 Música ambiente';
          duration = 3000;
          priority = 'low';
          break;
        default:
          return;
      }

      const audioEvent: AudioEvent = {
        id,
        type,
        message,
        timestamp,
        duration,
        priority
      };

      setActiveEvents(prev => {
        // Remove old events of the same type to prevent spam
        const filtered = prev.filter(e => e.type !== type);
        return [...filtered, audioEvent].slice(-3); // Keep max 3 events
      });

      // Remove event after duration
      setTimeout(() => {
        setActiveEvents(prev => prev.filter(e => e.id !== id));
      }, duration);
    };

    // Listen for subtitle toggle events
    const handleSubtitleToggle = (event: CustomEvent<{ enabled: boolean }>) => {
      setShowSubtitles(event.detail.enabled);
    };

    window.addEventListener('audioEvent', handleAudioEvent as EventListener);
    window.addEventListener('toggleSubtitles', handleSubtitleToggle as EventListener);

    return () => {
      window.removeEventListener('audioEvent', handleAudioEvent as EventListener);
      window.removeEventListener('toggleSubtitles', handleSubtitleToggle as EventListener);
    };
  }, [showSubtitles]);

  if (!isClient || !showSubtitles || activeEvents.length === 0) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-20 left-4 right-4 z-30 pointer-events-none ${className}`}
      role="log"
      aria-live="polite"
      aria-label="Legendas de áudio"
    >
      <div className="space-y-2">
        {activeEvents
          .sort((a, b) => {
            // Sort by priority (high first) then by timestamp (newest first)
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            return priorityDiff !== 0 ? priorityDiff : b.timestamp - a.timestamp;
          })
          .map((event) => (
            <div
              key={event.id}
              className={`
                inline-block px-3 py-2 rounded-lg text-sm font-medium
                backdrop-blur-sm border transition-all duration-300
                ${event.priority === 'high' 
                  ? 'bg-red-900/80 border-red-500/50 text-red-100' 
                  : event.priority === 'medium'
                  ? 'bg-orange-900/80 border-orange-500/50 text-orange-100'
                  : 'bg-gray-900/80 border-gray-500/50 text-gray-100'
                }
                animate-in slide-in-from-bottom-2 fade-in duration-300
              `}
              style={{
                animation: `fadeInUp 0.3s ease-out, fadeOut 0.3s ease-in ${event.duration - 300}ms forwards`
              }}
            >
              {event.message}
            </div>
          ))}
      </div>
    </div>
  );
};

// Hook for managing audio subtitles
export const useAudioSubtitles = () => {
  const triggerAudioEvent = (
    type: AudioEvent['type'], 
    weaponType?: string
  ) => {
    window.dispatchEvent(new CustomEvent('audioEvent', {
      detail: { type, weaponType }
    }));
  };

  const toggleSubtitles = (enabled: boolean) => {
    window.dispatchEvent(new CustomEvent('toggleSubtitles', {
      detail: { enabled }
    }));
  };

  return {
    triggerAudioEvent,
    toggleSubtitles
  };
};