# Implementation Plan

- [x] 1. Set up project structure and dependencies





  - Create Next.js project with TypeScript and Tailwind CSS
  - Install and configure Phaser 3, Zustand, Howler.js, and testing dependencies
  - Set up folder structure for components, game logic, and assets
  - Configure TypeScript types and ESLint rules
  - _Requirements: 10.1, 10.4_

- [x] 2. Implement global state management with Zustand
  - Create GameState store with player data (firstName, lastName, character, weapon, difficulty)
  - Implement state actions for setPlayerName, setCharacter, setWeapon, setDifficulty
  - Add game progress state (lives, score, gameStatus) with update actions
  - Create resetGame action to clear all state
  - _Requirements: 1.3, 2.4, 2.6, 7.1_

- [x] 3. Create navigation pages and routing
- [x] 3.1 Implement home page with leaderboard display
  - Create home page component that fetches and displays top 10 scores
  - Add "Jogar" button that navigates to name input page
  - Implement responsive design for mobile, tablet, and desktop
  - _Requirements: 9.1, 10.1_

- [x] 3.2 Create name input page with validation
  - Build form with firstName and lastName input fields
  - Implement validation that prevents advancing without both fields filled
  - Save names to Zustand state on successful submission
  - Add navigation to character selection page
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 3.3 Build character selection page
  - Create UI for selecting between boy and girl characters
  - Save character choice to Zustand state
  - Add navigation to weapon selection page with state validation
  - _Requirements: 2.1, 2.2_

- [x] 3.4 Implement weapon selection page
  - Create UI for selecting between Katana, Pistola de Laser, Taco de Basebol, Bazuca
  - Display weapon descriptions and characteristics
  - Save weapon choice to Zustand state
  - Add navigation to difficulty selection page
  - _Requirements: 2.3, 2.4_

- [x] 3.5 Create difficulty selection page
  - Build UI for selecting Easy, Medium, or Impossible difficulty
  - Display difficulty descriptions (enemy count and life items)
  - Save difficulty choice to Zustand state
  - Add navigation to game page with complete state validation
  - _Requirements: 12.1, 12.2, 12.3, 2.6_

- [ ] 4. Implement core game entities and physics
- [x] 4.1 Create Player class with movement and combat
  - Implement Player entity with position, lives, score, and weapon properties
  - Add movement methods (move left/right, jump, crouch) with physics
  - Implement attack method that uses selected weapon
  - Add takeDamage method with invulnerability timer (800ms)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.3, 7.4_

- [ ] 4.2 Implement enemy entities with different behaviors
  - Create base Enemy interface and Ghost class (low floating movement)
  - Implement Bat class (low floating movement, similar to Ghost)
  - Create Vampire class (ground walking movement)
  - Implement Mummy class (slow ground walking movement)
  - Add collision detection and damage dealing (all enemies remove 1 life and disappear)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 7.3_

- [ ] 4.3 Create weapon system with different attack types
  - Implement Katana class (40px range, 300ms cooldown, melee)
  - Create LaserGun class (projectile weapon, 500px/s speed, 200ms cooldown)
  - Implement BaseballBat class (55px range, 450ms cooldown, knockback)
  - Create Bazooka class (area damage, 900ms cooldown, 6 ammunition limit)
  - Ensure all weapons eliminate enemies in one hit
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 5. Build game scene and level mechanics
- [ ] 5.1 Create main GameScene with Phaser setup
  - Initialize Phaser scene with 3500x720px world size
  - Set up Arcade Physics with gravity and collision detection
  - Implement parallax background layers (moon_clouds, houses, trees, street)
  - Add camera following player with smooth scrolling
  - _Requirements: 10.4_

- [ ] 5.2 Implement difficulty-based spawning system
  - Create DifficultyConfig interface and configuration objects
  - Implement enemy spawning based on difficulty (easy: 2/1000px, medium: 4/1000px, impossible: 8/1000px)
  - Add life item spawning based on difficulty (easy: 8/1000px, medium: 3/1000px, impossible: 0/1000px)
  - Position life items at heights requiring jumps to collect
  - _Requirements: 12.1, 12.2, 12.3, 6.1_

- [ ] 5.3 Add collision detection and game mechanics
  - Implement player-enemy collision with damage and invulnerability
  - Add player-life item collision with +1 life and +50 points
  - Create school gate collision for game completion (+500 bonus points)
  - Implement enemy elimination on weapon hit (+100 points each)
  - _Requirements: 4.5, 4.6, 6.2, 6.3, 7.2, 7.5_

