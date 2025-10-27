'use client';

import dynamic from 'next/dynamic';
import type { Difficulty, GameMode } from '../../types';

interface ClientOnlyPhaserGameProps {
  difficulty?: Difficulty;
  gameMode?: GameMode;
  onGameEnd?: (score: number, victory: boolean) => void;
  className?: string;
}

// Dynamically import the PhaserGameComponent with no SSR
const PhaserGameComponent = dynamic(
  () => import('./PhaserGameComponent').then(mod => ({ default: mod.PhaserGameComponent })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading game...</p>
        </div>
      </div>
    )
  }
);

export function ClientOnlyPhaserGame(props: ClientOnlyPhaserGameProps) {
  return <PhaserGameComponent {...props} />;
}