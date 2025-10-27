'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore, Character } from '@/store/gameStore';

export default function PersonagemPage() {
  const router = useRouter();
  const { firstName, lastName, character, setCharacter } = useGameStore();
  
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(character);

  // Validate that user has entered their name before accessing this page
  useEffect(() => {
    if (!firstName || !lastName) {
      router.push('/nome');
    }
  }, [firstName, lastName, router]);

  const handleCharacterSelect = (characterType: Character) => {
    setSelectedCharacter(characterType);
  };

  const handleContinue = () => {
    if (selectedCharacter) {
      // Save character choice to Zustand state
      setCharacter(selectedCharacter);
      
      // Navigate to weapon selection page
      router.push('/arma');
    }
  };

  // Don't render if validation fails
  if (!firstName || !lastName) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Escolha o seu Personagem
          </h1>
          <p className="text-gray-300" id="character-selection-status">
            Olá {firstName}! Selecione o personagem que deseja jogar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {/* Boy Character */}
          <button
            onClick={() => handleCharacterSelect('boy')}
            className={`w-full cursor-pointer rounded-lg p-6 border-2 transition-all duration-200 hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 ${
              selectedCharacter === 'boy'
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-gray-600 bg-white/10 hover:border-purple-400 focus:border-purple-400'
            }`}
            aria-pressed={selectedCharacter === 'boy'}
            aria-label="Selecionar personagem menino"
          >
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center text-4xl">
                👦
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Menino</h3>
              <p className="text-gray-300 text-sm">
                Um jovem corajoso pronto para enfrentar os monstros
              </p>
            </div>
          </button>

          {/* Girl Character */}
          <button
            onClick={() => handleCharacterSelect('girl')}
            className={`w-full cursor-pointer rounded-lg p-6 border-2 transition-all duration-200 hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 ${
              selectedCharacter === 'girl'
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-gray-600 bg-white/10 hover:border-purple-400 focus:border-purple-400'
            }`}
            aria-pressed={selectedCharacter === 'girl'}
            aria-label="Selecionar personagem menina"
          >
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-pink-500 rounded-full flex items-center justify-center text-4xl">
                👧
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Menina</h3>
              <p className="text-gray-300 text-sm">
                Uma jovem destemida pronta para a aventura
              </p>
            </div>
          </button>
        </div>

        <div className="flex flex-col space-y-4">
          <button
            onClick={handleContinue}
            disabled={!selectedCharacter}
            className={`w-full font-bold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-purple-500/50 ${
              selectedCharacter
                ? 'bg-purple-600 hover:bg-purple-700 focus:bg-purple-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            aria-describedby="character-selection-status"
          >
            {selectedCharacter ? 'Continuar' : 'Selecione um personagem'}
          </button>

          <div className="text-center">
            <button
              onClick={() => router.push('/nome')}
              className="text-gray-400 hover:text-white focus:text-white transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded px-2 py-1"
              aria-label="Voltar à página de inserção de nome"
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