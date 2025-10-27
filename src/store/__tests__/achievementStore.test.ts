import { useAchievementStore } from '../achievementStore';
import { ACHIEVEMENT_DEFINITIONS } from '../../types/achievements';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Achievement Store', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useAchievementStore.setState({
      progress: {},
      notifications: [],
      stats: {
        totalUnlocked: 0,
        totalPoints: 0,
        completionPercentage: 0,
        rareAchievements: 0,
        epicAchievements: 0,
        legendaryAchievements: 0
      },
      sessionStats: {
        enemiesKilled: 0,
        enemiesKilledByType: {},
        enemiesKilledByWeapon: {},
        livesCollected: 0,
        weaponsUsed: new Set<string>(),
        gameStartTime: undefined,
        perfectRun: true,
        bazookaMultiKills: 0
      }
    });
    
    // Clear localStorage mocks
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  describe('Initialization', () => {
    it('should initialize achievements correctly', () => {
      const { initializeAchievements, progress } = useAchievementStore.getState();
      
      initializeAchievements();
      
      const updatedProgress = useAchievementStore.getState().progress;
      
      // Should have progress entries for all achievements
      expect(Object.keys(updatedProgress)).toHaveLength(ACHIEVEMENT_DEFINITIONS.length);
      
      // Each achievement should have correct initial progress
      ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
        expect(updatedProgress[achievement.id]).toEqual({
          achievementId: achievement.id,
          progress: 0,
          maxProgress: achievement.maxProgress || 1,
          unlocked: false
        });
      });
    });
  });

  describe('Achievement Triggers', () => {
    beforeEach(() => {
      const { initializeAchievements } = useAchievementStore.getState();
      initializeAchievements();
    });

    it('should unlock first kill achievement', () => {
      const { triggerAchievementCheck } = useAchievementStore.getState();
      
      triggerAchievementCheck('enemy_killed', 1, { enemyType: 'ghost', weapon: 'katana' });
      
      const { progress, notifications } = useAchievementStore.getState();
      
      // First kill achievement should be unlocked
      expect(progress['first_kill'].unlocked).toBe(true);
      expect(progress['first_kill'].progress).toBe(1);
      
      // Should have a notification
      expect(notifications).toHaveLength(1);
      expect(notifications[0].achievement.id).toBe('first_kill');
    });

    it('should track enemy kills by type', () => {
      const { triggerAchievementCheck } = useAchievementStore.getState();
      
      // Kill 5 ghosts
      for (let i = 0; i < 5; i++) {
        triggerAchievementCheck('enemy_killed', 1, { enemyType: 'ghost', weapon: 'katana' });
      }
      
      const { sessionStats } = useAchievementStore.getState();
      
      expect(sessionStats.enemiesKilled).toBe(5);
      expect(sessionStats.enemiesKilledByType['ghost']).toBe(5);
      expect(sessionStats.enemiesKilledByWeapon['katana']).toBe(5);
    });

    it('should track weapon usage', () => {
      const { triggerAchievementCheck } = useAchievementStore.getState();
      
      triggerAchievementCheck('weapon_used', 1, { weapon: 'katana' });
      triggerAchievementCheck('weapon_used', 1, { weapon: 'laser' });
      triggerAchievementCheck('weapon_used', 1, { weapon: 'baseball' });
      
      const { sessionStats } = useAchievementStore.getState();
      
      expect(sessionStats.weaponsUsed.size).toBe(3);
      expect(sessionStats.weaponsUsed.has('katana')).toBe(true);
      expect(sessionStats.weaponsUsed.has('laser')).toBe(true);
      expect(sessionStats.weaponsUsed.has('baseball')).toBe(true);
    });

    it('should unlock score achievements', () => {
      const { triggerAchievementCheck } = useAchievementStore.getState();
      
      triggerAchievementCheck('score_reached', 5000);
      
      const { progress } = useAchievementStore.getState();
      
      expect(progress['high_scorer'].unlocked).toBe(true);
      expect(progress['high_scorer'].progress).toBe(5000);
    });

    it('should track life collection', () => {
      const { triggerAchievementCheck } = useAchievementStore.getState();
      
      // Collect 10 life items
      for (let i = 0; i < 10; i++) {
        triggerAchievementCheck('life_collected', 1);
      }
      
      const { sessionStats, progress } = useAchievementStore.getState();
      
      expect(sessionStats.livesCollected).toBe(10);
      expect(progress['life_collector'].progress).toBe(10);
    });
  });

  describe('Session Stats', () => {
    it('should reset session stats', () => {
      const { triggerAchievementCheck, resetSessionStats } = useAchievementStore.getState();
      
      // Add some session data
      triggerAchievementCheck('enemy_killed', 5, { enemyType: 'ghost', weapon: 'katana' });
      triggerAchievementCheck('life_collected', 3);
      
      let { sessionStats } = useAchievementStore.getState();
      expect(sessionStats.enemiesKilled).toBe(5);
      expect(sessionStats.livesCollected).toBe(3);
      
      // Reset
      resetSessionStats();
      
      sessionStats = useAchievementStore.getState().sessionStats;
      expect(sessionStats.enemiesKilled).toBe(0);
      expect(sessionStats.livesCollected).toBe(0);
      expect(sessionStats.weaponsUsed.size).toBe(0);
    });
  });

  describe('Achievement Stats', () => {
    beforeEach(() => {
      const { initializeAchievements } = useAchievementStore.getState();
      initializeAchievements();
    });

    it('should calculate stats correctly', () => {
      const { triggerAchievementCheck } = useAchievementStore.getState();
      
      // Unlock a few achievements
      triggerAchievementCheck('enemy_killed', 1, { enemyType: 'ghost', weapon: 'katana' }); // first_kill (common, 10 points)
      triggerAchievementCheck('score_reached', 5000); // high_scorer (rare, 40 points)
      
      const { stats } = useAchievementStore.getState();
      
      expect(stats.totalUnlocked).toBe(2);
      expect(stats.totalPoints).toBe(50); // 10 + 40
      expect(stats.completionPercentage).toBeGreaterThan(0);
    });
  });

  describe('Notifications', () => {
    beforeEach(() => {
      const { initializeAchievements } = useAchievementStore.getState();
      initializeAchievements();
    });

    it('should mark notifications as shown', () => {
      const { triggerAchievementCheck, markNotificationShown } = useAchievementStore.getState();
      
      triggerAchievementCheck('enemy_killed', 1, { enemyType: 'ghost', weapon: 'katana' });
      
      let { notifications } = useAchievementStore.getState();
      expect(notifications[0].shown).toBe(false);
      
      markNotificationShown('first_kill');
      
      notifications = useAchievementStore.getState().notifications;
      expect(notifications[0].shown).toBe(true);
    });

    it('should clear all notifications', () => {
      const { triggerAchievementCheck, clearNotifications } = useAchievementStore.getState();
      
      triggerAchievementCheck('enemy_killed', 1, { enemyType: 'ghost', weapon: 'katana' });
      triggerAchievementCheck('score_reached', 5000);
      
      let { notifications } = useAchievementStore.getState();
      expect(notifications).toHaveLength(2);
      
      clearNotifications();
      
      notifications = useAchievementStore.getState().notifications;
      expect(notifications).toHaveLength(0);
    });
  });
});