'use client';

import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { Hand, Accessibility, Gamepad2, RotateCcw } from 'lucide-react';

interface SimplifiedControlsProps {
  className?: string;
}

interface ControlScheme {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  controls: {
    moveLeft: string[];
    moveRight: string[];
    jump: string[];
    crouch: string[];
    attack: string[];
    pause: string[];
  };
  features: string[];
}

export const SimplifiedControls: React.FC<SimplifiedControlsProps> = ({ 
  className = '' 
}) => {
  const { controls, setControlMapping, resetControlsToDefault } = useSettingsStore();

  const controlSchemes: ControlScheme[] = [
    {
      id: 'default',
      name: 'Controlos Padrão',
      description: 'Controlos tradicionais para ambas as mãos',
      icon: <Gamepad2 className="w-5 h-5" />,
      controls: {
        moveLeft: ['KeyA', 'ArrowLeft'],
        moveRight: ['KeyD', 'ArrowRight'],
        jump: ['KeyW', 'ArrowUp', 'Space'],
        crouch: ['KeyS', 'ArrowDown'],
        attack: ['Space'],
        pause: ['Escape', 'KeyP']
      },
      features: [
        'WASD + Setas para movimento',
        'Espaço para saltar e atacar',
        'Múltiplas opções por ação'
      ]
    },
    {
      id: 'one-handed-left',
      name: 'Uma Mão (Esquerda)',
      description: 'Todos os controlos acessíveis com a mão esquerda',
      icon: <Hand className="w-5 h-5 scale-x-[-1]" />,
      controls: {
        moveLeft: ['KeyQ'],
        moveRight: ['KeyE'],
        jump: ['KeyW'],
        crouch: ['KeyS'],
        attack: ['KeyA'],
        pause: ['Escape', 'KeyZ']
      },
      features: [
        'Todos os controlos em QWEASD',
        'Posicionamento ergonómico',
        'Sem necessidade da mão direita'
      ]
    },
    {
      id: 'one-handed-right',
      name: 'Uma Mão (Direita)',
      description: 'Todos os controlos acessíveis com a mão direita',
      icon: <Hand className="w-5 h-5" />,
      controls: {
        moveLeft: ['ArrowLeft', 'Semicolon'],
        moveRight: ['ArrowRight', 'Quote'],
        jump: ['ArrowUp', 'KeyP'],
        crouch: ['ArrowDown', 'Period'],
        attack: ['Enter', 'Slash'],
        pause: ['Escape', 'Backspace']
      },
      features: [
        'Controlos no lado direito do teclado',
        'Setas + teclas próximas',
        'Sem necessidade da mão esquerda'
      ]
    },
    {
      id: 'minimal',
      name: 'Controlos Mínimos',
      description: 'Apenas 3 teclas essenciais para jogar',
      icon: <Accessibility className="w-5 h-5" />,
      controls: {
        moveLeft: ['KeyA'],
        moveRight: ['KeyD'],
        jump: ['Space'],
        crouch: ['KeyS'],
        attack: ['Space'], // Same as jump for simplicity
        pause: ['Escape']
      },
      features: [
        'Apenas A, D, Espaço e S',
        'Espaço para saltar e atacar',
        'Máxima simplicidade'
      ]
    },
    {
      id: 'large-keys',
      name: 'Teclas Grandes',
      description: 'Usa teclas maiores e mais fáceis de pressionar',
      icon: <Gamepad2 className="w-5 h-5" />,
      controls: {
        moveLeft: ['ArrowLeft'],
        moveRight: ['ArrowRight'],
        jump: ['Space'],
        crouch: ['ArrowDown'],
        attack: ['Enter'],
        pause: ['Escape']
      },
      features: [
        'Setas, Espaço e Enter',
        'Teclas grandes e visíveis',
        'Fácil localização no teclado'
      ]
    }
  ];

  const getCurrentSchemeId = (): string => {
    for (const scheme of controlSchemes) {
      const matches = Object.entries(scheme.controls).every(([action, keys]) => {
        const currentKeys = controls[action as keyof typeof controls];
        return keys.length === currentKeys.length && 
               keys.every(key => currentKeys.includes(key));
      });
      if (matches) return scheme.id;
    }
    return 'custom';
  };

  const applyControlScheme = (scheme: ControlScheme) => {
    Object.entries(scheme.controls).forEach(([action, keys]) => {
      setControlMapping(action as keyof typeof controls, keys);
    });
  };

  const currentSchemeId = getCurrentSchemeId();

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-orange-400 mb-2 flex items-center gap-2">
            <Accessibility className="w-5 h-5" />
            Esquemas de Controlo Simplificados
          </h3>
          <p className="text-sm text-gray-300">
            Escolha um esquema de controlos adaptado às suas necessidades
          </p>
        </div>
        <button
          onClick={resetControlsToDefault}
          className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
          title="Restaurar controlos padrão"
        >
          <RotateCcw className="w-4 h-4" />
          Restaurar
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {controlSchemes.map((scheme) => {
          const isActive = currentSchemeId === scheme.id;
          
          return (
            <div
              key={scheme.id}
              className={`
                relative p-4 rounded-lg border-2 transition-all cursor-pointer
                ${isActive 
                  ? 'border-orange-500 bg-orange-500/10' 
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800/70'
                }
              `}
              onClick={() => applyControlScheme(scheme)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  applyControlScheme(scheme);
                }
              }}
              aria-label={`Aplicar esquema ${scheme.name}`}
            >
              {isActive && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                </div>
              )}

              <div className="flex items-start gap-3 mb-3">
                <div className="text-orange-400 mt-1">
                  {scheme.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">
                    {scheme.name}
                  </h4>
                  <p className="text-sm text-gray-300 mb-3">
                    {scheme.description}
                  </p>
                </div>
              </div>

              {/* Control mapping preview */}
              <div className="space-y-2 mb-3">
                <div className="text-xs text-gray-400 font-medium">Controlos:</div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {Object.entries(scheme.controls).map(([action, keys]) => {
                    const actionLabels: Record<string, string> = {
                      moveLeft: 'Esquerda',
                      moveRight: 'Direita',
                      jump: 'Saltar',
                      crouch: 'Agachar',
                      attack: 'Atacar',
                      pause: 'Pausar'
                    };

                    return (
                      <div key={action} className="flex items-center gap-1">
                        <span className="text-gray-400 min-w-[50px]">
                          {actionLabels[action]}:
                        </span>
                        <div className="flex gap-1 flex-wrap">
                          {keys.slice(0, 2).map((key, index) => (
                            <kbd 
                              key={index}
                              className="px-1 py-0.5 bg-gray-700 rounded text-xs text-white"
                            >
                              {key.replace('Key', '').replace('Arrow', '')}
                            </kbd>
                          ))}
                          {keys.length > 2 && (
                            <span className="text-gray-500">+{keys.length - 2}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-1">
                <div className="text-xs text-gray-400 font-medium">Características:</div>
                <ul className="text-xs text-gray-300 space-y-0.5">
                  {scheme.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-orange-400 mt-0.5">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom scheme indicator */}
      {currentSchemeId === 'custom' && (
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Gamepad2 className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 font-medium">Esquema Personalizado</span>
          </div>
          <p className="text-sm text-blue-200">
            Está a usar um esquema de controlos personalizado. 
            Pode escolher um dos esquemas pré-definidos acima ou continuar com as suas configurações personalizadas.
          </p>
        </div>
      )}

      {/* Accessibility tips */}
      <div className="bg-green-900/30 rounded-lg p-4 border border-green-500/30">
        <h4 className="text-green-300 font-medium mb-2 flex items-center gap-2">
          <Accessibility className="w-4 h-4" />
          Dicas de Acessibilidade
        </h4>
        <ul className="text-sm text-green-200 space-y-1">
          <li>• <strong>Uma Mão:</strong> Ideal para utilizadores com mobilidade limitada numa mão</li>
          <li>• <strong>Controlos Mínimos:</strong> Reduz a complexidade para utilizadores com dificuldades motoras</li>
          <li>• <strong>Teclas Grandes:</strong> Mais fácil para utilizadores com precisão limitada</li>
          <li>• Todos os esquemas mantêm a funcionalidade completa do jogo</li>
        </ul>
      </div>
    </div>
  );
};