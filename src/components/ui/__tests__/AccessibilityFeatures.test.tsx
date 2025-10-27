import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AudioSubtitles } from '../AudioSubtitles';
import { VisualAudioIndicators } from '../VisualAudioIndicators';
import { SimplifiedControls } from '../SimplifiedControls';
import { ColorblindFriendlyUI } from '../ColorblindFriendlyUI';
import { useSettingsStore } from '../../../store/settingsStore';

// Mock the settings store
jest.mock('../../../store/settingsStore');
const mockUseSettingsStore = useSettingsStore as jest.MockedFunction<typeof useSettingsStore>;

describe('Accessibility Features', () => {
  beforeEach(() => {
    mockUseSettingsStore.mockReturnValue({
      display: {
        reducedMotion: false,
        highContrast: false,
        colorBlindMode: 'none',
        showFPS: false,
        particleEffects: true,
        screenShake: true,
        audioSubtitles: true,
        visualAudioIndicators: true,
        colorBlindFriendlyUI: true
      },
      controls: {
        moveLeft: ['KeyA', 'ArrowLeft'],
        moveRight: ['KeyD', 'ArrowRight'],
        jump: ['KeyW', 'ArrowUp', 'Space'],
        crouch: ['KeyS', 'ArrowDown'],
        attack: ['Space'],
        pause: ['Escape', 'KeyP']
      },
      setDisplaySetting: jest.fn(),
      setControlMapping: jest.fn(),
      resetControlsToDefault: jest.fn()
    } as any);
  });

  describe('AudioSubtitles', () => {
    it('should render when audioSubtitles is enabled', async () => {
      render(<AudioSubtitles />);
      
      // Enable subtitles first
      fireEvent(window, new CustomEvent('toggleSubtitles', {
        detail: { enabled: true }
      }));

      // Trigger an audio event
      fireEvent(window, new CustomEvent('audioEvent', {
        detail: { type: 'jump' }
      }));

      // Should show subtitle
      await waitFor(() => {
        expect(screen.getByRole('log')).toBeInTheDocument();
      });
    });

    it('should not render when audioSubtitles is disabled', () => {
      mockUseSettingsStore.mockReturnValue({
        display: { audioSubtitles: false }
      } as any);

      render(<AudioSubtitles />);
      
      // Should not render anything
      expect(screen.queryByRole('log')).not.toBeInTheDocument();
    });

    it('should display correct messages for different audio events', async () => {
      render(<AudioSubtitles />);
      
      // Enable subtitles first
      fireEvent(window, new CustomEvent('toggleSubtitles', {
        detail: { enabled: true }
      }));

      // Test jump event
      fireEvent(window, new CustomEvent('audioEvent', {
        detail: { type: 'jump' }
      }));

      await waitFor(() => {
        expect(screen.getByText('🦘 Salto')).toBeInTheDocument();
      });

      // Test damage event
      fireEvent(window, new CustomEvent('audioEvent', {
        detail: { type: 'damage' }
      }));

      await waitFor(() => {
        expect(screen.getByText('💥 Dano recebido')).toBeInTheDocument();
      });

      // Test weapon attack event
      fireEvent(window, new CustomEvent('audioEvent', {
        detail: { type: 'weapon_attack', weaponType: 'katana' }
      }));

      await waitFor(() => {
        expect(screen.getByText('⚔️ Katana - Corte')).toBeInTheDocument();
      });
    });
  });

  describe('VisualAudioIndicators', () => {
    it('should render visual indicators when enabled', () => {
      render(<VisualAudioIndicators />);
      
      // Trigger a visual indicator event
      fireEvent(window, new CustomEvent('visualIndicator', {
        detail: { 
          type: 'damage',
          position: { x: 50, y: 50 },
          intensity: 'high'
        }
      }));

      // Should render the indicator container
      const container = document.querySelector('.fixed.inset-0');
      expect(container).toBeInTheDocument();
    });

    it('should not render when visualAudioIndicators is disabled', () => {
      mockUseSettingsStore.mockReturnValue({
        display: { visualAudioIndicators: false }
      } as any);

      render(<VisualAudioIndicators />);
      
      // Should return null and not render anything
      expect(screen.queryByText('visual-indicator')).not.toBeInTheDocument();
    });
  });

  describe('SimplifiedControls', () => {
    it('should render control schemes', () => {
      render(<SimplifiedControls />);
      
      expect(screen.getByText('Esquemas de Controlo Simplificados')).toBeInTheDocument();
      expect(screen.getByText('Controlos Padrão')).toBeInTheDocument();
      expect(screen.getByText('Uma Mão (Esquerda)')).toBeInTheDocument();
      expect(screen.getByText('Uma Mão (Direita)')).toBeInTheDocument();
      expect(screen.getByText('Controlos Mínimos')).toBeInTheDocument();
      expect(screen.getByText('Teclas Grandes')).toBeInTheDocument();
    });

    it('should apply control scheme when clicked', () => {
      const mockSetControlMapping = jest.fn();
      mockUseSettingsStore.mockReturnValue({
        controls: {
          moveLeft: ['KeyA'],
          moveRight: ['KeyD'],
          jump: ['Space'],
          crouch: ['KeyS'],
          attack: ['Space'],
          pause: ['Escape']
        },
        setControlMapping: mockSetControlMapping,
        resetControlsToDefault: jest.fn()
      } as any);

      render(<SimplifiedControls />);
      
      // Click on one-handed left scheme
      const oneHandedScheme = screen.getByText('Uma Mão (Esquerda)').closest('[role="button"]');
      fireEvent.click(oneHandedScheme!);

      // Should call setControlMapping for each control
      expect(mockSetControlMapping).toHaveBeenCalled();
    });
  });

  describe('ColorblindFriendlyUI', () => {
    it('should render children normally when disabled', () => {
      mockUseSettingsStore.mockReturnValue({
        display: { colorBlindFriendlyUI: false }
      } as any);

      render(
        <ColorblindFriendlyUI>
          <div>Test Content</div>
        </ColorblindFriendlyUI>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should apply colorblind-friendly class when enabled', () => {
      render(
        <ColorblindFriendlyUI>
          <div>Test Content</div>
        </ColorblindFriendlyUI>
      );
      
      const container = document.querySelector('.colorblind-friendly-ui');
      expect(container).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });
});

// Integration test for accessibility features
describe('Accessibility Integration', () => {
  it('should work together without conflicts', () => {
    render(
      <ColorblindFriendlyUI>
        <AudioSubtitles />
        <VisualAudioIndicators />
        <SimplifiedControls />
      </ColorblindFriendlyUI>
    );

    // All components should render without errors
    expect(screen.getByText('Esquemas de Controlo Simplificados')).toBeInTheDocument();
    
    // Test that events work together
    fireEvent(window, new CustomEvent('toggleSubtitles', {
      detail: { enabled: true }
    }));

    fireEvent(window, new CustomEvent('audioEvent', {
      detail: { type: 'jump' }
    }));

    fireEvent(window, new CustomEvent('visualIndicator', {
      detail: { type: 'jump', intensity: 'low' }
    }));

    // Should not throw any errors
    expect(document.body).toBeInTheDocument();
  });
});