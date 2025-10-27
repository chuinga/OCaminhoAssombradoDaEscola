import '@testing-library/jest-dom';

// Mock Phaser for testing
class MockBody {
  public touching = { down: false };
  public velocity = { x: 0, y: 0 };
  
  setCollideWorldBounds = jest.fn();
  setGravityY = jest.fn();
  setSize = jest.fn();
  setOffset = jest.fn();
  setVelocityX = jest.fn();
  setVelocityY = jest.fn();
}

class MockSprite {
  public x: number;
  public y: number;
  public body: MockBody;
  public alpha: number = 1;
  public flipX: boolean = false;
  
  constructor(scene: any, x: number, y: number, texture: string) {
    this.x = x;
    this.y = y;
    this.body = new MockBody();
  }
  
  setAlpha = jest.fn((alpha: number) => { this.alpha = alpha; });
  setFlipX = jest.fn((flip: boolean) => { this.flipX = flip; });
  destroy = jest.fn();
}

(global as any).Phaser = {
  Scene: class MockScene {},
  Game: class MockGame {},
  Physics: {
    Arcade: {
      Body: MockBody,
      Group: class MockGroup {},
      Sprite: MockSprite
    }
  },
  GameObjects: {
    Sprite: MockSprite,
    Group: class MockGroup {},
  },
  Input: {
    Keyboard: {
      KeyCodes: {}
    }
  },
  Math: {
    Between: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
  }
};

// Mock Howler for testing
(global as any).Howl = class MockHowl {
  constructor() {}
  play() {}
  stop() {}
  volume() {}
};