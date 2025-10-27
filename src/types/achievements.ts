// Achievement system types and definitions

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'combat' | 'survival' | 'exploration' | 'mastery' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number; // Achievement points for rewards
  unlockedAt?: string; // ISO timestamp when unlocked
  progress?: number; // Current progress (0-100)
  maxProgress?: number; // Maximum progress needed
}

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface AchievementNotification {
  achievement: Achievement;
  timestamp: number;
  shown: boolean;
}

export interface AchievementStats {
  totalUnlocked: number;
  totalPoints: number;
  completionPercentage: number;
  rareAchievements: number;
  epicAchievements: number;
  legendaryAchievements: number;
}

// Achievement trigger events
export type AchievementTrigger = 
  | 'enemy_killed'
  | 'life_collected'
  | 'game_completed'
  | 'game_started'
  | 'weapon_used'
  | 'damage_taken'
  | 'score_reached'
  | 'lives_remaining'
  | 'difficulty_completed'
  | 'perfect_run'
  | 'speed_run'
  | 'survival_time';

export interface AchievementCondition {
  trigger: AchievementTrigger;
  value?: number;
  comparison?: 'equals' | 'greater' | 'less' | 'greater_equal' | 'less_equal';
  metadata?: Record<string, any>;
}

// Achievement definitions - based on requirements 7.1, 7.2, 9.1
export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  // Combat achievements
  {
    id: 'first_kill',
    name: 'Primeiro Sangue',
    description: 'Elimine o seu primeiro inimigo',
    icon: '⚔️',
    category: 'combat',
    rarity: 'common',
    points: 10,
    maxProgress: 1
  },
  {
    id: 'enemy_slayer',
    name: 'Caçador de Monstros',
    description: 'Elimine 50 inimigos',
    icon: '🗡️',
    category: 'combat',
    rarity: 'rare',
    points: 50,
    maxProgress: 50
  },
  {
    id: 'ghost_hunter',
    name: 'Caça-Fantasmas',
    description: 'Elimine 25 fantasmas',
    icon: '👻',
    category: 'combat',
    rarity: 'rare',
    points: 30,
    maxProgress: 25
  },
  {
    id: 'vampire_slayer',
    name: 'Matador de Vampiros',
    description: 'Elimine 20 vampiros',
    icon: '🧛',
    category: 'combat',
    rarity: 'rare',
    points: 35,
    maxProgress: 20
  },
  {
    id: 'weapon_master',
    name: 'Mestre das Armas',
    description: 'Use todas as 4 armas pelo menos uma vez',
    icon: '🏆',
    category: 'mastery',
    rarity: 'epic',
    points: 75,
    maxProgress: 4
  },

  // Survival achievements
  {
    id: 'survivor',
    name: 'Sobrevivente',
    description: 'Complete o jogo sem perder uma vida',
    icon: '💚',
    category: 'survival',
    rarity: 'epic',
    points: 100,
    maxProgress: 1
  },
  {
    id: 'life_collector',
    name: 'Colecionador de Vidas',
    description: 'Colete 20 itens de vida',
    icon: '🍎',
    category: 'exploration',
    rarity: 'common',
    points: 25,
    maxProgress: 20
  },
  {
    id: 'iron_will',
    name: 'Vontade de Ferro',
    description: 'Complete o jogo no nível Impossível',
    icon: '💀',
    category: 'mastery',
    rarity: 'legendary',
    points: 200,
    maxProgress: 1
  },

  // Score achievements
  {
    id: 'high_scorer',
    name: 'Pontuador',
    description: 'Alcance 5000 pontos',
    icon: '⭐',
    category: 'mastery',
    rarity: 'rare',
    points: 40,
    maxProgress: 5000
  },
  {
    id: 'score_master',
    name: 'Mestre da Pontuação',
    description: 'Alcance 10000 pontos',
    icon: '🌟',
    category: 'mastery',
    rarity: 'epic',
    points: 80,
    maxProgress: 10000
  },
  {
    id: 'legendary_score',
    name: 'Pontuação Lendária',
    description: 'Alcance 20000 pontos',
    icon: '💫',
    category: 'mastery',
    rarity: 'legendary',
    points: 150,
    maxProgress: 20000
  },

  // Special achievements
  {
    id: 'speed_runner',
    name: 'Corredor Veloz',
    description: 'Complete o jogo em menos de 5 minutos',
    icon: '⚡',
    category: 'special',
    rarity: 'epic',
    points: 90,
    maxProgress: 1
  },
  {
    id: 'perfectionist',
    name: 'Perfeccionista',
    description: 'Complete o jogo coletando todos os itens de vida disponíveis',
    icon: '✨',
    category: 'special',
    rarity: 'legendary',
    points: 120,
    maxProgress: 1
  },
  {
    id: 'katana_master',
    name: 'Mestre da Katana',
    description: 'Elimine 30 inimigos usando apenas a Katana',
    icon: '🗾',
    category: 'mastery',
    rarity: 'rare',
    points: 45,
    maxProgress: 30
  },
  {
    id: 'bazooka_expert',
    name: 'Especialista em Bazuca',
    description: 'Elimine 5 inimigos com uma única munição de bazuca',
    icon: '💥',
    category: 'mastery',
    rarity: 'epic',
    points: 85,
    maxProgress: 1
  },

  // Character-specific achievements
  {
    id: 'brave_boy',
    name: 'Menino Corajoso',
    description: 'Complete o jogo como menino no nível Médio ou superior',
    icon: '👦',
    category: 'special',
    rarity: 'rare',
    points: 50,
    maxProgress: 1
  },
  {
    id: 'brave_girl',
    name: 'Menina Corajosa',
    description: 'Complete o jogo como menina no nível Médio ou superior',
    icon: '👧',
    category: 'special',
    rarity: 'rare',
    points: 50,
    maxProgress: 1
  }
];

