import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Achievement, 
  AchievementProgress, 
  AchievementNotification, 
  AchievementStats,
  AchievementTrigger,
  ACHIEVEMENT_DEFINITIONS,
  ACHIEVEMENT_CONDITIONS
} from '../types/achievements';

interface AchievementState {
  // Achievement progress tracking
  progress: Record<string, AchievementProgress>;
  notifications: AchievementNotification[];
  stats: AchievementStats;
  
  // Session tracking for achievements
  sessionStats: {
    enemiesKilled: number;
    enemiesKilledByType: Record<string, number>;
    enemiesKilledByWeapon: Record<string, number>;
    livesCollected: number;
    weaponsUsed: Set<string>;
    gameStartTime?: number;
    perfectRun: boolean;
    bazookaMultiKills: number;
  };
  
  // Actions
  initializeAchievements: () => void;
  triggerAchievementCheck: (trigger: AchievementTrigger, value?: number, metadata?: Record<string, any>) => void;
  markNotificationShown: (achievementId: string) => void;
  clearNotifications: () => void;
  resetSessionStats: () => void;
  getUnlockedAchievements: () => Achievement[];
  getAchievementStats: () => AchievementStats;
}

const initialSessionStats = {
  enemiesKilled: 0,
  enemiesKilledByType: {},
  enemiesKilledByWeapon: {},
  livesCollected: 0,
  weaponsUsed: new Set<string>(),
  gameStartTime: undefined,
  perfectRun: true,
  bazookaMultiKills: 0
};

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
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
      sessionStats: { ...initialSessionStats },

      initializeAchievements: () => {
        set((state) => {
          const newProgress = { ...state.progress };
          
          // Initialize progress for all achievements if not already present
          ACHIEVEMENT_DEFINITIONS.forEach((achievement) => {
            if (!newProgress[achievement.id]) {
              newProgress[achievement.id] = {
                achievementId: achievement.id,
                progress: 0,
                maxProgress: achievement.maxProgress || 1,
                unlocked: false
              };
            }
          });
          
          return {
            progress: newProgress,
            stats: calculateStats(newProgress)
          };
        });
      },

      triggerAchievementCheck: (trigger: AchievementTrigger, value = 1, metadata = {}) => {
        set((state) => {
          const newState = { ...state };
          const newNotifications: AchievementNotification[] = [];
          
          // Update session stats based on trigger
          updateSessionStats(newState.sessionStats, trigger, value, metadata);
          
          // Check each achievement for completion
          ACHIEVEMENT_DEFINITIONS.forEach((achievement) => {
            const conditions = ACHIEVEMENT_CONDITIONS[achievement.id];
            if (!conditions) return;
            
            const progress = newState.progress[achievement.id];
            if (!progress || progress.unlocked) return;
            
            // Check if this trigger matches any condition for this achievement
            const matchingCondition = conditions.find(condition => condition.trigger === trigger);
            if (!matchingCondition) return;
            
            // Calculate progress based on the trigger and conditions
            const newProgress = calculateAchievementProgress(
              achievement,
              matchingCondition,
              trigger,
              value,
              metadata,
              newState.sessionStats
            );
            
            // Update progress
            newState.progress[achievement.id] = {
              ...progress,
              progress: newProgress
            };
            
            // Check if achievement is now unlocked
            if (newProgress >= (achievement.maxProgress || 1) && !progress.unlocked) {
              newState.progress[achievement.id].unlocked = true;
              newState.progress[achievement.id].unlockedAt = new Date().toISOString();
              
              // Add notification
              newNotifications.push({
                achievement,
                timestamp: Date.now(),
                shown: false
              });
              
              // Announce achievement for screen readers
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('screenReaderAnnounce', {
                  detail: { 
                    message: `Conquista desbloqueada: ${achievement.name} - ${achievement.description}`,
                    priority: 'assertive'
                  }
                }));
              }
            }
          });
          
          return {
            ...newState,
            notifications: [...newState.notifications, ...newNotifications],
            stats: calculateStats(newState.progress)
          };
        });
      },

      markNotificationShown: (achievementId: string) => {
        set((state) => ({
          notifications: state.notifications.map(notification =>
            notification.achievement.id === achievementId
              ? { ...notification, shown: true }
              : notification
          )
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      resetSessionStats: () => {
        set({ sessionStats: { ...initialSessionStats } });
      },

      getUnlockedAchievements: () => {
        const state = get();
        return ACHIEVEMENT_DEFINITIONS.filter(achievement => 
          state.progress[achievement.id]?.unlocked
        );
      },

      getAchievementStats: () => {
        return get().stats;
      }
    }),
    {
      name: 'achievement-storage',
      // Only persist progress and stats, not session data or notifications
      partialize: (state) => ({
        progress: state.progress,
        stats: state.stats
      })
    }
  )
);

