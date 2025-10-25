# AudioManager Documentation

## Overview

The AudioManager is a singleton class that handles all game audio using Howler.js. It provides a centralized system for managing background music and sound effects throughout the game.

## Features

- **Background Music**: Looping ambient sound (wind and crickets)
- **Sound Effects**: Jump, damage, item collection, and weapon-specific sounds
- **Volume Control**: Separate controls for music and sound effects
- **Mute/Unmute**: Global audio muting capability
- **Graceful Degradation**: Game continues to work even if audio files fail to load
- **Memory Management**: Proper cleanup of audio resources

## Requirements Fulfilled

- **11.1**: Looping background music (wind and crickets ambient sound)
- **11.2**: Jump sound effect
- **11.3**: Damage sound effect  
- **11.4**: Item collection sound effect
- **11.5**: Weapon-specific attack sounds (slash, laser, explosion)

## Usage

### Basic Usage

```typescript
import { audioManager } from '../utils/AudioManager';

// Initialize the audio system (call once at game start)
audioManager.initialize();

// Play background music
audioManager.playBackgroundMusic();

// Play sound effects
audioManager.playJumpSound();
audioManager.playDamageSound();
audioManager.playItemCollectSound();

// Play weapon sounds
audioManager.playWeaponSound('katana');    // Plays slash sound
audioManager.playWeaponSound('laser');     // Plays laser sound
audioManager.playWeaponSound('baseball');  // Plays slash sound
audioManager.playWeaponSound('bazooka');   // Plays explosion sound
```

### Volume Control

```typescript
// Set master volume (0.0 to 1.0)
audioManager.setVolume(0.8);

// Set music volume specifically
audioManager.setMusicVolume(0.3);

// Set sound effects volume specifically
audioManager.setSFXVolume(0.7);
```

### Mute Control

```typescript
// Mute all audio
audioManager.mute();

// Unmute all audio
audioManager.unmute();

// Toggle mute state
audioManager.toggleMute();

// Check if muted
const isMuted = audioManager.isMutedState();
```

### Cleanup

```typescript
// Clean up resources when done
audioManager.destroy();
```

## Audio Files

The system expects the following audio files in `/public/assets/audio/`:

### Background Music
- `background-ambient.mp3` - Wind and crickets ambient sound (loops)

### Sound Effects
- `jump.mp3` - Player jump sound
- `damage.mp3` - Player damage sound
- `item-collect.mp3` - Life item collection sound
- `slash.mp3` - Katana and Baseball Bat attack sound
- `laser.mp3` - Laser Gun attack sound
- `explosion.mp3` - Bazooka attack sound

## Error Handling

The AudioManager includes robust error handling:

- **File Loading Errors**: Creates silent placeholder sounds to prevent crashes
- **Playback Errors**: Logs warnings but continues game execution
- **Missing Files**: Graceful degradation with console warnings
- **Browser Compatibility**: Uses Howler.js for cross-browser audio support

## Integration Points

### GameScene Integration

```typescript
// In GameScene.create()
audioManager.initialize();
audioManager.playBackgroundMusic();

// In GameScene.shutdown()
audioManager.stopBackgroundMusic();
```

### Player Integration

```typescript
// In Player.jump()
audioManager.playJumpSound();

// In Player.takeDamage()
audioManager.playDamageSound();

// In Player.attack()
audioManager.playWeaponSound(this.weapon.type);
```

### Life Item Integration

```typescript
// When collecting life items
audioManager.playItemCollectSound();
```

## Testing

The AudioManager includes comprehensive unit tests covering:

- Singleton pattern implementation
- Initialization and cleanup
- Sound playback functionality
- Volume and mute controls
- Error handling scenarios
- Debug information

Run tests with:
```bash
npm test -- --testPathPatterns="AudioManager.test.ts"
```

## Performance Considerations

- **Lazy Loading**: Audio files are loaded only when AudioManager is initialized
- **Memory Management**: Proper cleanup prevents memory leaks
- **Silent Fallbacks**: Failed audio loads create minimal silent sounds instead of errors
- **Single Instance**: Singleton pattern prevents multiple audio managers

## Browser Compatibility

Uses Howler.js which provides:
- Web Audio API support (modern browsers)
- HTML5 Audio fallback (older browsers)
- Mobile device compatibility
- Automatic format selection (MP3, OGG, etc.)