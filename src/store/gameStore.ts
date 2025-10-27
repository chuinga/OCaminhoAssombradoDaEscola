import { create } from 'zustand';
import { analyticsService } from '@/lib/analytics';

export type Character = 'boy' | 'girl';
export type Weapon = 'katana' | 'laser' | 'baseball' | 'bazooka';
export type Difficulty = 'easy' | 'medium' | 'impossible';
export type GameStatus = 'menu' | 'playing' | 'paused' | 'finished';

interface GameState {
  // Player data
  firstName: string;
  lastName: string;
  character: Character | null;
  weapon: Weapon | null;
  difficulty: Difficulty | null;
  
  // Game progress
  lives: number;
  score: number;
  gameStatus: GameStatus;
  
  // Actions
  setPlayerName: (firstName: string, lastName: string) => void;
  setCharacter: (character: Character) => void;
  setWeapon: (weapon: Weapon) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  updateLives: (lives: number) => void;
  updateScore: (score: number) => void;
  setGameStatus: (status: GameStatus) => void;
  resetGame: () => void;
}

const initialState = {
  firstName: '',
  lastName: '',
  character: null as Character | null,
  weapon: null as Weapon | null,
  difficulty: null as Difficulty | null,
  lives: 10, // Starting with 10 lives as per requirement 7.1
  score: 0,
  gameStatus: 'menu' as GameStatus,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,
  
  // Player data actions
  setPlayerName: (firstName: string, lastName: string) =>
    set({ firstName, lastName }),
  
  setCharacter: (character: Character) => {
    set({ character });
  },
  
  setWeapon: (weapon: Weapon) => {
    set({ weapon });
    // Track weapon selection
    analyticsService.trackWeaponUsage(weapon);
  },
  
  setDifficulty: (difficulty: Difficulty) => {
    set({ difficulty });
  },
  
  // Game progress actions
  updateLives: (lives: number) => {
    set((state) => {
      const newState = { lives };
      
      // Track progression when lives or score change
      if (state.difficulty) {
        analyticsService.trackProgression(state.difficulty, state.score, lives);
      }
      
      // Announce life changes for screen readers (client-side only)
      if (typeof window !== 'undefined') {
        if (lives < state.lives) {
          const livesLost = state.lives - lives;
          window.dispatchEvent(new CustomEvent('screenReaderAnnounce', {
            detail: { 
              message: `Perdeu ${livesLost} vida${livesLost > 1 ? 's' : ''}. Vidas restantes: ${lives}`,
              priority: 'assertive'
            }
          }));
        } else if (lives > state.lives) {
          const livesGained = lives - state.lives;
          window.dispatchEvent(new CustomEvent('screenReaderAnnounce', {
            detail: { 
              message: `Ganhou ${livesGained} vida${livesGained > 1 ? 's' : ''}. Total de vidas: ${lives}`,
              priority: 'polite'
            }
          }));
        }
      }
      
      return newState;
    });
  },
  
  updateScore: (score: number) => {
    set((state) => {
      const newState = { score };
      
      // Track progression when score changes
      if (state.difficulty) {
        analyticsService.trackProgression(state.difficulty, score, state.lives);
      }
      
      // Announce significant score increases for screen readers (client-side only)
      if (typeof window !== 'undefined' && score > state.score) {
        const scoreIncrease = score - state.score;
        if (scoreIncrease >= 100) { // Only announce significant score changes
          window.dispatchEvent(new CustomEvent('screenReaderAnnounce', {
            detail: { 
              message: `Pontuação aumentou para ${score.toLocaleString()} pontos`,
              priority: 'polite'
            }
          }));
        }
      }
      
      return newState;
    });
  },
  
  setGameStatus: (gameStatus: GameStatus) => {
    set((state) => {
      // Track game completion when status changes to finished
      if (gameStatus === 'finished' && state.difficulty) {
        const survived = state.lives > 0;
        analyticsService.trackGameCompletion(state.difficulty, state.score, survived);
      }
      
      // Set session info when game starts
      if (gameStatus === 'playing' && state.character && state.weapon && state.difficulty) {
        analyticsService.setSessionInfo(state.character, state.weapon, state.difficulty);
      }
      
      return { gameStatus };
    });
  },
  
  // Reset game action - clears all state back to initial values
  resetGame: () =>
    set(initialState),
}));