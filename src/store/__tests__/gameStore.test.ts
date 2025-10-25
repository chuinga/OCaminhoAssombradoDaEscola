import { useGameStore } from '../gameStore';
import { act, renderHook } from '@testing-library/react';

describe('GameStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useGameStore());
    act(() => {
      result.current.resetGame();
    });
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useGameStore());
    
    expect(result.current.firstName).toBe('');
    expect(result.current.lastName).toBe('');
    expect(result.current.character).toBe(null);
    expect(result.current.weapon).toBe(null);
    expect(result.current.difficulty).toBe(null);
    expect(result.current.lives).toBe(10);
    expect(result.current.score).toBe(0);
    expect(result.current.gameStatus).toBe('menu');
  });

  it('should set player name correctly', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.setPlayerName('João', 'Silva');
    });
    
    expect(result.current.firstName).toBe('João');
    expect(result.current.lastName).toBe('Silva');
  });

  it('should set character correctly', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.setCharacter('boy');
    });
    
    expect(result.current.character).toBe('boy');
  });

  it('should set weapon correctly', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.setWeapon('katana');
    });
    
    expect(result.current.weapon).toBe('katana');
  });

  it('should set difficulty correctly', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.setDifficulty('medium');
    });
    
    expect(result.current.difficulty).toBe('medium');
  });

  it('should update lives correctly', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.updateLives(8);
    });
    
    expect(result.current.lives).toBe(8);
  });

  it('should update score correctly', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.updateScore(150);
    });
    
    expect(result.current.score).toBe(150);
  });

  it('should set game status correctly', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.setGameStatus('playing');
    });
    
    expect(result.current.gameStatus).toBe('playing');
  });

  it('should reset game state correctly', () => {
    const { result } = renderHook(() => useGameStore());
    
    // Set some values
    act(() => {
      result.current.setPlayerName('Test', 'User');
      result.current.setCharacter('girl');
      result.current.setWeapon('laser');
      result.current.setDifficulty('impossible');
      result.current.updateLives(5);
      result.current.updateScore(500);
      result.current.setGameStatus('playing');
    });
    
    // Reset the game
    act(() => {
      result.current.resetGame();
    });
    
    // Verify all values are back to initial state
    expect(result.current.firstName).toBe('');
    expect(result.current.lastName).toBe('');
    expect(result.current.character).toBe(null);
    expect(result.current.weapon).toBe(null);
    expect(result.current.difficulty).toBe(null);
    expect(result.current.lives).toBe(10);
    expect(result.current.score).toBe(0);
    expect(result.current.gameStatus).toBe('menu');
  });
});