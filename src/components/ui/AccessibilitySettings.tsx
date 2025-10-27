'use client';

import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { Eye, EyeOff, Contrast, Palette, Monitor } from 'lucide-react';

interface AccessibilitySettingsProps {
  className?: string;
  showLabels?: boolean;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  className = '',
  showLabels = true
}) => {
  const { display, setDisplaySetting } = useSettingsStore();

  const toggleHighContrast = () => {
    setDisplaySetting('highContrast', !display.highContrast);
  };

  const toggleReducedMotion = () => {
    setDisplaySetting('reducedMotion', !display.reducedMotion);
  };

  const handleColorBlindModeChange = (mode: typeof display.colorBlindMode) => {
    setDisplaySetting('colorBlindMode', mode);
  };

  const colorBlindOptions = [
    { value: 'none', label: 'Normal', description: 'Sem filtro de daltonismo' },
    { value: 'protanopia', label: 'Protanopia', description: 'Dificuldade com vermelho' },
    { value: 'deuteranopia', label: 'Deuteranopia', description: 'Dificuldade com verde' },
    { value: 'tritanopia', label: 'Tritanopia', description: 'Dificuldade com azul' }
  ] as const;

  return (
    <div className={`space-y-6 ${className}`}>
      {showLabels && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-orange-400 mb-2 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Configurações de Acessibilidade
          </h3>
          <p className="text-sm text-gray-300">
            Ajuste as configurações visuais para melhor experiência
          </p>
        </div>
      )}

      {/* High Contrast Mode */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Contrast className="w-5 h-5 text-orange-400" />
            <div>
              <label 
                htmlFor="high-contrast-toggle"
                className="text-white font-medium cursor-pointer"
              >
                Modo Alto Contraste
              </label>
              <p className="text-sm text-gray-400">
                Aumenta o contraste para melhor visibilidade
              </p>
            </div>
          </div>
          <button
            id="high-contrast-toggle"
            onClick={toggleHighContrast}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-orange-500/50 ${
              display.highContrast ? 'bg-orange-600' : 'bg-gray-600'
            }`}
            role="switch"
            aria-checked={display.highContrast}
            aria-label={`${display.highContrast ? 'Desativar' : 'Ativar'} modo alto contraste`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                display.highContrast ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Reduced Motion */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <EyeOff className="w-5 h-5 text-orange-400" />
            <div>
              <label 
                htmlFor="reduced-motion-toggle"
                className="text-white font-medium cursor-pointer"
              >
                Reduzir Movimento
              </label>
              <p className="text-sm text-gray-400">
                Reduz animações e efeitos de movimento
              </p>
            </div>
          </div>
          <button
            id="reduced-motion-toggle"
            onClick={toggleReducedMotion}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-orange-500/50 ${
              display.reducedMotion ? 'bg-orange-600' : 'bg-gray-600'
            }`}
            role="switch"
            aria-checked={display.reducedMotion}
            aria-label={`${display.reducedMotion ? 'Desativar' : 'Ativar'} redução de movimento`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                display.reducedMotion ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Color Blind Support */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-orange-400" />
          <div>
            <h4 className="text-white font-medium">Suporte para Daltonismo</h4>
            <p className="text-sm text-gray-400">
              Filtros para diferentes tipos de daltonismo
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          {colorBlindOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name="colorBlindMode"
                value={option.value}
                checked={display.colorBlindMode === option.value}
                onChange={() => handleColorBlindModeChange(option.value)}
                className="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 focus:ring-orange-500 focus:ring-2"
              />
              <div className="flex-1">
                <div className="text-white font-medium">{option.label}</div>
                <div className="text-sm text-gray-400">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Visual Effects */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <Monitor className="w-5 h-5 text-orange-400" />
          <div>
            <h4 className="text-white font-medium">Efeitos Visuais</h4>
            <p className="text-sm text-gray-400">
              Controle efeitos visuais do jogo
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Particle Effects */}
          <div className="flex items-center justify-between">
            <div>
              <label 
                htmlFor="particle-effects-toggle"
                className="text-white font-medium cursor-pointer"
              >
                Efeitos de Partículas
              </label>
              <p className="text-sm text-gray-400">
                Efeitos visuais como explosões e faíscas
              </p>
            </div>
            <button
              id="particle-effects-toggle"
              onClick={() => setDisplaySetting('particleEffects', !display.particleEffects)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-orange-500/50 ${
                display.particleEffects ? 'bg-orange-600' : 'bg-gray-600'
              }`}
              role="switch"
              aria-checked={display.particleEffects}
              aria-label={`${display.particleEffects ? 'Desativar' : 'Ativar'} efeitos de partículas`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  display.particleEffects ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Screen Shake */}
          <div className="flex items-center justify-between">
            <div>
              <label 
                htmlFor="screen-shake-toggle"
                className="text-white font-medium cursor-pointer"
              >
                Tremor de Ecrã
              </label>
              <p className="text-sm text-gray-400">
                Efeito de tremor quando há impactos
              </p>
            </div>
            <button
              id="screen-shake-toggle"
              onClick={() => setDisplaySetting('screenShake', !display.screenShake)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-orange-500/50 ${
                display.screenShake ? 'bg-orange-600' : 'bg-gray-600'
              }`}
              role="switch"
              aria-checked={display.screenShake}
              aria-label={`${display.screenShake ? 'Desativar' : 'Ativar'} tremor de ecrã`}
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

      {/* Keyboard Navigation Help */}
      <div className="bg-blue-900/30 rounded-lg p-4">
        <h4 className="text-blue-300 font-medium mb-2">💡 Navegação por Teclado</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Use <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Tab</kbd> para navegar entre elementos</li>
          <li>• Use <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Enter</kbd> ou <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Espaço</kbd> para ativar botões</li>
          <li>• Use <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Esc</kbd> para pausar o jogo</li>
          <li>• Todos os controlos têm indicadores de foco visíveis</li>
        </ul>
      </div>
    </div>
  );
};