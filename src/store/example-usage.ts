// Example usage of the GameStore
// This file demonstrates how to use the store in components

import { useGameStore } from './gameStore';

// Example React component usage
export function ExampleComponent() {
  const {
    firstName: _firstName,
    lastName: _lastName,
    character: _character,
    weapon: _weapon,
    difficulty: _difficulty,
    lives,
    score,
    gameStatus: _gameStatus,
    setPlayerName,
    setCharacter,
    setWeapon,
    setDifficulty,
    updateLives,
    updateScore,
    setGameStatus,
    resetGame
  } = useGameStore();

  // Example usage patterns:

  // Setting player name (Requirement 1.3)
  const _handleNameSubmit = (first: string, last: string) => {
    setPlayerName(first, last);
  };

  // Setting character selection (Requirement 2.4)
  const _handleCharacterSelect = (selectedCharacter: 'boy' | 'girl') => {
    setCharacter(selectedCharacter);
  };

  // Setting weapon selection (Requirement 2.4)
  const _handleWeaponSelect = (selectedWeapon: 'katana' | 'laser' | 'baseball' | 'bazooka') => {
    setWeapon(selectedWeapon);
  };

  // Setting difficulty (Requirement 2.6)
  const _handleDifficultySelect = (selectedDifficulty: 'easy' | 'medium' | 'impossible') => {
    setDifficulty(selectedDifficulty);
  };

  // Game progress updates (Requirement 7.1)
  const _handlePlayerDamage = () => {
    if (lives > 0) {
      updateLives(lives - 1);
    }
  };

  const _handleScoreIncrease = (points: number) => {
    updateScore(score + points);
  };

  // Game state management
  const _startGame = () => {
    setGameStatus('playing');
  };

  const _pauseGame = () => {
    setGameStatus('paused');
  };

  const _endGame = () => {
    setGameStatus('finished');
  };

  // Reset everything when starting a new game
  const _startNewGame = () => {
    resetGame();
  };

  return null; // This is just an example file
}

// Example of accessing store outside of React components
export function getGameState() {
  return useGameStore.getState();
}

// Example of subscribing to store changes
export function subscribeToGameState(callback: (state: any) => void) {
  return useGameStore.subscribe(callback);
}