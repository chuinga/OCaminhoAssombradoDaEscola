import { useGameStore } from './gameStore';

// Validation utilities for game state
export const validateGameState = () => {
  const state = useGameStore.getState();
  
  return {
    hasValidName: state.firstName.trim() !== '' && state.lastName.trim() !== '',
    hasCharacter: state.character !== null,
    hasWeapon: state.weapon !== null,
    hasDifficulty: state.difficulty !== null,
    isReadyToPlay: function() {
      return this.hasValidName && this.hasCharacter && this.hasWeapon && this.hasDifficulty;
    }
  };
};

// Hook to get validation state
export const useGameValidation = () => {
  const state = useGameStore();
  
  return {
    hasValidName: state.firstName.trim() !== '' && state.lastName.trim() !== '',
    hasCharacter: state.character !== null,
    hasWeapon: state.weapon !== null,
    hasDifficulty: state.difficulty !== null,
    isReadyToPlay: state.firstName.trim() !== '' && 
                   state.lastName.trim() !== '' && 
                   state.character !== null && 
                   state.weapon !== null && 
                   state.difficulty !== null
  };
};