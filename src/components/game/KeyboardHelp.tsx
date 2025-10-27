'use client';

import React from 'react';
import { Keyboard, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

interface KeyboardHelpProps {
  isVisible: boolean;
  onClose: () => void;
}

export const KeyboardHelp: React.FC<KeyboardHelpProps> = ({
  isVisible,
  onClose
}) => {
  if (!isVisible) return null;

  const keyboardShortcuts = [
    {
      category: 'Movimento',
      shortcuts: [
        { keys: ['A', '←'], description: 'Mover para a esquerda' },
        { keys: ['D', '→'], description: 'Mover para a direita' },
        { keys: ['W', '↑'], description: 'Saltar' },
        { keys: ['S', '↓'], description: 'Agachar' }
      ]
    },
    {
      category: 'Ações',
      shortcuts: [
        { keys: ['Espaço'], description: 'Atacar com arma selecionada' },
        { keys: ['Esc'], description: 'Pausar/Retomar jogo' }
      ]
    },
    {
      category: 'Dicas de Combate',
      shortcuts: [
        { keys: ['Agachar'], description: 'Evita dano de Fantasmas e Morcegos' },
        { keys: ['Saltar'], description: 'Evita dano de Vampiros e Múmias' },
        { keys: ['Atacar'], description: 'Todas as armas eliminam inimigos com 1 hit' }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold text-orange-400">Controlos do Teclado</h2>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>

        <div className="space-y-6">
          {keyboardShortcuts.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                {category.category}
              </h3>
              <div className="space-y-3">
                {category.shortcuts.map((shortcut, shortcutIndex) => (
                  <div key={shortcutIndex} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          {keyIndex > 0 && (
                            <span className="text-gray-400 text-sm">ou</span>
                          )}
                          <kbd className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm font-mono text-white shadow-sm">
                            {key === '←' ? <ArrowLeft className="w-4 h-4" /> :
                             key === '→' ? <ArrowRight className="w-4 h-4" /> :
                             key === '↑' ? <ArrowUp className="w-4 h-4" /> :
                             key === '↓' ? <ArrowDown className="w-4 h-4" /> :
                             key}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                    <span className="text-gray-300 text-sm flex-1 ml-4">
                      {shortcut.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="bg-blue-900/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">💡 Dicas Importantes</h4>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Use agachar (S/↓) para evitar inimigos voadores como Fantasmas e Morcegos</li>
              <li>• Use saltar (W/↑) para evitar inimigos terrestres como Vampiros e Múmias</li>
              <li>• Recolha itens de vida (Abóbora, Chupa, Maçã) saltando para os alcançar</li>
              <li>• Todas as armas eliminam qualquer inimigo com apenas um ataque</li>
              <li>• Chegue ao portão da escola com vidas &gt; 0 para ganhar +500 pontos bónus</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Pressione Esc durante o jogo para aceder ao menu de pausa
          </p>
        </div>
      </div>
    </div>
  );
};