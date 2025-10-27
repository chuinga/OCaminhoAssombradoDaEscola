'use client';

import React, { useState } from 'react';
import { AccessibilitySettings } from './AccessibilitySettings';
import { SimplifiedControls } from './SimplifiedControls';
import { AudioSubtitles, useAudioSubtitles } from './AudioSubtitles';
import { VisualAudioIndicators, useVisualAudioIndicators } from './VisualAudioIndicators';
import { ColorblindFriendlyUI, useColorblindFriendly } from './ColorblindFriendlyUI';
import { useSettingsStore } from '@/store/settingsStore';
import { 
  Accessibility, 
  Eye, 
  Hand, 
  Volume2, 
  Palette, 
  Settings,
  TestTube,
  Info
} from 'lucide-react';

interface ComprehensiveAccessibilitySettingsProps {
  className?: string;
}

export const ComprehensiveAccessibilitySettings: React.FC<ComprehensiveAccessibilitySettingsProps> = ({
  className = ''
}) => {
  const { display } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'visual' | 'motor' | 'audio' | 'test'>('visual');
  const { toggleSubtitles } = useAudioSubtitles();
  const { toggleVisualIndicators } = useVisualAudioIndicators();
  const { isEnabled: colorblindUIEnabled } = useColorblindFriendly();

  // Test functions for accessibility features
  const testAudioSubtitles = () => {
    const events = ['jump', 'damage', 'item_collect', 'weapon_attack'];
    const weapons = ['katana', 'laser', 'baseball', 'bazooka'];
    
    events.forEach((event, index) => {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('audioEvent', {
          detail: { 
            type: event, 
            weaponType: event === 'weapon_attack' ? weapons[index % weapons.length] : undefined 
          }
        }));
      }, index * 1000);
    });
  };

  const testVisualIndicators = () => {
    const indicators = [
      { type: 'jump', intensity: 'low' },
      { type: 'damage', intensity: 'high' },
      { type: 'item_collect', intensity: 'medium' },
      { type: 'weapon_attack', intensity: 'medium', weaponType: 'bazooka' },
      { type: 'low_health', intensity: 'high' }
    ];

    indicators.forEach((indicator, index) => {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('visualIndicator', {
          detail: {
            ...indicator,
            position: { 
              x: 20 + (index * 15), 
              y: 30 + (index * 10) 
            }
          }
        }));
      }, index * 800);
    });
  };

  const tabs = [
    {
      id: 'visual' as const,
      name: 'Visual',
      icon: <Eye className="w-4 h-4" />,
      description: 'Configurações visuais e de contraste'
    },
    {
      id: 'motor' as const,
      name: 'Motor',
      icon: <Hand className="w-4 h-4" />,
      description: 'Controlos simplificados e adaptados'
    },
    {
      id: 'audio' as const,
      name: 'Áudio',
      icon: <Volume2 className="w-4 h-4" />,
      description: 'Legendas e indicadores visuais de áudio'
    },
    {
      id: 'test' as const,
      name: 'Teste',
      icon: <TestTube className="w-4 h-4" />,
      description: 'Testar funcionalidades de acessibilidade'
    }
  ];

  return (
    <ColorblindFriendlyUI className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-orange-400 mb-2 flex items-center justify-center gap-2">
            <Accessibility className="w-6 h-6" />
            Configurações de Acessibilidade
          </h2>
          <p className="text-gray-300">
            Personalize o jogo para uma experiência mais acessível e confortável
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 p-1 bg-gray-800/50 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 min-w-[120px] px-4 py-3 rounded-lg transition-all
                flex items-center justify-center gap-2 text-sm font-medium
                ${activeTab === tab.id
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }
              `}
              aria-selected={activeTab === tab.id}
              role="tab"
              title={tab.description}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'visual' && (
            <div className="space-y-6">
              <AccessibilitySettings showLabels={false} />
              
              {/* Visual accessibility info */}
              <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
                <h4 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Sobre as Configurações Visuais
                </h4>
                <ul className="text-sm text-blue-200 space-y-1">
                  <li>• <strong>Alto Contraste:</strong> Melhora a visibilidade de texto e elementos</li>
                  <li>• <strong>Reduzir Movimento:</strong> Reduz animações que podem causar desconforto</li>
                  <li>• <strong>Filtros de Daltonismo:</strong> Ajusta cores para diferentes tipos de daltonismo</li>
                  <li>• <strong>Interface Amigável:</strong> Adiciona símbolos e padrões além de cores</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'motor' && (
            <div className="space-y-6">
              <SimplifiedControls />
              
              {/* Motor accessibility info */}
              <div className="bg-green-900/30 rounded-lg p-4 border border-green-500/30">
                <h4 className="text-green-300 font-medium mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Sobre os Controlos Adaptados
                </h4>
                <ul className="text-sm text-green-200 space-y-1">
                  <li>• <strong>Uma Mão:</strong> Todos os controlos numa área pequena do teclado</li>
                  <li>• <strong>Controlos Mínimos:</strong> Apenas 3-4 teclas essenciais</li>
                  <li>• <strong>Teclas Grandes:</strong> Usa teclas maiores e mais fáceis de encontrar</li>
                  <li>• Todos os esquemas mantêm a funcionalidade completa do jogo</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-6">
              {/* Audio accessibility controls */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Acessibilidade de Áudio
                </h3>

                <div className="space-y-4">
                  {/* Audio Subtitles Control */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">
                        Legendas de Áudio
                      </label>
                      <p className="text-sm text-gray-400">
                        Mostra texto descritivo para eventos sonoros do jogo
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSubtitles(!display.audioSubtitles)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-orange-500/50 ${
                        display.audioSubtitles ? 'bg-orange-600' : 'bg-gray-600'
                      }`}
                      role="switch"
                      aria-checked={display.audioSubtitles}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          display.audioSubtitles ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Visual Indicators Control */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">
                        Indicadores Visuais
                      </label>
                      <p className="text-sm text-gray-400">
                        Efeitos visuais que representam sons importantes
                      </p>
                    </div>
                    <button
                      onClick={() => toggleVisualIndicators(!display.visualAudioIndicators)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-orange-500/50 ${
                        display.visualAudioIndicators ? 'bg-orange-600' : 'bg-gray-600'
                      }`}
                      role="switch"
                      aria-checked={display.visualAudioIndicators}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          display.visualAudioIndicators ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Audio accessibility info */}
              <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
                <h4 className="text-purple-300 font-medium mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Sobre a Acessibilidade de Áudio
                </h4>
                <ul className="text-sm text-purple-200 space-y-1">
                  <li>• <strong>Legendas:</strong> Texto que aparece quando há eventos sonoros</li>
                  <li>• <strong>Indicadores Visuais:</strong> Efeitos de luz e cor para sons importantes</li>
                  <li>• <strong>Prioridade:</strong> Eventos importantes (dano) têm indicadores mais visíveis</li>
                  <li>• Ideal para utilizadores com deficiência auditiva</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  Testar Funcionalidades
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Test Audio Subtitles */}
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Legendas de Áudio</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Testa a exibição de legendas para diferentes eventos sonoros
                    </p>
                    <button
                      onClick={testAudioSubtitles}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                      disabled={!display.audioSubtitles}
                    >
                      {display.audioSubtitles ? 'Testar Legendas' : 'Ative as Legendas Primeiro'}
                    </button>
                  </div>

                  {/* Test Visual Indicators */}
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Indicadores Visuais</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Testa os efeitos visuais para eventos de áudio
                    </p>
                    <button
                      onClick={testVisualIndicators}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                      disabled={!display.visualAudioIndicators}
                    >
                      {display.visualAudioIndicators ? 'Testar Indicadores' : 'Ative os Indicadores Primeiro'}
                    </button>
                  </div>
                </div>

                {/* Current Settings Summary */}
                <div className="mt-6 bg-gray-700/30 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Configurações Atuais</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Alto Contraste:</span>
                      <span className={display.highContrast ? 'text-green-400' : 'text-red-400'}>
                        {display.highContrast ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Reduzir Movimento:</span>
                      <span className={display.reducedMotion ? 'text-green-400' : 'text-red-400'}>
                        {display.reducedMotion ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Filtro de Daltonismo:</span>
                      <span className="text-blue-400">
                        {display.colorBlindMode === 'none' ? 'Nenhum' : display.colorBlindMode}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Legendas de Áudio:</span>
                      <span className={display.audioSubtitles ? 'text-green-400' : 'text-red-400'}>
                        {display.audioSubtitles ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Indicadores Visuais:</span>
                      <span className={display.visualAudioIndicators ? 'text-green-400' : 'text-red-400'}>
                        {display.visualAudioIndicators ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Interface Amigável:</span>
                      <span className={colorblindUIEnabled ? 'text-green-400' : 'text-red-400'}>
                        {colorblindUIEnabled ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Audio Subtitles Component */}
        {display.audioSubtitles && <AudioSubtitles />}
        
        {/* Visual Audio Indicators Component */}
        {display.visualAudioIndicators && <VisualAudioIndicators />}
      </div>
    </ColorblindFriendlyUI>
  );
};