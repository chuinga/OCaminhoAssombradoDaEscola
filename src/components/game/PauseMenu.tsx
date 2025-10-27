'use client';

import React from 'react';
import { Play, Home, Settings, Volume2, Keyboard } from 'lucide-react';
import { AudioControls } from '../ui/AudioControls';
import { KeyboardHelp } from './KeyboardHelp';
import { useRouter } from 'next/navigation';

interface PauseMenuProps {
  isVisible: boolean;
  onResume: () => void;
  onQuit: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  isVisible,
  onResume,
  onQuit
}) => {
  const router = useRouter();
  const [showAudioSettings, setShowAudioSettings] = React.useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = React.useState(false);

  // Handle keyboard shortcuts for pause menu
  React.useEffect(() => {
    if (!isVisible || showAudioSettings || showKeyboardHelp) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'escape':
          onResume();
          event.preventDefault();
          break;
        case 'a':
          setShowAudioSettings(true);
          event.preventDefault();
          break;
        case 'k':
          setShowKeyboardHelp(true);
          event.preventDefault();
          break;
        case 's':
          handleSettings();
          event.preventDefault();
          break;
        case 'q':
          handleQuit();
          event.preventDefault();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, showAudioSettings, showKeyboardHelp, onResume]);

  if (!isVisible) return null;

  const handleQuit = () => {
    onQuit();
    router.push('/');
  };

  const handleSettings = () => {
    router.push('/configuracoes');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30 max-w-md w-full mx-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/20 rounded-full mb-4">
            <div className="w-8 h-8 bg-orange-400 rounded-sm"></div>
          </div>
          <h2 className="text-2xl font-bold text-orange-400 mb-2">Jogo Pausado</h2>
          <p className="text-gray-300 text-sm">Pressione Esc para continuar ou escolha uma opção</p>
        </div>

        {!showAudioSettings ? (
          <div className="space-y-4">
            {/* Quick Audio Controls */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <AudioControls compact={true} showLabels={false} />
            </div>

            {/* Menu Buttons */}
            <div className="space-y-3">
              <button
                onClick={onResume}
                className="w-full flex items-center justify-between px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium group"
              >
                <div className="flex items-center gap-3">
                  <Play className="w-5 h-5" />
                  Continuar
                </div>
                <kbd className="px-2 py-1 bg-green-700/50 rounded text-xs opacity-70 group-hover:opacity-100">
                  Esc
                </kbd>
              </button>

              <button
                onClick={() => setShowAudioSettings(!showAudioSettings)}
                className="w-full flex items-center justify-between px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium group"
              >
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5" />
                  Controlos de Áudio
                </div>
                <kbd className="px-2 py-1 bg-blue-700/50 rounded text-xs opacity-70 group-hover:opacity-100">
                  A
                </kbd>
              </button>

              <button
                onClick={() => setShowKeyboardHelp(true)}
                className="w-full flex items-center justify-between px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium group"
              >
                <div className="flex items-center gap-3">
                  <Keyboard className="w-5 h-5" />
                  Controlos do Teclado
                </div>
                <kbd className="px-2 py-1 bg-purple-700/50 rounded text-xs opacity-70 group-hover:opacity-100">
                  K
                </kbd>
              </button>

              <button
                onClick={handleSettings}
                className="w-full flex items-center justify-between px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium group"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5" />
                  Configurações
                </div>
                <kbd className="px-2 py-1 bg-gray-700/50 rounded text-xs opacity-70 group-hover:opacity-100">
                  S
                </kbd>
              </button>

              <button
                onClick={handleQuit}
                className="w-full flex items-center justify-between px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium group"
              >
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5" />
                  Sair para Menu
                </div>
                <kbd className="px-2 py-1 bg-red-700/50 rounded text-xs opacity-70 group-hover:opacity-100">
                  Q
                </kbd>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-orange-400">Controlos de Áudio</h3>
              <button
                onClick={() => setShowAudioSettings(false)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
              >
                Voltar
              </button>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              <AudioControls showLabels={false} />
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-700 text-center">
          <p className="text-xs text-gray-400">
            Pressione Esc para fechar este menu
          </p>
        </div>
      </div>

      {/* Keyboard Help Modal */}
      <KeyboardHelp
        isVisible={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
      />
    </div>
  );
};