'use client';

import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { DIFFICULTY_PREVIEW } from '../../store/settingsStore';
import { Skull, Heart, Users, Info } from 'lucide-react';

interface DifficultyPreviewProps {
  className?: string;
  showTitle?: boolean;
}

export const DifficultyPreview: React.FC<DifficultyPreviewProps> = ({
  className = '',
  showTitle = true
}) => {
  const { difficulty } = useGameStore();

  if (!difficulty) {
    return (
      <div className={`bg-gray-800/50 rounded-lg p-4 ${className}`}>
        <div className="text-center text-gray-400">
          <Info className="w-8 h-8 mx-auto mb-2" />
          <p>Selecione uma dificuldade para ver os detalhes</p>
        </div>
      </div>
    );
  }

  const preview = DIFFICULTY_PREVIEW[difficulty];

  return (
    <div className={`space-y-4 ${className}`}>
      {showTitle && (
        <h3 className="text-lg font-bold text-orange-400">Prévia da Dificuldade</h3>
      )}

      <div className="bg-gray-800/50 rounded-lg p-4 border-l-4 border-orange-500">
        <div className="flex items-center gap-3 mb-3">
          <div className={`text-2xl font-bold ${preview.color}`}>
            {preview.name}
          </div>
          <div className="text-gray-400 text-sm">
            {preview.description}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Enemy Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-400">
              <Skull className="w-4 h-4" />
              <span className="font-medium">Inimigos</span>
            </div>
            <div className="text-white text-sm">
              {preview.enemyCount}
            </div>
            <div className="flex flex-wrap gap-1">
              {preview.enemyTypes.map((enemy, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-red-900/30 text-red-300 text-xs rounded"
                >
                  {enemy}
                </span>
              ))}
            </div>
          </div>

          {/* Life Items Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-400">
              <Heart className="w-4 h-4" />
              <span className="font-medium">Itens de Vida</span>
            </div>
            <div className="text-white text-sm">
              {preview.lifeItems}
            </div>
            {difficulty !== 'impossible' && (
              <div className="text-xs text-gray-400">
                Abóboras, Chupas e Maçãs (+1 vida, +50 pontos)
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Users className="w-4 h-4" />
            <span className="font-medium text-sm">Estratégias Recomendadas</span>
          </div>
          <div className="text-xs text-gray-300 space-y-1">
            {difficulty === 'easy' && (
              <>
                <div>• Use saltos para evitar inimigos terrestres</div>
                <div>• Agache para evitar inimigos voadores</div>
                <div>• Colete muitos itens de vida para segurança</div>
              </>
            )}
            {difficulty === 'medium' && (
              <>
                <div>• Balance entre agressividade e cautela</div>
                <div>• Gerencie bem os itens de vida disponíveis</div>
                <div>• Use todas as mecânicas de movimento</div>
              </>
            )}
            {difficulty === 'impossible' && (
              <>
                <div>• Evite todos os confrontos desnecessários</div>
                <div>• Domine perfeitamente os controlos</div>
                <div>• Sem itens de vida - cada erro pode ser fatal</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Scoring Information */}
      <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/20">
        <h4 className="text-sm font-medium text-blue-300 mb-2">Sistema de Pontuação:</h4>
        <div className="text-xs text-blue-200 space-y-1">
          <div>• Eliminar inimigo: +100 pontos</div>
          <div>• Coletar item de vida: +50 pontos</div>
          <div>• Chegar à escola: +500 pontos bónus</div>
          <div>• Vidas restantes não afetam a pontuação final</div>
        </div>
      </div>
    </div>
  );
};