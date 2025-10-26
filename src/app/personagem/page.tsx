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
          <p className="text-gray-300">
            Olá {firstName}! Selecione o personagem que deseja jogar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {/* Boy Character */}
          <div
            onClick={() => handleCharacterSelect('boy')}
            className={`cursor-pointer rounded-lg p-6 border-2 transition-all duration-200 hover:scale-105 ${
              selectedCharacter === 'boy'
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-gray-600 bg-white/10 hover:border-purple-400'
            }`}
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
          </div>

          {/* Girl Character */}
          <div
            onClick={() => handleCharacterSelect('girl')}
            className={`cursor-pointer rounded-lg p-6 border-2 transition-all duration-200 hover:scale-105 ${
              selectedCharacter === 'girl'
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-gray-600 bg-white/10 hover:border-purple-400'
            }`}
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
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <button
            onClick={handleContinue}
            disabled={!selectedCharacter}
            className={`w-full font-bold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent ${
              selectedCharacter
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {selectedCharacter ? 'Continuar' : 'Selecione um personagem'}
          </button>

          <div className="text-center">
            <button
              onClick={() => router.push('/nome')}
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