import '@testing-library/jest-dom'

// Mock Phaser for testing
(global as any).Phaser = {
  Scene: class MockScene {},
  Game: class MockGame {},
  Physics: {
    Arcade: {
      Body: class MockBody {},
      Group: class MockGroup {},
    }
  },
  GameObjects: {
    Sprite: class MockSprite {},
    Group: class MockGroup {},
  },
  Input: {
    Keyboard: {
      KeyCodes: {}
    }
  }
}

// Mock Howler for testing
(global as any).Howl = class MockHowl {
  constructor() {}
  play() {}
  stop() {}
  volume() {}
}