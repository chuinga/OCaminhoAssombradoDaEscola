'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore, GameMode } from '@/store/gameStore';

interface GameModeInfo {
  id: GameMode;
  name: string;
  emoji: string;
  description: string;
  characteristics: string[];
  details: {
    timeLimit?: string;
    lives?: string;
    difficulty?: string;
    worldLength?: string;
  };
}

const gameModes: GameModeInfo[] = [
  {
    id: 'story',
    name: 'História',
    emoji: '📖',
    description: 'Modo clássico - chegue à escola evitando monstros',
    characteristics: [
      'Objetivo: Chegar à escola',
      'Mundo com tamanho fixo',
      'Pontuação baseada em sobrevivência'
    ],
    details: {
      worldLength: '3500px',
      lives: 'Baseado na dificuldade',
      difficulty: 'Fixa durante o jogo'
    }
  },
  {
    id: 'endless',
    name: 'Infinito',
    emoji: '♾️',
    description: 'Sobreviva o máximo possível com dificuldade crescente',
    characteristics: [
      'Mundo infinito',
      'Dificuldade aumenta progressivamente',
      'Pontuação baseada em distância'
    ],
    details: {
      worldLength: 'Infinito',
      lives: 'Baseado na dificuldade',
      difficulty: 'Aumenta com o tempo'
    }
  },
  {
    id: 'timeAttack',
    name: 'Contra o Tempo',
    emoji: '⏱️',
    description: 'Chegue à escola antes do tempo acabar',
    characteristics: [
      'Limite de tempo: 5 minutos',
      'Corrida contra o relógio',
      'Bónus por tempo restante'
    ],
    details: {
      timeLimit: '5 minutos',
      worldLength: '3500px',
      lives: 'Baseado na dificuldade'
    }
  },
  {
    id: 'survival',
    name: 'Sobrevivência',
    emoji: '💀',
    description: 'Chegue à escola com apenas 3 vidas',
    characteristics: [
      'Apenas 3 vidas',
      'Sem itens de vida',
      'Desafio extremo'
    ],
    details: {
      lives: '3 vidas fixas',
      worldLength: '3500px',
      difficulty: 'Fixa (sem itens de vida)'
    }
  },
  {
    id: 'practice',
    name: 'Treino',
    emoji: '🎯',
    description: 'Aprenda os controlos sem pressão',
    characteristics: [
      'Vidas ilimitadas',
      'Sem penalização por morte',
      'Perfeito para iniciantes'
    ],
    details: {
      lives: 'Ilimitadas',
      worldLength: '3500px',
      difficulty: 'Fixa (modo fácil)'
    }
  }
];

export default function ModoPage() {
  const router = useRouter();
  const { firstName, lastName, character, weapon, difficulty, gameMode, setGameMode } = useGameStore();
  
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(gameMode);

  // Validate that user has completed previous steps before accessing this page
  useEffect(() => {
    if (!firstName || !lastName) {
      router.push('/nome');
      return;
    }
    if (!character) {
      router.push('/personagem');
      return;
    }
    if (!weapon) {
      router.push('/arma');
      return;
    }
    if (!difficulty) {
      router.push('/dificuldade');
      return;
    }
  }, [firstName, lastName, character, weapon, difficulty, router]);

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
  };

  const handleContinue = () => {
    if (selectedMode) {
      // Save game mode choice to Zustand state
      setGameMode(selectedMode);
      
      // Navigate to game page with complete state validation
      router.push('/jogar');
    }
  };

  // Don't render if validation fails
  if (!firstName || !lastName || !character || !weapon || !difficulty) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Escolha o Modo de Jogo
          </h1>
          <p className="text-gray-300" id="mode-selection-status">
            Selecione como quer jogar a sua aventura
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {gameModes.map((modeInfo) => (
            <button
              key={modeInfo.id}
              onClick={() => handleModeSelect(modeInfo.id)}
              className={`w-full cursor-pointer rounded-lg p-6 border-2 transition-all duration-200 hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 ${
                selectedMode === modeInfo.id
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-600 bg-white/10 hover:border-purple-400 focus:border-purple-400'
              }`}
              aria-pressed={selectedMode === modeInfo.id}
              aria-label={`Selecionar modo ${modeInfo.name}: ${modeInfo.description}`}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-700 rounded-full flex items-center justify-center text-3xl">
                  {modeInfo.emoji}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {modeInfo.name}
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  {modeInfo.description}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-purple-300 mb-2">
                    Características:
                  </h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {modeInfo.characteristics.map((char, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1 h-1 bg-purple-400 rounded-full mr-2"></span>
                        {char}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-purple-300 mb-2">
                    Detalhes:
                  </h4>
                  <div className="text-xs text-gray-400 space-y-1">
                    {modeInfo.details.timeLimit && (
                      <div className="flex justify-between">
                        <span>Tempo:</span>
                        <span className="text-white">{modeInfo.details.timeLimit}</span>
                      </div>
                    )}
                    {modeInfo.details.lives && (
                      <div className="flex justify-between">
                        <span>Vidas:</span>
                        <span className="text-white">{modeInfo.details.lives}</span>
                      </div>
                    )}
                    {modeInfo.details.worldLength && (
                      <div className="flex justify-between">
                        <span>Mundo:</span>
                        <span className="text-white">{modeInfo.details.worldLength}</span>
                      </div>
                    )}
                    {modeInfo.details.difficulty && (
                      <div className="flex justify-between">
                        <span>Dificuldade:</span>
                        <span className="text-white">{modeInfo.details.difficulty}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col space-y-4">
          <button
            onClick={handleContinue}
            disabled={!selectedMode}
            className={`w-full font-bold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-purple-500/50 ${
              selectedMode
                ? 'bg-purple-600 hover:bg-purple-700 focus:bg-purple-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            aria-describedby="mode-selection-status"
          >
            {selectedMode ? 'Começar Jogo' : 'Selecione um modo de jogo'}
          </button>

          <div className="text-center">
            <button
              onClick={() => router.push('/dificuldade')}
              className="text-gray-400 hover:text-white focus:text-white transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded px-2 py-1"
              aria-label="Voltar à seleção de dificuldade"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-gray-400">
        <p>© 2025 - O Caminho Assombrado da Escola - Feito com ❤️ pela Sofia para o Halloween</p>
      </footer>
    </div>
  );
}