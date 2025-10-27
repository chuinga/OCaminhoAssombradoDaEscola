# Sprite Animation System

This document describes the sprite animation system implemented for the Caminho Assombrado Escola game.

## Character Sprites

### Boy Character
- **Idle Animation**: Standing still with subtle breathing
- **Walk Animation**: 2-frame walking cycle with arm and leg movement
- **Jump Animation**: Single frame with raised position and extended limbs
- **Texture Names**: `player_boy`, `player_boy_0`, `player_boy_1`, `player_boy_2`, `player_boy_3`

### Girl Character  
- **Idle Animation**: Standing still with subtle breathing
- **Walk Animation**: 2-frame walking cycle with dress swing and limb movement
- **Jump Animation**: Single frame with raised position and extended limbs
- **Texture Names**: `player_girl`, `player_girl_0`, `player_girl_1`, `player_girl_2`, `player_girl_3`

## Enemy Sprites

### Ghost
- **Float Animation**: 3-frame floating cycle with body bobbing and tail waving
- **Eye Blink**: Subtle blinking animation on frame 1
- **Transparency Effect**: Alpha oscillation for ghostly appearance
- **Texture Names**: `ghost`, `ghost_0`, `ghost_1`, `ghost_2`
- **Animation Speed**: 300ms per frame

### Bat
- **Wing Flap Animation**: 3-frame wing flapping cycle
- **Erratic Movement**: Combined with floating motion for realistic bat behavior
- **Texture Names**: `bat`, `bat_0`, `bat_1`, `bat_2`
- **Animation Speed**: 150ms per frame (fastest)

### Vampire
- **Cape Animation**: 3-frame cape swinging animation
- **Glowing Eyes**: Enhanced red eye glow effect
- **Walking Motion**: Ground-based movement with cape dynamics
- **Texture Names**: `vampire`, `vampire_0`, `vampire_1`, `vampire_2`
- **Animation Speed**: 400ms per frame (dramatic)

### Mummy
- **Bandage Animation**: 3-frame bandage movement with loose strips
- **Eye Glow Pulse**: Pulsing yellow eye glow effect
- **Shuffling Motion**: Slow, deliberate movement animation
- **Texture Names**: `mummy`, `mummy_0`, `mummy_1`, `mummy_2`
- **Animation Speed**: 500ms per frame (slowest)

## Weapon Visual Effects

### Katana
- **Multi-layer Slash**: Silver blade, white glow, yellow sparkles
- **Particle Effects**: 5 sparkle particles with random positioning
- **Arc Animation**: Diagonal slash with fade-out effect

### Baseball Bat
- **Swing Arc**: Brown bat color with arc trajectory
- **Impact Effect**: Yellow impact circle with expansion
- **Motion Lines**: 3 white motion lines for speed effect

### Laser
- **Multi-layer Beam**: Red core, orange glow, yellow outer glow
- **Energy Particles**: 8 particles along beam path with movement
- **Beam Animation**: Full-length instant beam with fade-out

### Bazooka
- **Projectile Trail**: Orange projectile with movement animation
- **Explosion Effect**: Multi-ring explosion with particle burst
- **Particle System**: 12 directional particles with physics

## Animation System Architecture

### Player Animation Management
- **State-based**: Idle, Walk, Jump states
- **Frame Cycling**: Automatic frame advancement based on timers
- **Texture Switching**: Dynamic texture changes based on animation state

### Enemy Animation Management
- **Individual Timers**: Each enemy manages its own animation timing
- **Frame Cycling**: Continuous looping through animation frames
- **Fallback System**: Graceful fallback to main texture if frames missing

### Performance Considerations
- **Texture Reuse**: Base textures used as fallbacks
- **Efficient Updates**: Animation updates only when needed
- **Memory Management**: Graphics objects properly destroyed after use

## Implementation Details

### Sprite Generation
- **Programmatic Creation**: All sprites generated using Phaser Graphics API
- **Multiple Frames**: Each sprite has 3-4 animation frames
- **Consistent Sizing**: Standardized frame dimensions for each sprite type

### Animation Timing
- **Variable Speeds**: Different animation speeds for different entities
- **Delta-based Updates**: Frame-rate independent animation timing
- **Smooth Transitions**: Seamless looping between animation frames

### Visual Effects
- **Layered Effects**: Multiple graphics layers for complex effects
- **Tween Animations**: Phaser tween system for smooth transitions
- **Particle Systems**: Custom particle effects for weapons and impacts