import { analyticsService } from '@/lib/analytics';

// Mock localStorage for testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock requestAnimationFrame for testing
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 1000000
    }
  }
});

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

describe('Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    analyticsService.clearData();
  });

  describe('Player Progression Tracking', () => {
    it('should track player progression events', () => {
      analyticsService.trackProgression('easy', 1000, 8);
      
      const summary = analyticsService.getAnalyticsSummary();
      expect(summary.totalProgressionEvents).toBe(1);
    });

    it('should calculate average scores by difficulty', () => {
      analyticsService.trackGameCompletion('easy', 1000, true);
      analyticsService.trackGameCompletion('easy', 2000, true);
      
      const summary = analyticsService.getAnalyticsSummary();
      expect(summary.averageScores.easy).toBe(1500);
    });
  });

  describe('Weapon Usage Tracking', () => {
    it('should track weapon usage statistics', () => {
      analyticsService.trackWeaponUsage('katana');
      analyticsService.trackWeaponUsage('katana');
      analyticsService.trackWeaponUsage('laser');
      
      const summary = analyticsService.getAnalyticsSummary();
      const katanaUsage = summary.weaponUsage.find(w => w.weapon === 'katana');
      const laserUsage = summary.weaponUsage.find(w => w.weapon === 'laser');
      
      expect(katanaUsage?.count).toBe(2);
      expect(laserUsage?.count).toBe(1);
      expect(katanaUsage?.percentage).toBeCloseTo(66.67, 1);
    });
  });

  describe('Completion Rate Tracking', () => {
    it('should calculate completion rates by difficulty', () => {
      // Add some completions
      analyticsService.trackGameCompletion('medium', 1500, true);
      analyticsService.trackGameCompletion('medium', 800, false);
      analyticsService.trackGameCompletion('medium', 2000, true);
      
      const summary = analyticsService.getAnalyticsSummary();
      expect(summary.completionRates.medium).toBeCloseTo(66.67, 1);
    });
  });

  describe('Performance Metrics', () => {
    it('should track performance metrics', () => {
      analyticsService.trackPerformanceMetrics(150);
      
      const summary = analyticsService.getAnalyticsSummary();
      expect(summary.performance.averageLoadTime).toBe(150);
    });
  });

  describe('Session Management', () => {
    it('should set session information', () => {
      analyticsService.setSessionInfo('boy', 'katana', 'easy');
      
      const summary = analyticsService.getAnalyticsSummary();
      expect(summary.session.character).toBe('boy');
      expect(summary.session.weapon).toBe('katana');
      expect(summary.session.difficulty).toBe('easy');
    });
  });

  describe('Data Export/Import', () => {
    it('should export analytics data', () => {
      analyticsService.trackProgression('hard', 500, 5);
      analyticsService.trackWeaponUsage('bazooka');
      
      const exportedData = analyticsService.exportData();
      expect(exportedData.progression).toHaveLength(1);
      expect(exportedData.weaponUsage.get('bazooka')).toBe(1);
    });

    it('should clear all data', () => {
      analyticsService.trackProgression('easy', 1000, 8);
      analyticsService.trackWeaponUsage('katana');
      
      analyticsService.clearData();
      
      const summary = analyticsService.getAnalyticsSummary();
      expect(summary.totalProgressionEvents).toBe(0);
      expect(summary.weaponUsage).toHaveLength(0);
    });
  });
});