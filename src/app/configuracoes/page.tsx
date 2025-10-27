'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AudioControls } from '../../components/ui/AudioControls';
import { ArrowLeft, Settings } from 'lucide-react';
import { useAudioStore } from '../../store/audioStore';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { applySettings } = useAudioStore();

  // Apply audio settings when component mounts
  useEffect(() => {
    applySettings();
  }, [applySettings]);

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Voltar</span>
        </button>
        
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-orange-400" />
          <h1 className="text-xl md:text-2xl font-bold text-white">Configurações</h1>
        </div>
        
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20">
            <AudioControls />
            
            {/* Additional Settings Info */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Informações</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• As configurações são guardadas automaticamente</li>
                <li>• Use Esc durante o jogo para aceder aos controlos rápidos</li>
                <li>• O volume geral afeta toda a aplicação</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center">
        <p className="text-sm text-gray-400">
          O Caminho Assombrado da Escola - Configurações de Áudio
        </p>
      </div>
    </div>
  );
}