'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AudioControls } from '../../components/ui/AudioControls';
import { ControlCustomization } from '../../components/ui/ControlCustomization';
import { DisplaySettings } from '../../components/ui/DisplaySettings';
import { GameSettings } from '../../components/ui/GameSettings';
import { DifficultyPreview } from '../../components/ui/DifficultyPreview';
import { SettingsImportExport } from '../../components/ui/SettingsImportExport';
import { ArrowLeft, Settings, Volume2, Keyboard, Monitor, Gamepad2, Target, FileText } from 'lucide-react';
import { useAudioStore } from '../../store/audioStore';
import { useSettingsStore } from '../../store/settingsStore';

type SettingsTab = 'audio' | 'controls' | 'display' | 'game' | 'difficulty' | 'import-export';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { applySettings } = useAudioStore();
  const { game } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('audio');

  // Apply audio settings when component mounts
  useEffect(() => {
    applySettings();
  }, [applySettings]);

  const handleGoBack = () => {
    router.back();
  };

  const tabs = [
    { id: 'audio' as const, label: 'Áudio', icon: Volume2 },
    { id: 'controls' as const, label: 'Controlos', icon: Keyboard },
    { id: 'display' as const, label: 'Exibição', icon: Monitor },
    { id: 'game' as const, label: 'Jogo', icon: Gamepad2 },
    { id: 'difficulty' as const, label: 'Dificuldade', icon: Target },
    { id: 'import-export' as const, label: 'Gestão', icon: FileText }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'audio':
        return <AudioControls />;
      case 'controls':
        return <ControlCustomization />;
      case 'display':
        return <DisplaySettings />;
      case 'game':
        return <GameSettings />;
      case 'difficulty':
        return game.showDifficultyPreview ? (
          <DifficultyPreview />
        ) : (
          <div className="bg-gray-800/50 rounded-lg p-6 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-white mb-2">Prévia da Dificuldade Desativada</h3>
            <p className="text-gray-400 text-sm mb-4">
              Ative a opção "Mostrar Prévia da Dificuldade" nas configurações de jogo para ver os detalhes.
            </p>
            <button
              onClick={() => setActiveTab('game')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Ir para Configurações de Jogo
            </button>
          </div>
        );
      case 'import-export':
        return <SettingsImportExport />;
      default:
        return <AudioControls />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-700/50">
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

      <div className="flex flex-col lg:flex-row min-h-0 flex-1">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 bg-black/30 border-r border-gray-700/50">
          <div className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeTab === tab.id
                        ? 'bg-orange-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center border-t border-gray-700/50">
        <p className="text-sm text-gray-400">
          O Caminho Assombrado da Escola - Configurações Avançadas
        </p>
      </div>
    </div>
  );
}