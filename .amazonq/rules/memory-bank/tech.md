# Technology Stack

## Core Technologies

### Frontend Framework
- **Next.js 16.0.0**: App Router with React 19.2.0 for modern web application architecture
- **TypeScript 5**: Type safety and enhanced developer experience
- **Tailwind CSS 4**: Utility-first styling with responsive design

### Game Engine
- **Phaser 3.90.0**: 2D game framework with Arcade Physics
- **Howler.js 2.2.4**: Cross-platform audio library with accessibility features

### State Management
- **Zustand 5.0.8**: Lightweight state management with persistence
- **React Context**: Accessibility and settings providers

### UI Components
- **Radix UI**: Accessible component primitives (Progress, Slot)
- **Lucide React**: Consistent icon system
- **Class Variance Authority**: Type-safe component variants

## Development Tools

### Testing Framework
- **Jest 30.2.0**: Unit testing with coverage reporting
- **React Testing Library 16.3.0**: Component testing utilities
- **@testing-library/jest-dom**: Extended Jest matchers

### Build System
- **Next.js Build**: Optimized production builds with code splitting
- **TypeScript Compiler**: Type checking and compilation
- **ESLint 9**: Code quality and consistency

### Development Dependencies
- **Babel React Compiler**: Experimental React optimizations
- **PostCSS**: CSS processing and optimization
- **Source Map Support**: Enhanced debugging experience

## Backend Infrastructure (Planned)
- **AWS Lambda**: Serverless functions for API endpoints
- **API Gateway**: RESTful API management
- **DynamoDB**: NoSQL database for scores and user data
- **AWS CDK**: Infrastructure as code

## Development Commands

### Core Scripts
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Testing Scripts
```bash
npm run test         # Run all tests
npm run test:watch   # Watch mode testing
npm run test:coverage # Coverage reporting
```

## Performance Optimizations
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js built-in optimization
- **Bundle Analysis**: Performance monitoring and optimization
- **Sprite Pooling**: Game object reuse for memory efficiency