- [ ] 6. Create game UI and HUD system
- [ ] 6.1 Implement in-game HUD display
  - Create HUD component showing player name, current lives, and score
  - Update HUD in real-time when values change
  - Position HUD appropriately for different screen sizes
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 6.2 Add mobile touch controls
  - Create touch control buttons for mobile and tablet devices
  - Position left-side controls for movement (left/right arrows)
  - Add right-side controls for actions (jump, crouch, attack buttons)
  - Ensure touch controls work responsively across device sizes
  - _Requirements: 10.2_

- [ ] 6.3 Implement keyboard input handling
  - Add keyboard event listeners for A/D (left/right), W/↑ (jump), S/↓ (crouch)
  - Implement Space key for attack and Esc key for pause
  - Ensure keyboard controls work alongside touch controls
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 7. Add audio system with Howler.js
- [ ] 7.1 Implement background music and sound effects
  - Set up Howler.js for audio management
  - Add looping background music (wind and crickets ambient sound)
  - Create sound effect system for jump, damage, and item collection
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 7.2 Add weapon-specific attack sounds
  - Implement slash sound for Katana and Baseball Bat attacks
  - Add laser sound for Pistola de Laser attacks
  - Create explosion sound for Bazooka attacks
  - Ensure sounds play correctly with weapon timing
  - _Requirements: 11.5_

- [ ] 8. Create game completion and results system
- [ ] 8.1 Implement game end conditions
  - Add victory condition when player reaches school gate with lives > 0
  - Implement defeat condition when player lives reach 0
  - Apply +500 bonus points for victory completion
  - Navigate to results page on game end
  - _Requirements: 7.5, 7.6_

- [ ] 8.2 Build results page with score submission
  - Create results page showing final score and game outcome
  - Display all leaderboard scores with scroll functionality
  - Add "Voltar ao início" button to return to home page
  - Reset game state when returning to start
  - _Requirements: 9.3_

- [ ] 9. Implement API client and leaderboard system
- [ ] 9.1 Create API client for score management
  - Build API client functions for GET /api/scores (all scores with pagination)
  - Implement POST /api/scores for submitting new scores
  - Add error handling for network failures and server errors
  - Include retry mechanism with exponential backoff
  - _Requirements: 9.1, 9.2, 9.4_

- [ ] 9.2 Build API routes for AWS integration
  - Create Next.js API routes as proxy to AWS Lambda functions
  - Implement GET /api/scores/top10 endpoint for leaderboard
  - Add GET /api/scores endpoint for full score list with pagination
  - Create POST /api/scores endpoint for score submission
  - _Requirements: 9.1, 9.2, 9.3_

- [ ]* 9.3 Write unit tests for API client
  - Create tests for API client functions with mocked responses
  - Test error handling scenarios (network failures, server errors)
  - Verify retry mechanism and timeout handling
  - Test score validation and data formatting
  - _Requirements: 9.4_

- [ ] 10. Add responsive design and mobile optimization
- [ ] 10.1 Implement responsive layout system
  - Ensure all pages adapt to mobile, tablet, and desktop screen sizes
  - Optimize game canvas scaling for different aspect ratios
  - Test touch interactions on various mobile devices
  - _Requirements: 10.1, 10.4_

- [ ] 10.2 Optimize game performance for mobile
  - Implement sprite pooling for enemies and projectiles
  - Optimize asset loading and memory management
  - Add performance monitoring for frame rate stability
  - _Requirements: 10.4_

- [ ]* 11. Write comprehensive tests
- [ ]* 11.1 Create unit tests for game logic
  - Test weapon mechanics and damage calculations
  - Verify enemy behavior and movement patterns
  - Test collision detection and scoring system
  - _Requirements: 5.5, 4.1-4.4, 7.2_

- [ ]* 11.2 Add integration tests for game flow
  - Test complete gameplay from start to finish
  - Verify state management across page navigation
  - Test API integration with mock backend
  - _Requirements: 1.1-1.3, 2.1-2.6, 7.1-7.6_

- [ ] 12. Prepare for deployment
- [ ] 12.1 Configure build optimization
  - Set up Next.js production build configuration
  - Optimize bundle size with code splitting and tree shaking
  - Compress and optimize game assets (sprites, audio)
  - _Requirements: 10.1, 10.4_

- [ ] 12.2 Set up AWS infrastructure preparation
  - Document AWS CDK stack requirements for S3, CloudFront, API Gateway
  - Prepare environment variables and configuration files
  - Create deployment scripts and documentation
  - _Requirements: 13.1, 13.2, 13.3, 13.4_