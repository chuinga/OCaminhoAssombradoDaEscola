'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';

export default function JogarPage() {
  const router = useRouter();
  const { firstName, lastName, character, weapon, difficulty } = useGameStore();

  // Validate that user has completed all previous steps before accessing this page
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

  // Don't render if validation fails
  if (!firstName || !lastName || !character || !weapon || !difficulty) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Jogo</h1>
        <p className="mb-4">O jogo será implementado nas próximas tarefas.</p>
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4">Configuração do Jogador:</h2>
          <div className="text-left space-y-2">
            <p><strong>Nome:</strong> {firstName} {lastName}</p>
            <p><strong>Personagem:</strong> {character === 'boy' ? 'Menino' : 'Menina'}</p>
            <p><strong>Arma:</strong> {weapon}</p>
            <p><strong>Dificuldade:</strong> {difficulty}</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/dificuldade')}
          className="mt-6 text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← Voltar à Seleção de Dificuldade
        </button>
      </div>
    </div>
  );
}