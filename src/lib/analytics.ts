import { Character, Weapon, Difficulty } from '@/store/gameStore';

// Analytics event types
export interface PlayerProgressionEvent {
  type: 'progression';
  difficulty: Difficulty;
  score: number;
  lives: number;
  timestamp: number;
  sessionId: string;
}

export interface WeaponUsageEvent {
  type: 'weapon_usage';
  weapon: Weapon;
  usageCount: number;
  timestamp: number;
  sessionId: string;
}

export interface GameCompletionEvent {
  type: 'completion';
  difficulty: Difficulty;
  finalScore: number;
  completionTime: number;
  survived: boolean;
  timestamp: number;
  sessionId: string;
}

export interface PerformanceMetrics {
  type: 'performance';
  fps: number;
  loadTime: number;
  memoryUsage?: number;
  timestamp: number;
  sessionId: string;
}

export type AnalyticsEvent = PlayerProgressionEvent | WeaponUsageEvent | GameCompletionEvent | PerformanceMetrics;

// Analytics data storage interface
export interface AnalyticsData {
  progression: PlayerProgressionEvent[];
  weaponUsage: Map<Weapon, number>;
  completions: GameCompletionEvent[];
  performance: PerformanceMetrics[];
  sessionStats: {
    sessionId: string;
    startTime: number;
    character: Character | null;
    weapon: Weapon | null;
    difficulty: Difficulty | null;
  };
}

class AnalyticsService {
  private data: AnalyticsData;
  private sessionId: string;
  private gameStartTime: number = 0;
  private lastFPSCheck: number = 0;
  private fpsCounter: number = 0;
  private frameCount: number = 0;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.data = {
      progression: [],
      weaponUsage: new Map(),
      completions: [],
      performance: [],
      sessionStats: {
        sessionId: this.sessionId,
        startTime: Date.now(),
        character: null,
        weapon: null,
        difficulty: null
      }
    };

    // Initialize performance monitoring
    this.initializePerformanceMonitoring();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializePerformanceMonitoring(): void {
    // Only initialize on client side
    if (typeof window === 'undefined') return;

    // Monitor FPS
    this.lastFPSCheck = performance.now();
    this.startFPSMonitoring();

    // Monitor memory usage if available
    if ('memory' in performance) {
      setInterval(() => {
        this.trackPerformanceMetrics();
      }, 5000); // Every 5 seconds
    }
  }

