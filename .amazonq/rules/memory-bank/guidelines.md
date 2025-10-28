# Development Guidelines

## Code Quality Standards

### TypeScript Usage
- **Strict Type Safety**: All files use TypeScript with strict typing, no `any` types without explicit reasoning
- **Interface Definitions**: Complex objects use well-defined interfaces (e.g., `PerformanceMetrics`, `Achievement`, `ResponsiveState`)
- **Generic Types**: Utility functions leverage generics for type safety (`ObjectPool<T>`, `throttle<T>`)
- **Optional Properties**: Interfaces use optional properties (`?`) appropriately for flexible APIs

### Naming Conventions
- **Classes**: PascalCase with descriptive names (`AdvancedPerformanceMonitor`, `GameScene`, `MemoryManager`)
- **Methods**: camelCase with action-oriented names (`handleInput`, `updateSpawning`, `triggerAchievement`)
- **Constants**: UPPER_SNAKE_CASE for static definitions (`ACHIEVEMENT_DEFINITIONS`, `WORLD_WIDTH`)
- **Private Members**: Prefixed with `private` keyword, descriptive names (`performanceMonitor`, `touchControls`)

### Documentation Standards
- **JSDoc Comments**: Comprehensive documentation for public methods with parameter descriptions
- **Requirement References**: Comments link to specific requirements (`// Requirements: 3.1, 3.2, 3.3`)
- **Code Sections**: Logical grouping with descriptive comment headers
- **Complex Logic**: Inline comments explaining non-obvious implementations

## Architectural Patterns

### Class Design Patterns
- **Singleton Pattern**: Used for shared resources (`MemoryManager.getInstance()`, `PerformanceDebugger.getInstance()`)
- **Factory Pattern**: Entity creation through dedicated factories (`EnemyFactory`, `WeaponFactory`, `LifeItemFactory`)
- **Observer Pattern**: Event-driven communication between game components
- **Strategy Pattern**: Different behaviors based on configuration (difficulty settings, game modes)

### State Management
- **Zustand Integration**: Game state managed through Zustand stores with persistence
- **Immutable Updates**: State changes follow immutable patterns
- **Type-Safe Actions**: Store actions are strongly typed with clear interfaces
- **Performance Optimization**: State updates batched to minimize re-renders

### Error Handling
- **Graceful Degradation**: Features degrade gracefully when dependencies unavailable
- **Try-Catch Blocks**: Critical operations wrapped in error handling
- **Fallback Values**: Default values provided for optional features
- **Console Logging**: Structured logging for debugging and monitoring

## Performance Optimization Patterns

### Memory Management
- **Object Pooling**: Reusable objects managed through `ObjectPool<T>` class
- **Resource Cleanup**: Explicit cleanup in destroy methods and event handlers
- **Lazy Loading**: Resources loaded on-demand rather than upfront
- **Cache Management**: LRU-style caching with automatic cleanup

### Rendering Optimization
- **Frame Skipping**: Conditional updates based on performance metrics
- **Culling Systems**: Off-screen objects disabled rather than destroyed
- **Batch Operations**: Multiple operations combined into single calls
- **Adaptive Quality**: Dynamic quality adjustment based on performance

### Event Handling
- **Throttling**: High-frequency events throttled using utility functions
- **Debouncing**: User input debounced to prevent excessive processing
- **Event Cleanup**: Listeners properly removed in cleanup methods
- **Conditional Processing**: Event handlers skip processing when appropriate

## Testing Patterns

### Test Structure
- **Describe Blocks**: Logical grouping of related tests
- **Mock Objects**: Comprehensive mocking of dependencies
- **Requirement Mapping**: Tests explicitly verify requirement compliance
- **Integration Testing**: Combined keyboard/touch input testing

### Test Data Management
- **Setup/Teardown**: Consistent test environment setup with `beforeEach`
- **Mock Cleanup**: `jest.clearAllMocks()` called between tests
- **State Isolation**: Each test starts with clean state
- **Realistic Scenarios**: Tests simulate actual user interactions

## React Integration Patterns

### Hook Usage
- **Custom Hooks**: Reusable logic extracted into custom hooks (`useResponsive`, `useBreakpoint`)
- **Effect Dependencies**: Proper dependency arrays in `useEffect`
- **State Initialization**: Sensible default values for hook state
- **Cleanup Functions**: Effect cleanup functions properly implemented

### Component Communication
- **Event Emission**: Game events emitted to React components
- **Window Events**: Custom events dispatched for cross-component communication
- **State Synchronization**: Game state synchronized with React state stores
- **Type Safety**: Event payloads strongly typed

## Code Organization

### File Structure
- **Feature Grouping**: Related functionality grouped in directories
- **Clear Separation**: Game logic separated from UI components
- **Index Files**: Barrel exports for clean imports
- **Test Collocation**: Tests placed near source files

### Import/Export Patterns
- **Named Exports**: Prefer named exports over default exports
- **Barrel Exports**: Use index files to simplify imports
- **Type-Only Imports**: Import types separately when needed
- **Dependency Management**: Clear separation of internal vs external dependencies

### Constants and Configuration
- **Centralized Configuration**: Game settings in dedicated configuration objects
- **Environment Awareness**: Code adapts to browser/server environments
- **Feature Flags**: Conditional features based on capability detection
- **Default Values**: Sensible defaults for all configurable options