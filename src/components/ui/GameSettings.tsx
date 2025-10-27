'use client';

import React from 'react';
import { useSettingsStore, GameSettings as GameSettingsType } from '../../store/settingsStore';
import { Gamepad2, HelpCircle, Pause, Save } from 'lucide-react';

interface GameSettingsProps {
  className?: string;
}

export const GameSettings: React.FC<GameSettingsProps> = ({
  className = ''
}) => {
  const { game, setGameSetting } = useSettingsStore();

  const handleToggle = (key: keyof GameSettingsType) => {
    setGameSetting(key, !game[key]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-bold text-orange-400 flex items-center gap-2">
        <Gamepad2 className="w-5 h-5" />
        Configurações de Jogo
      </h3>

      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-white text-sm font-medium flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Mostrar Prévia da Dificuldade
              </label>
              <p className="text-gray-400 text-xs">
                Exibe informações detalhadas sobre inimigos e itens por dificuldade
              </p>
            </div>
            <button
              onClick={() => handleToggle('showDifficultyPreview')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                game.showDifficultyPreview ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  game.showDifficultyPreview ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-white text-sm font-medium">Mostrar Dicas de Controlos</label>
              <p className="text-gray-400 text-xs">
                Exibe lembretes dos controlos durante o jogo
              </p>
            </div>
            <button
              onClick={() => handleToggle('showControlHints')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                game.showControlHints ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  game.showControlHints ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-white text-sm font-medium flex items-center gap-2">
                <Pause className="w-4 h-4" />
                Pausar ao Perder Foco
              </label>
              <p className="text-gray-400 text-xs">
                Pausa automaticamente quando muda de janela ou aplicação
              </p>
            </div>
            <button
              onClick={() => handleToggle('pauseOnFocusLoss')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                game.pauseOnFocusLoss ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  game.pauseOnFocusLoss ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-white text-sm font-medium flex items-center gap-2">
                <Save className="w-4 h-4" />
                Gravação Automática
              </label>
              <p className="text-gray-400 text-xs">
                Grava automaticamente o progresso e configurações
              </p>
            </div>
            <button
              onClick={() => handleToggle('autoSave')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                game.autoSave ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  game.autoSave ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-500/20">
        <h4 className="text-sm font-medium text-purple-300 mb-2">Dicas de Jogo:</h4>
        <ul className="text-xs text-purple-200 space-y-1">
          <li>• As dicas de controlos podem ser úteis para novos jogadores</li>
          <li>• A pausa automática evita perdas acidentais de progresso</li>
          <li>• A gravação automática mantém as suas preferências seguras</li>
        </ul>
      </div>
    </div>
  );
};