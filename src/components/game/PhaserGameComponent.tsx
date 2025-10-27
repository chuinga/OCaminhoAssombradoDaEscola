'use client';

import { useEffect, useRef, useState } from 'react';
import type { Difficulty } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { useAudioStore } from '../../store/audioStore';
import { GameHUD } from './GameHUD';
import { TouchControls } from './TouchControls';
import { PauseMenu } from './PauseMenu';

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
  const [isPaused, setIsPaused] = useState(false);
  
  // Keyboard state management (similar to touch controls)
  const [keyboardState, setKeyboardState] = useState({
    moveLeft: false,
    moveRight: false,
    jump: false,
    crouch: false,
    attack: false
  });
  
  // Get game store data and actions for updating HUD
  const { 
    character, 
    weapon, 
    updateLives, 
    updateScore, 
    setGameStatus 
  } = useGameStore();

  // Get audio store for applying settings
  const { applySettings } = useAudioStore();

  // Browser-level keyboard event handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log('Browser keydown:', event.code);
      
      switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
          setKeyboardState(prev => ({ ...prev, moveLeft: true }));
          event.preventDefault();
          break;
        case 'ArrowRight':
        case 'KeyD':
          setKeyboardState(prev => ({ ...prev, moveRight: true }));
          event.preventDefault();
          break;
        case 'ArrowUp':
        case 'KeyW':
          setKeyboardState(prev => ({ ...prev, jump: true }));
          event.preventDefault();
          break;
        case 'ArrowDown':
        case 'KeyS':
          setKeyboardState(prev => ({ ...prev, crouch: true }));
          event.preventDefault();
          break;
        case 'Space':
          setKeyboardState(prev => ({ ...prev, attack: true }));
          event.preventDefault();
          break;
        case 'Escape':
          // Handle pause toggle
          if (gameSceneRef.current && typeof gameSceneRef.current.handlePause === 'function') {
            gameSceneRef.current.handlePause();
          }
          event.preventDefault();
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      console.log('Browser keyup:', event.code);
      
      switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
          setKeyboardState(prev => ({ ...prev, moveLeft: false }));
          break;
        case 'ArrowRight':
        case 'KeyD':
          setKeyboardState(prev => ({ ...prev, moveRight: false }));
          break;
        case 'ArrowUp':
        case 'KeyW':
          setKeyboardState(prev => ({ ...prev, jump: false }));
          break;
        case 'ArrowDown':
        case 'KeyS':
          setKeyboardState(prev => ({ ...prev, crouch: false }));
          break;
        case 'Space':
          setKeyboardState(prev => ({ ...prev, attack: false }));
          break;
      }
    };

    // Add event listeners to document
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Send keyboard state to game scene
  useEffect(() => {
    if (gameSceneRef.current && typeof gameSceneRef.current.setKeyboardControls === 'function') {
      console.log('Sending keyboard state to game:', keyboardState);
      gameSceneRef.current.setKeyboardControls(keyboardState);
    }
  }, [keyboardState]);

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

        // Set game configuration in registry for the scene to access
        gameRef.current.registry.set('difficulty', difficulty);
        gameRef.current.registry.set('character', character);
        gameRef.current.registry.set('weapon', weapon);

        // Set up game event listeners
        gameRef.current.events.on('ready', () => {
          setIsLoading(false);
          setGameStatus('playing');
          
          // Ensure the game canvas has focus for keyboard input
          if (gameRef.current?.canvas) {
            gameRef.current.canvas.focus();
            gameRef.current.canvas.setAttribute('tabindex', '0');
          }
        });

        // Listen for player stats changes from the game scene
        // We need to wait for the scene to be created, so we'll set up the listener after a short delay
        setTimeout(() => {
          const gameScene = gameRef.current?.scene.getScene('GameScene');
          if (gameScene) {
            // Store reference to game scene for touch controls
            gameSceneRef.current = gameScene;
            
            gameScene.events.on('playerStatsChanged', (stats: { lives: number; score: number }) => {
              console.log('Player stats changed:', stats);
              updateLives(stats.lives);
              updateScore(stats.score);
            });

            // Handle game end events
            gameScene.events.on('gameEnd', (gameEndData: { score: number; victory: boolean; reason: string }) => {
              console.log('Game end event received:', gameEndData);
              setGameStatus('finished');
              onGameEnd?.(gameEndData.score, gameEndData.victory);
            });

            // Handle pause state changes
            gameScene.events.on('gamePauseToggled', (pauseData: { isPaused: boolean }) => {
              console.log('Game pause toggled:', pauseData);
              setIsPaused(pauseData.isPaused);
              if (pauseData.isPaused) {
                setGameStatus('paused');
              } else {
                setGameStatus('playing');
              }
            });
          }
        }, 100);

        // Store destroyPhaserGame function for cleanup
        destroyGameRef.current = destroyPhaserGame;

        // Apply audio settings when game is ready
        applySettings();

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

  // Pause menu handlers
  const handleResume = () => {
    if (gameSceneRef.current && typeof gameSceneRef.current.handlePause === 'function') {
      gameSceneRef.current.handlePause();
    }
  };

  const handleQuit = () => {
    setGameStatus('menu');
    // The parent component will handle navigation
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
        onClick={() => {
          // Ensure canvas has focus when clicked
          if (gameRef.current?.canvas) {
            console.log('Focusing canvas on click');
            gameRef.current.canvas.focus();
          }
        }}
        onMouseEnter={() => {
          // Also focus on mouse enter
          if (gameRef.current?.canvas) {
            console.log('Focusing canvas on mouse enter');
            gameRef.current.canvas.focus();
          }
        }}
        tabIndex={0}
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

      {/* Pause overlay - visual feedback when game is paused */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-40 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-orange-500/30">
              <p className="text-white text-sm font-medium">PAUSADO</p>
            </div>
          </div>
        </div>
      )}

      {/* Pause Menu overlay */}
      <PauseMenu
        isVisible={isPaused}
        onResume={handleResume}
        onQuit={handleQuit}
      />
    </div>
  );
}