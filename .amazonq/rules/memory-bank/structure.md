# Project Structure

## Directory Organization

### Core Application (`src/app/`)
- **Pages**: Next.js App Router pages for game flow (character selection, weapon choice, difficulty, gameplay)
- **API Routes**: RESTful endpoints for analytics, scores, leaderboard, and health checks
- **Layout**: Global application layout and styling

### React Components (`src/components/`)
- **UI Components** (`ui/`): Reusable interface elements with accessibility features
- **Game Components** (`game/`): Phaser integration, HUD, touch controls, performance monitoring
- **Achievements** (`achievements/`): Progress tracking and notification system
- **Analytics** (`analytics/`): Performance and usage monitoring dashboards

### Game Engine (`src/game/`)
- **Scenes** (`scenes/`): Phaser game scenes with collision detection and input handling
- **Entities** (`entities/`): Game objects (Player, Enemies, Items) with behavior systems
- **Weapons** (`weapons/`): Weapon implementations with unique mechanics and effects
- **Utils** (`utils/`): Audio management, asset loading, sprite pooling

### State Management (`src/store/`)
- **Game Store**: Player progress, scores, settings persistence
- **Achievement Store**: Progress tracking and reward management
- **Audio Store**: Sound preferences and accessibility settings
- **Performance Store**: Optimization settings and monitoring data

### Utilities (`src/lib/`, `src/utils/`, `src/hooks/`)
- **API Clients**: AWS integration and analytics
- **Performance**: Optimization utilities and monitoring
- **Responsive Hooks**: Device detection and adaptation
- **Accessibility**: Feature detection and enhancement

### Testing (`src/test/`, `__tests__/`)
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API, game flow, and state persistence
- **Performance Tests**: Load testing and optimization validation

## Architectural Patterns

### Component Architecture
- **Separation of Concerns**: Clear division between React UI and Phaser game logic
- **Composition Pattern**: Reusable UI components with consistent interfaces
- **Provider Pattern**: Context-based accessibility and settings management

### Game Architecture
- **Entity-Component System**: Modular game objects with composable behaviors
- **Scene Management**: Phaser scenes with lifecycle management
- **Factory Pattern**: Dynamic entity and weapon creation

### State Architecture
- **Zustand Stores**: Lightweight state management with persistence
- **Validation Layer**: Type-safe state updates and data integrity
- **Performance Optimization**: Selective re-rendering and state batching