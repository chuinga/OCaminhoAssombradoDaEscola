'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore, Difficulty } from '@/store/gameStore';

interface DifficultyInfo {
  id: Difficulty;
  name: string;
  emoji: string;
  description: string;
  characteristics: string[];
  stats: {
    enemies: string;
    lifeItems: string;
    challenge: string;
  };
}

const difficulties: DifficultyInfo[] = [
  {
    id: 'easy',
    name: 'Fácil',
    emoji: '😊',
    description: 'Perfeito para iniciantes - poucos inimigos e muitos itens de vida',
    characteristics: [
      'Poucos inimigos',
      'Muitos itens de vida',
      'Experiência relaxante'
    ],
    stats: {
      enemies: '2 por 1000px',
      lifeItems: '8 por 1000px',
      challenge: 'Baixo'
    }
  },
  {
    id: 'medium',
    name: 'Médio',
    emoji: '😐',
    description: 'Equilíbrio entre desafio e diversão - alguns inimigos e poucos itens',
    characteristics: [
      'Alguns inimigos',
      'Poucos itens de vida',
      'Desafio equilibrado'
    ],
    stats: {
      enemies: '4 por 1000px',
      lifeItems: '3 por 1000px',
      challenge: 'Médio'
    }
  },
  {
    id: 'impossible',
    name: 'Impossível',
    emoji: '💀',
    description: 'Para os mais corajosos - muitos inimigos e nenhum item de vida',
    characteristics: [
      'Muitos inimigos',
      'Zero itens de vida',
      'Desafio extremo'
    ],
    stats: {
      enemies: '8 por 1000px',
      lifeItems: '0 por 1000px',
      challenge: 'Extremo'
    }
  }
];

export default function DificuldadePage() {
  const router = useRouter();
  const { firstName, lastName, character, weapon, difficulty, setDifficulty } = useGameStore();
  
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(difficulty);

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
  }, [firstName, lastName, character, weapon, router]);

  const handleDifficultySelect = (difficultyType: Difficulty) => {
    setSelectedDifficulty(difficultyType);
  };

  const handleContinue = () => {
    if (selectedDifficulty) {
      // Save difficulty choice to Zustand state
      setDifficulty(selectedDifficulty);
      
      // Navigate to game page with complete state validation
      router.push('/jogar');
    }
  };

  // Don't render if validation fails
  if (!firstName || !lastName || !character || !weapon) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Escolha a Dificuldade
          </h1>
          <p className="text-gray-300">
            Selecione o nível de desafio para a sua jornada
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {difficulties.map((difficultyInfo) => (
            <div
              key={difficultyInfo.id}
              onClick={() => handleDifficultySelect(difficultyInfo.id)}
              className={`cursor-pointer rounded-lg p-6 border-2 transition-all duration-200 hover:scale-105 ${
                selectedDifficulty === difficultyInfo.id
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-600 bg-white/10 hover:border-purple-400'
              }`}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-700 rounded-full flex items-center justify-center text-3xl">
                  {difficultyInfo.emoji}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {difficultyInfo.name}
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  {difficultyInfo.description}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-purple-300 mb-2">
                    Características:
                  </h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {difficultyInfo.characteristics.map((char, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1 h-1 bg-purple-400 rounded-full mr-2"></span>
                        {char}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-purple-300 mb-2">
                    Estatísticas:
                  </h4>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Inimigos:</span>
                      <span className="text-white">{difficultyInfo.stats.enemies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Itens de Vida:</span>
                      <span className="text-white">{difficultyInfo.stats.lifeItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Desafio:</span>
                      <span className={`font-semibold ${
                        difficultyInfo.id === 'easy' ? 'text-green-400' :
                        difficultyInfo.id === 'medium' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {difficultyInfo.stats.challenge}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col space-y-4">
          <button
            onClick={handleContinue}
            disabled={!selectedDifficulty}
            className={`w-full font-bold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent ${
              selectedDifficulty
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {selectedDifficulty ? 'Começar Jogo' : 'Selecione uma dificuldade'}
          </button>

          <div className="text-center">
            <button
              onClick={() => router.push('/arma')}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}