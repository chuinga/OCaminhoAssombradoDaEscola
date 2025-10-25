# Touch Controls Component

## Overview

The `TouchControls` component provides mobile and tablet touch controls for the game. It automatically detects mobile devices and renders touch buttons only when needed.

## Features

- **Automatic Mobile Detection**: Only renders on touch devices with screen width ≤ 1024px
- **Responsive Design**: Adapts button sizes for different screen sizes (sm: breakpoint)
- **Left-side Movement Controls**: Left/Right arrow buttons for player movement
- **Right-side Action Controls**: Jump, Crouch, and Attack buttons
- **Touch and Mouse Support**: Handles both touch events and mouse events (for testing)
- **Visual Feedback**: Buttons have hover and active states with backdrop blur effects

## Layout

```
Left Side (Movement):          Right Side (Actions):
┌─────┬─────┐                 ┌─────────┐
│  ←  │  →  │                 │  JUMP   │
└─────┴─────┘                 └─────────┘
                               ┌─────┬─────┐
                               │CROUCH│ATTACK│
                               └─────┴─────┘
```

## Props

- `onMoveLeft: (pressed: boolean) => void` - Called when left movement button is pressed/released
- `onMoveRight: (pressed: boolean) => void` - Called when right movement button is pressed/released
- `onJump: (pressed: boolean) => void` - Called when jump button is pressed/released
- `onCrouch: (pressed: boolean) => void` - Called when crouch button is pressed/released
- `onAttack: (pressed: boolean) => void` - Called when attack button is pressed/released
- `className?: string` - Optional additional CSS classes

## Integration

The component is integrated into the `PhaserGameComponent` and connects to the game scene through the `setTouchControl` method. Touch input is combined with keyboard input in the game's input handling system.

## Styling

- Uses Tailwind CSS for responsive design
- Semi-transparent black background with backdrop blur
- White borders with transparency
- Red styling for the attack button to make it stand out
- Smooth transitions for visual feedback

## Device Detection

The component detects mobile devices using:
- `'ontouchstart' in window` - Checks for touch support
- `navigator.maxTouchPoints > 0` - Checks for touch points
- `window.innerWidth <= 1024` - Includes tablets in mobile detection

## Event Handling

- Prevents default behavior on touch events to avoid scrolling
- Handles touch start/end for press/release detection
- Includes mouse events for desktop testing
- Handles mouse leave to ensure buttons don't get "stuck" pressed