import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Control key mappings
export interface ControlMapping {
  moveLeft: string[];
  moveRight: string[];
  jump: string[];
  crouch: string[];
  attack: string[];
  pause: string[];
}

// Display settings
export interface DisplaySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  showFPS: boolean;
  particleEffects: boolean;
  screenShake: boolean;
}

// Game settings
export interface GameSettings {
  showDifficultyPreview: boolean;
  showControlHints: boolean;
  pauseOnFocusLoss: boolean;
  autoSave: boolean;
}

// Complete settings interface
interface SettingsState {
  // Control settings
  controls: ControlMapping;
  
  // Display settings
  display: DisplaySettings;
  
  // Game settings
  game: GameSettings;
  
  // Actions
  setControlMapping: (action: keyof ControlMapping, keys: string[]) => void;
  resetControlsToDefault: () => void;
  setDisplaySetting: <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => void;
  setGameSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  resetAllSettings: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

// Default settings
const defaultControls: ControlMapping = {
  moveLeft: ['KeyA', 'ArrowLeft'],
  moveRight: ['KeyD', 'ArrowRight'],
  jump: ['KeyW', 'ArrowUp', 'Space'],
  crouch: ['KeyS', 'ArrowDown'],
  attack: ['Space'],
  pause: ['Escape', 'KeyP']
};

const defaultDisplay: DisplaySettings = {
  reducedMotion: false,
  highContrast: false,
  colorBlindMode: 'none',
  showFPS: false,
  particleEffects: true,
  screenShake: true
};

const defaultGame: GameSettings = {
  showDifficultyPreview: true,
  showControlHints: true,
  pauseOnFocusLoss: true,
  autoSave: true
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      controls: defaultControls,
      display: defaultDisplay,
      game: defaultGame,
      
      setControlMapping: (action: keyof ControlMapping, keys: string[]) => {
        set((state) => ({
          controls: {
            ...state.controls,
            [action]: keys
          }
        }));
      },
      
      resetControlsToDefault: () => {
        set({ controls: defaultControls });
      },
      
      setDisplaySetting: <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => {
        set((state) => ({
          display: {
            ...state.display,
            [key]: value
          }
        }));
      },
      
      setGameSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
        set((state) => ({
          game: {
            ...state.game,
            [key]: value
          }
        }));
      },
      
      resetAllSettings: () => {
        set({
          controls: defaultControls,
          display: defaultDisplay,
          game: defaultGame
        });
      },
      
      exportSettings: () => {
        const state = get();
        return JSON.stringify({
          controls: state.controls,
          display: state.display,
          game: state.game
        }, null, 2);
      },
      
      importSettings: (settingsJson: string) => {
        try {
          const settings = JSON.parse(settingsJson);
          if (settings.controls && settings.display && settings.game) {
            set({
              controls: { ...defaultControls, ...settings.controls },
              display: { ...defaultDisplay, ...settings.display },
              game: { ...defaultGame, ...settings.game }
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      }
    }),
    {
      name: 'caminho-assombrado-settings',
      version: 1,
    }
  )
);

// Difficulty preview data
export const DIFFICULTY_PREVIEW = {
  easy: {
    name: 'Fácil',
    description: 'Perfeito para iniciantes',
    enemyCount: '2 inimigos por 1000px',
    lifeItems: '8 itens de vida por 1000px',
    enemyTypes: ['Fantasma', 'Morcego'],
    color: 'text-green-400'
  },
  medium: {
    name: 'Médio',
    description: 'Desafio equilibrado',
    enemyCount: '4 inimigos por 1000px',
    lifeItems: '3 itens de vida por 1000px',
    enemyTypes: ['Fantasma', 'Morcego', 'Vampiro', 'Múmia'],
    color: 'text-yellow-400'
  },
  impossible: {
    name: 'Impossível',
    description: 'Apenas para os mais corajosos',
    enemyCount: '8 inimigos por 1000px',
    lifeItems: '0 itens de vida',
    enemyTypes: ['Vampiro', 'Múmia', 'Fantasma', 'Morcego'],
    color: 'text-red-400'
  }
} as const;

// Control key display names
export const KEY_DISPLAY_NAMES: Record<string, string> = {
  'KeyA': 'A',
  'KeyD': 'D',
  'KeyW': 'W',
  'KeyS': 'S',
  'ArrowLeft': '←',
  'ArrowRight': '→',
  'ArrowUp': '↑',
  'ArrowDown': '↓',
  'Space': 'Espaço',
  'Escape': 'Esc',
  'KeyP': 'P',
  'Enter': 'Enter',
  'Shift': 'Shift',
  'Control': 'Ctrl',
  'Alt': 'Alt'
};