# O Caminho Assombrado da Escola

A Halloween-themed 2D side-scrolling web game built with Next.js, Phaser 3, and TypeScript.

## Overview

"O Caminho Assombrado da Escola" is a responsive web game where a child must navigate from home to school during the day, avoiding monsters and collecting life items. The game features character customization, weapon selection, difficulty levels, and a cloud-based leaderboard system.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Game Engine**: Phaser 3 (Arcade Physics)
- **State Management**: Zustand
- **Audio**: Howler.js
- **Testing**: Jest + React Testing Library
- **Backend**: AWS Lambda + API Gateway + DynamoDB (planned)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── game/              # Game-specific components
│   └── forms/             # Form components
├── game/                  # Phaser game logic
│   ├── scenes/            # Game scenes
│   ├── entities/          # Game entities (Player, Enemies, Items)
│   ├── weapons/           # Weapon implementations
│   └── utils/             # Game utilities
├── store/                 # Zustand stores
├── lib/                   # Utilities and API clients
└── types/                 # TypeScript type definitions
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) to see the game.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## Game Features

- Character selection (boy/girl)
- Weapon selection (Katana, Laser Gun, Baseball Bat, Bazooka)
- Difficulty levels (Easy, Medium, Impossible)
- Responsive design for mobile, tablet, and desktop
- Touch controls for mobile devices
- Audio system with background music and sound effects
- Leaderboard system with score persistence

## Development

This project follows a spec-driven development approach. See the `.kiro/specs/caminho-assombrado-escola/` directory for detailed requirements, design, and implementation tasks.
