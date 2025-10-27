'use client';

import React from 'react';
import { useSettingsStore, DisplaySettings as DisplaySettingsType } from '../../store/settingsStore';
import { Monitor, Eye, Palette, Activity, Sparkles, Zap } from 'lucide-react';

interface DisplaySettingsProps {
  className?: string;
}

export const DisplaySettings: React.FC<DisplaySettingsProps> = ({
  className = ''
}) => {
  const { display, setDisplaySetting } = useSettingsStore();

  const colorBlindOptions = [
    { value: 'none', label: 'Nenhum', description: 'Visão normal' },
    { value: 'protanopia', label: 'Protanopia', description: 'Dificuldade com vermelho' },
    { value: 'deuteranopia', label: 'Deuteranopia', description: 'Dificuldade com verde' },
    { value: 'tritanopia', label: 'Tritanopia', description: 'Dificuldade com azul' }
  ] as const;

  const handleToggle = (key: keyof DisplaySettingsType) => {
    setDisplaySetting(key, !display[key]);
  };

  const handleColorBlindModeChange = (mode: DisplaySettingsType['colorBlindMode']) => {
    setDisplaySetting('colorBlindMode', mode);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-bold text-orange-400 flex items-center gap-2">
        <Monitor className="w-5 h-5" />
        Configurações de Exibição
      </h3>

      <div className="space-y-4">
        {/* Accessibility Options */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Acessibilidade
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white text-sm font-medium">Movimento Reduzido</label>
                <p className="text-gray-400 text-xs">Reduz animações e efeitos de movimento</p>
              </div>
              <button
                onClick={() => handleToggle('reducedMotion')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  display.reducedMotion ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    display.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white text-sm font-medium">Alto Contraste</label>
                <p className="text-gray-400 text-xs">Aumenta o contraste para melhor visibilidade</p>
              </div>
              <button
                onClick={() => handleToggle('highContrast')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  display.highContrast ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    display.highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Suporte para Daltonismo
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {colorBlindOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleColorBlindModeChange(option.value)}
                    className={`p-3 rounded-lg text-left transition-colors ${
                      display.colorBlindMode === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs opacity-75">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Options */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Performance e Efeitos
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white text-sm font-medium">Mostrar FPS</label>
                <p className="text-gray-400 text-xs">Exibe contador de frames por segundo</p>
              </div>
              <button
                onClick={() => handleToggle('showFPS')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  display.showFPS ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    display.showFPS ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white text-sm font-medium flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Efeitos de Partículas
                </label>
                <p className="text-gray-400 text-xs">Ativa efeitos visuais de partículas</p>
              </div>
              <button
                onClick={() => handleToggle('particleEffects')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  display.particleEffects ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    display.particleEffects ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white text-sm font-medium flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  Vibração do Ecrã
                </label>
                <p className="text-gray-400 text-xs">Ativa efeito de vibração em impactos</p>
              </div>
              <button
                onClick={() => handleToggle('screenShake')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  display.screenShake ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    display.screenShake ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-green-900/30 rounded-lg border border-green-500/20">
        <h4 className="text-sm font-medium text-green-300 mb-2">Informações de Acessibilidade:</h4>
        <ul className="text-xs text-green-200 space-y-1">
          <li>• As configurações de acessibilidade melhoram a experiência para todos</li>
          <li>• O modo de alto contraste pode ajudar em ambientes com muita luz</li>
          <li>• Desativar efeitos pode melhorar a performance em dispositivos mais antigos</li>
        </ul>
      </div>
    </div>
  );
};