// Helper function to update session stats
function updateSessionStats(
  sessionStats: any,
  trigger: AchievementTrigger,
  value: number,
  metadata: Record<string, any>
): void {
  switch (trigger) {
    case 'enemy_killed':
      sessionStats.enemiesKilled += value;
      
      if (metadata.enemyType) {
        sessionStats.enemiesKilledByType[metadata.enemyType] = 
          (sessionStats.enemiesKilledByType[metadata.enemyType] || 0) + value;
      }
      
      if (metadata.weapon) {
        sessionStats.enemiesKilledByWeapon[metadata.weapon] = 
          (sessionStats.enemiesKilledByWeapon[metadata.weapon] || 0) + value;
      }
      
      if (metadata.weapon === 'bazooka' && metadata.multiKill) {
        sessionStats.bazookaMultiKills = Math.max(sessionStats.bazookaMultiKills, value);
      }
      break;
      
    case 'life_collected':
      sessionStats.livesCollected += value;
      break;
      
    case 'weapon_used':
      if (metadata.weapon) {
        sessionStats.weaponsUsed.add(metadata.weapon);
      }
      break;
      
    case 'game_started':
      sessionStats.gameStartTime = Date.now();
      sessionStats.perfectRun = true;
      break;
      
    case 'damage_taken':
      sessionStats.perfectRun = false;
      break;
  }
}

// Helper function to calculate achievement progress
function calculateAchievementProgress(
  achievement: Achievement,
  condition: any,
  trigger: AchievementTrigger,
  value: number,
  metadata: Record<string, any>,
  sessionStats: any
): number {
  switch (achievement.id) {
    case 'first_kill':
    case 'survivor':
    case 'iron_will':
    case 'speed_runner':
    case 'perfectionist':
    case 'bazooka_expert':
    case 'brave_boy':
    case 'brave_girl':
      // Binary achievements - either 0 or max progress
      return checkCondition(condition, trigger, value, metadata, sessionStats) ? 
        (achievement.maxProgress || 1) : 0;
      
    case 'enemy_slayer':
      return sessionStats.enemiesKilled;
      
    case 'ghost_hunter':
      return sessionStats.enemiesKilledByType['ghost'] || 0;
      
    case 'vampire_slayer':
      return sessionStats.enemiesKilledByType['vampire'] || 0;
      
    case 'weapon_master':
      return sessionStats.weaponsUsed.size;
      
    case 'life_collector':
      return sessionStats.livesCollected;
      
    case 'high_scorer':
    case 'score_master':
    case 'legendary_score':
      return trigger === 'score_reached' ? value : 0;
      
    case 'katana_master':
      return sessionStats.enemiesKilledByWeapon['katana'] || 0;
      
    default:
      return 0;
  }
}

// Helper function to check if a condition is met
function checkCondition(
  condition: any,
  trigger: AchievementTrigger,
  value: number,
  metadata: Record<string, any>,
  sessionStats: any
): boolean {
  if (condition.trigger !== trigger) return false;
  
  // Check metadata conditions
  if (condition.metadata) {
    for (const [key, expectedValue] of Object.entries(condition.metadata)) {
      if (key === 'enemyType' && metadata.enemyType !== expectedValue) return false;
      if (key === 'weapon' && metadata.weapon !== expectedValue) return false;
      if (key === 'character' && metadata.character !== expectedValue) return false;
      if (key === 'difficulty' && metadata.difficulty !== expectedValue) return false;
      if (key === 'minDifficulty') {
        const difficultyOrder = ['easy', 'medium', 'impossible'];
        const currentIndex = difficultyOrder.indexOf(metadata.difficulty);
        const minIndex = difficultyOrder.indexOf(expectedValue as string);
        if (currentIndex < minIndex) return false;
      }
      if (key === 'livesRemaining' && metadata.livesRemaining !== expectedValue) return false;
      if (key === 'timeInSeconds' && sessionStats.gameStartTime) {
        const gameTime = (Date.now() - sessionStats.gameStartTime) / 1000;
        if (gameTime >= (condition.value || 0)) return false;
      }
      if (key === 'singleShot' && sessionStats.bazookaMultiKills < (condition.value || 0)) return false;
    }
  }
  
  // Check value condition
  if (condition.value !== undefined) {
    switch (condition.comparison) {
      case 'equals': return value === condition.value;
      case 'greater': return value > condition.value;
      case 'less': return value < condition.value;
      case 'greater_equal': return value >= condition.value;
      case 'less_equal': return value <= condition.value;
      default: return value >= condition.value;
    }
  }
  
  return true;
}

// Helper function to calculate achievement stats
function calculateStats(progress: Record<string, AchievementProgress>): AchievementStats {
  const unlockedAchievements = Object.values(progress).filter(p => p.unlocked);
  const totalAchievements = ACHIEVEMENT_DEFINITIONS.length;
  
  let totalPoints = 0;
  let rareAchievements = 0;
  let epicAchievements = 0;
  let legendaryAchievements = 0;
  
  unlockedAchievements.forEach(progress => {
    const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === progress.achievementId);
    if (achievement) {
      totalPoints += achievement.points;
      
      switch (achievement.rarity) {
        case 'rare': rareAchievements++; break;
        case 'epic': epicAchievements++; break;
        case 'legendary': legendaryAchievements++; break;
      }
    }
  });
  
  return {
    totalUnlocked: unlockedAchievements.length,
    totalPoints,
    completionPercentage: Math.round((unlockedAchievements.length / totalAchievements) * 100),
    rareAchievements,
    epicAchievements,
    legendaryAchievements
  };
}