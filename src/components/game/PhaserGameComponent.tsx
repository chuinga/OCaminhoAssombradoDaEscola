'use client';

import { useEffect, useRef, useState } from 'react';
import type { Difficulty } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { GameHUD } from './GameHUD';
import { TouchControls } from './TouchControls';

interface PhaserGameComponentProps {
  difficulty?: Difficulty;
  onGameEnd?: (score: number, victory: boolean) => void;
  className?: string;
}

export function PhaserGameComponent({ 
  difficulty = 'easy', 
  onGameEnd,
  className = '' 
}: PhaserGameComponentProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const destroyGameRef = useRef<((game: Phaser.Game) => void) | null>(null);
  const gameSceneRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get game store actions for updating HUD
  const { updateLives, updateScore, setGameStatus } = useGameStore();

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    // Dynamically import Phaser game functions only on client side
    const initializeGame = async () => {
      try {
        const { createPhaserGame, destroyPhaserGame } = await import('../../game');
        
        // Create the Phaser game
        gameRef.current = createPhaserGame({
          parent: containerRef.current!
        });

        // Set difficulty in game registry for the scene to access
        gameRef.current.registry.set('difficulty', difficulty);

        // Set up game event listeners
        gameRef.current.events.on('ready', () => {
          setIsLoading(false);
          setGameStatus('playing');
        });

        // Listen for player stats changes from the game scene
        // We need to wait for the scene to be created, so we'll set up the listener after a short delay
        setTimeout(() => {
          const gameScene = gameRef.current?.scene.getScene('GameScene');
          if (gameScene) {
            // Store reference to game scene for touch controls
            gameSceneRef.current = gameScene;
            
            gameScene.events.on('playerStatsChanged', (stats: { lives: number; score: number }) => {
              updateLives(stats.lives);
              updateScore(stats.score);
            });
          }
        }, 100);

        // Handle game end events (will be implemented when game logic is complete)
        // gameRef.current.events.on('gameEnd', (score: number, victory: boolean) => {
        //   onGameEnd?.(score, victory);
        // });

        // Store destroyPhaserGame function for cleanup
        destroyGameRef.current = destroyPhaserGame;

      } catch (err) {
        console.error('Failed to create Phaser game:', err);
        setError('Failed to load game');
        setIsLoading(false);
      }
    };

    initializeGame();

    // Cleanup function
    return () => {
      if (gameRef.current && destroyGameRef.current) {
        destroyGameRef.current(gameRef.current);
        gameRef.current = null;
        destroyGameRef.current = null;
        gameSceneRef.current = null;
      }
    };
  }, [difficulty, onGameEnd]);

  // Touch control handlers
  const handleTouchControl = (control: 'moveLeft' | 'moveRight' | 'jump' | 'crouch' | 'attack') => 
    (pressed: boolean) => {
      if (gameSceneRef.current && typeof gameSceneRef.current.setTouchControl === 'function') {
        gameSceneRef.current.setTouchControl(control, pressed);
      }
    };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 text-white ${className}`}>
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Game Error</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Reload Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading game...</p>
          </div>
        </div>
      )}
      <div 
        ref={containerRef} 
        id="game-container"
        className="w-full h-full"
      />
      {/* Game HUD overlay */}
      {!isLoading && !error && <GameHUD />}
      
      {/* Touch Controls overlay */}
      {!isLoading && !error && (
        <TouchControls
          onMoveLeft={handleTouchControl('moveLeft')}
          onMoveRight={handleTouchControl('moveRight')}
          onJump={handleTouchControl('jump')}
          onCrouch={handleTouchControl('crouch')}
          onAttack={handleTouchControl('attack')}
        />
      )}
    </div>
  );
}