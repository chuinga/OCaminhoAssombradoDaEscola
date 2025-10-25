# Game Store

This directory contains the Zustand-based global state management for "O Caminho Assombrado da Escola".

## Files

- `gameStore.ts` - Main Zustand store with all game state and actions
- `gameValidation.ts` - Utilities for validating game state before transitions
- `example-usage.ts` - Examples of how to use the store in components

## Store Structure

The store manages:

### Player Data
- `firstName`, `lastName` - Player name (Requirement 1.3)
- `character` - Selected character: 'boy' | 'girl' (Requirement 2.4)
- `weapon` - Selected weapon: 'katana' | 'laser' | 'baseball' | 'bazooka' (Requirement 2.4)
- `difficulty` - Selected difficulty: 'easy' | 'medium' | 'impossible' (Requirement 2.6)

### Game Progress
- `lives` - Current player lives (starts at 10, Requirement 7.1)
- `score` - Current player score (starts at 0, Requirement 7.1)
- `gameStatus` - Current game state: 'menu' | 'playing' | 'paused' | 'finished'

### Actions
- `setPlayerName(firstName, lastName)` - Set player name
- `setCharacter(character)` - Set selected character
- `setWeapon(weapon)` - Set selected weapon
- `setDifficulty(difficulty)` - Set selected difficulty
- `updateLives(lives)` - Update current lives
- `updateScore(score)` - Update current score
- `setGameStatus(status)` - Update game status
- `resetGame()` - Reset all state to initial values

## Usage

```typescript
import { useGameStore } from './store/gameStore';

function MyComponent() {
  const { 
    firstName, 
    setPlayerName, 
    resetGame 
  } = useGameStore();
  
  // Use state and actions...
}
```

## Validation

Use `gameValidation.ts` utilities to check if the game state is ready:

```typescript
import { useGameValidation } from './store/gameValidation';

function NavigationComponent() {
  const { isReadyToPlay } = useGameValidation();
  
  if (isReadyToPlay) {
    // Can navigate to game
  }
}
```