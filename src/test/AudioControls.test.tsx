/**
 * Test AudioControls component functionality
 * Requirements: 11.1
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AudioControls } from '../components/ui/AudioControls';

// Mock the audio store
jest.mock('../store/audioStore', () => ({
  useAudioStore: () => ({
    masterVolume: 1.0,
    musicVolume: 0.3,
    sfxVolume: 0.7,
    isMuted: false,
    isMusicMuted: false,
    isSfxMuted: false,
    setMasterVolume: jest.fn(),
    setMusicVolume: jest.fn(),
    setSfxVolume: jest.fn(),
    toggleMute: jest.fn(),
    toggleMusicMute: jest.fn(),
    toggleSfxMute: jest.fn(),
    resetToDefaults: jest.fn(),
  })
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Volume2: () => <div data-testid="volume2-icon">Volume2</div>,
  VolumeX: () => <div data-testid="volumex-icon">VolumeX</div>,
  Music: () => <div data-testid="music-icon">Music</div>,
  Volume1: () => <div data-testid="volume1-icon">Volume1</div>,
}));

describe('AudioControls Component', () => {
  it('should render full audio controls by default', () => {
    render(<AudioControls />);
    
    expect(screen.getByText('Controlos de Áudio')).toBeInTheDocument();
    expect(screen.getByText('Volume Geral')).toBeInTheDocument();
    expect(screen.getByText('Música')).toBeInTheDocument();
    expect(screen.getByText('Efeitos Sonoros')).toBeInTheDocument();
    expect(screen.getByText('Restaurar Padrões')).toBeInTheDocument();
  });

  it('should render compact controls when compact prop is true', () => {
    render(<AudioControls compact={true} />);
    
    expect(screen.queryByText('Controlos de Áudio')).not.toBeInTheDocument();
    expect(screen.queryByText('Volume Geral')).not.toBeInTheDocument();
    
    // Should still have volume controls
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('should hide labels when showLabels is false', () => {
    render(<AudioControls showLabels={false} />);
    
    expect(screen.queryByText('Controlos de Áudio')).not.toBeInTheDocument();
    expect(screen.getByText('Volume Geral')).toBeInTheDocument(); // Individual labels still show
  });

  it('should display correct volume percentages', () => {
    render(<AudioControls />);
    
    // Check for specific volume percentages (using getAllByText since there are multiple 100% labels)
    const hundredPercents = screen.getAllByText('100%');
    expect(hundredPercents.length).toBeGreaterThan(0);
    
    // Check for 30% (music volume at 0.3)
    expect(screen.getByText('30%')).toBeInTheDocument();
    
    // Check for 70% (SFX volume at 0.7)
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('should have volume sliders with correct values', () => {
    render(<AudioControls />);
    
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(3); // Master, Music, SFX
    
    // Check slider values
    expect(sliders[0]).toHaveValue('1'); // Master volume
    expect(sliders[1]).toHaveValue('0.3'); // Music volume
    expect(sliders[2]).toHaveValue('0.7'); // SFX volume
  });

  it('should have mute buttons for each audio type', () => {
    render(<AudioControls />);
    
    const muteButtons = screen.getAllByRole('button');
    // Should have 4 buttons: 3 mute buttons + 1 reset button
    expect(muteButtons.length).toBeGreaterThanOrEqual(4);
  });

  it('should apply custom className', () => {
    const { container } = render(<AudioControls className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});