'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { ClientOnlyPhaserGame } from '@/components/game/ClientOnlyPhaserGame';

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

  const handleGameEnd = (score: number, victory: boolean) => {
    // Navigate to results page with final score and victory status
    console.log('Game ended:', { score, victory });
    router.push(`/final?score=${score}&victory=${victory}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900">
      {/* Game Container */}
      <div className="w-full h-screen">
        <ClientOnlyPhaserGame 
          difficulty={difficulty}
          onGameEnd={handleGameEnd}
          className="w-full h-full"
        />
      </div>
      
      {/* Debug Info - Remove in production */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white text-sm">
        <h3 className="font-bold mb-2">Player Config:</h3>
        <div className="space-y-1">
          <p>Nome: {firstName} {lastName}</p>
          <p>Personagem: {character === 'boy' ? 'Menino' : 'Menina'}</p>
          <p>Arma: {weapon}</p>
          <p>Dificuldade: {difficulty}</p>
        </div>
        <button
          onClick={() => router.push('/dificuldade')}
          className="mt-2 text-gray-400 hover:text-white transition-colors text-xs"
        >
          ← Voltar
        </button>
      </div>
    </div>
  );
}