// Achievement conditions mapping
export const ACHIEVEMENT_CONDITIONS: Record<string, AchievementCondition[]> = {
  first_kill: [{ trigger: 'enemy_killed', value: 1, comparison: 'greater_equal' }],
  enemy_slayer: [{ trigger: 'enemy_killed', value: 50, comparison: 'greater_equal' }],
  ghost_hunter: [{ trigger: 'enemy_killed', value: 25, comparison: 'greater_equal', metadata: { enemyType: 'ghost' } }],
  vampire_slayer: [{ trigger: 'enemy_killed', value: 20, comparison: 'greater_equal', metadata: { enemyType: 'vampire' } }],
  weapon_master: [{ trigger: 'weapon_used', value: 4, comparison: 'greater_equal', metadata: { uniqueWeapons: true } }],
  survivor: [{ trigger: 'game_completed', value: 10, comparison: 'equals', metadata: { livesRemaining: 10 } }],
  life_collector: [{ trigger: 'life_collected', value: 20, comparison: 'greater_equal' }],
  iron_will: [{ trigger: 'difficulty_completed', value: 1, comparison: 'greater_equal', metadata: { difficulty: 'impossible' } }],
  high_scorer: [{ trigger: 'score_reached', value: 5000, comparison: 'greater_equal' }],
  score_master: [{ trigger: 'score_reached', value: 10000, comparison: 'greater_equal' }],
  legendary_score: [{ trigger: 'score_reached', value: 20000, comparison: 'greater_equal' }],
  speed_runner: [{ trigger: 'game_completed', value: 300, comparison: 'less', metadata: { timeInSeconds: true } }],
  perfectionist: [{ trigger: 'perfect_run', value: 1, comparison: 'greater_equal' }],
  katana_master: [{ trigger: 'enemy_killed', value: 30, comparison: 'greater_equal', metadata: { weapon: 'katana' } }],
  bazooka_expert: [{ trigger: 'enemy_killed', value: 5, comparison: 'greater_equal', metadata: { singleShot: true, weapon: 'bazooka' } }],
  brave_boy: [{ trigger: 'game_completed', value: 1, comparison: 'greater_equal', metadata: { character: 'boy', minDifficulty: 'medium' } }],
  brave_girl: [{ trigger: 'game_completed', value: 1, comparison: 'greater_equal', metadata: { character: 'girl', minDifficulty: 'medium' } }]
};