  private startFPSMonitoring(): void {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const measureFPS = () => {
      this.frameCount++;
      const now = performance.now();
      
      if (now - this.lastFPSCheck >= 1000) {
        this.fpsCounter = Math.round((this.frameCount * 1000) / (now - this.lastFPSCheck));
        this.frameCount = 0;
        this.lastFPSCheck = now;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  // Track player progression through difficulty levels
  trackProgression(difficulty: Difficulty, score: number, lives: number): void {
    const event: PlayerProgressionEvent = {
      type: 'progression',
      difficulty,
      score,
      lives,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.data.progression.push(event);
    this.saveToLocalStorage();
    this.sendToAPI(event);
  }

  // Monitor weapon usage statistics
  trackWeaponUsage(weapon: Weapon): void {
    const currentCount = this.data.weaponUsage.get(weapon) || 0;
    this.data.weaponUsage.set(weapon, currentCount + 1);

    const event: WeaponUsageEvent = {
      type: 'weapon_usage',
      weapon,
      usageCount: currentCount + 1,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    // Store weapon usage events for detailed analysis
    this.saveToLocalStorage();
    this.sendToAPI(event);
  }

  // Record completion rates and average scores
  trackGameCompletion(difficulty: Difficulty, finalScore: number, survived: boolean): void {
    const completionTime = Date.now() - this.gameStartTime;
    
    const event: GameCompletionEvent = {
      type: 'completion',
      difficulty,
      finalScore,
      completionTime,
      survived,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.data.completions.push(event);
    this.saveToLocalStorage();
    this.sendToAPI(event);
  }

  // Add performance metrics (FPS, load times)
  trackPerformanceMetrics(loadTime?: number): void {
    const memoryInfo = (performance as any).memory;
    
    const metrics: PerformanceMetrics = {
      type: 'performance',
      fps: this.fpsCounter,
      loadTime: loadTime || 0,
      memoryUsage: memoryInfo ? memoryInfo.usedJSHeapSize : undefined,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.data.performance.push(metrics);
    this.saveToLocalStorage();
    this.sendToAPI(metrics);
  }

  // Set session information
  setSessionInfo(character: Character, weapon: Weapon, difficulty: Difficulty): void {
    this.data.sessionStats.character = character;
    this.data.sessionStats.weapon = weapon;
    this.data.sessionStats.difficulty = difficulty;
    this.gameStartTime = Date.now();
    this.saveToLocalStorage();
  }

  // Get analytics summary
  getAnalyticsSummary() {
    const completions = this.data.completions;
    const progressions = this.data.progression;
    const performance = this.data.performance;

    // Calculate completion rates by difficulty
    const completionRates = {
      easy: this.calculateCompletionRate('easy'),
      medium: this.calculateCompletionRate('medium'),
      impossible: this.calculateCompletionRate('impossible')
    };

    // Calculate average scores by difficulty
    const averageScores = {
      easy: this.calculateAverageScore('easy'),
      medium: this.calculateAverageScore('medium'),
      impossible: this.calculateAverageScore('impossible')
    };

    // Get weapon usage statistics
    const weaponStats = Array.from(this.data.weaponUsage.entries()).map(([weapon, count]) => ({
      weapon,
      count,
      percentage: (count / Array.from(this.data.weaponUsage.values()).reduce((a, b) => a + b, 0)) * 100
    }));

    // Calculate average performance metrics
    const avgFPS = performance.length > 0 
      ? performance.reduce((sum, p) => sum + p.fps, 0) / performance.length 
      : 0;

    const avgLoadTime = performance.filter(p => p.loadTime > 0).length > 0
      ? performance.filter(p => p.loadTime > 0).reduce((sum, p) => sum + p.loadTime, 0) / performance.filter(p => p.loadTime > 0).length
      : 0;

    return {
      session: this.data.sessionStats,
      completionRates,
      averageScores,
      weaponUsage: weaponStats,
      performance: {
        averageFPS: Math.round(avgFPS),
        averageLoadTime: Math.round(avgLoadTime),
        currentFPS: this.fpsCounter
      },
      totalGames: completions.length,
      totalProgressionEvents: progressions.length
    };
  }

  private calculateCompletionRate(difficulty: Difficulty): number {
    const completions = this.data.completions.filter(c => c.difficulty === difficulty);
    const survived = completions.filter(c => c.survived).length;
    return completions.length > 0 ? (survived / completions.length) * 100 : 0;
  }

  private calculateAverageScore(difficulty: Difficulty): number {
    const completions = this.data.completions.filter(c => c.difficulty === difficulty);
    return completions.length > 0 
      ? completions.reduce((sum, c) => sum + c.finalScore, 0) / completions.length 
      : 0;
  }

  // Export analytics data
  exportData(): AnalyticsData {
    return { ...this.data };
  }

  // Import analytics data (for loading saved data)
  importData(data: Partial<AnalyticsData>): void {
    if (data.progression) this.data.progression = data.progression;
    if (data.weaponUsage) this.data.weaponUsage = new Map(data.weaponUsage);
    if (data.completions) this.data.completions = data.completions;
    if (data.performance) this.data.performance = data.performance;
    if (data.sessionStats) this.data.sessionStats = { ...this.data.sessionStats, ...data.sessionStats };
  }

  // Clear analytics data
  clearData(): void {
    this.data = {
      progression: [],
      weaponUsage: new Map(),
      completions: [],
      performance: [],
      sessionStats: {
        sessionId: this.generateSessionId(),
        startTime: Date.now(),
        character: null,
        weapon: null,
        difficulty: null
      }
    };
    this.sessionId = this.data.sessionStats.sessionId;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gameAnalytics');
    }
  }

  private saveToLocalStorage(): void {
    // Only run on client side
    if (typeof window === 'undefined') return;

    try {
      const dataToSave = {
        ...this.data,
        weaponUsage: Array.from(this.data.weaponUsage.entries())
      };
      localStorage.setItem('gameAnalytics', JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Failed to save analytics to localStorage:', error);
    }
  }

  // Send analytics event to API (optional)
  private async sendToAPI(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      // Silently fail - analytics shouldn't break the game
      console.warn('Failed to send analytics to API:', error);
    }
  }

  loadFromLocalStorage(): void {
    // Only run on client side
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem('gameAnalytics');
      if (saved) {
        const data = JSON.parse(saved);
        this.importData({
          ...data,
          weaponUsage: new Map(data.weaponUsage || [])
        });
      }
    } catch (error) {
      console.warn('Failed to load analytics from localStorage:', error);
    }
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService();

// Load saved data on initialization
analyticsService.loadFromLocalStorage();