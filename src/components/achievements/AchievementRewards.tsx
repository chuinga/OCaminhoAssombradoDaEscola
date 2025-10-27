'use client';

import React, { useState, useEffect } from 'react';
import { useAchievementStore } from '../../store/achievementStore';
import { useGameStore } from '../../store/gameStore';

interface RewardItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number; // Achievement points required
  type: 'cosmetic' | 'gameplay' | 'special';
  unlocked: boolean;
}

// Special rewards that can be unlocked with achievement points
const ACHIEVEMENT_REWARDS: RewardItem[] = [
  {
    id: 'golden_character',
    name: 'Personagem Dourada',
    description: 'Desbloqueie uma versão dourada especial da sua personagem',
    icon: '✨',
    cost: 500,
    type: 'cosmetic',
    unlocked: false
  },
  {
    id: 'extra_life_start',
    name: 'Vida Extra',
    description: 'Comece cada jogo com +2 vidas extras (12 vidas totais)',
    icon: '💚',
    cost: 300,
    type: 'gameplay',
    unlocked: false
  },
  {
    id: 'score_multiplier',
    name: 'Multiplicador de Pontos',
    description: 'Ganhe 1.5x mais pontos em todos os jogos',
    icon: '⭐',
    cost: 750,
    type: 'gameplay',
    unlocked: false
  },
  {
    id: 'rainbow_weapon_effects',
    name: 'Efeitos Arco-íris',
    description: 'Todas as armas ganham efeitos visuais coloridos especiais',
    icon: '🌈',
    cost: 400,
    type: 'cosmetic',
    unlocked: false
  },
  {
    id: 'achievement_hunter_title',
    name: 'Título: Caçador de Conquistas',
    description: 'Exiba um título especial no leaderboard',
    icon: '🏆',
    cost: 1000,
    type: 'special',
    unlocked: false
  },
  {
    id: 'invincibility_potion',
    name: 'Poção de Invencibilidade',
    description: 'Use uma vez por jogo para ficar invencível por 10 segundos',
    icon: '🧪',
    cost: 600,
    type: 'gameplay',
    unlocked: false
  }
];

interface AchievementRewardsProps {
  showOnlyAvailable?: boolean;
}

export const AchievementRewards: React.FC<AchievementRewardsProps> = ({
  showOnlyAvailable = false
}) => {
  const { stats } = useAchievementStore();
  const [rewards, setRewards] = useState<RewardItem[]>(ACHIEVEMENT_REWARDS);
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);

  // Load unlocked rewards from localStorage
  useEffect(() => {
    const unlockedRewards = JSON.parse(localStorage.getItem('unlockedRewards') || '[]');
    setRewards(prev => prev.map(reward => ({
      ...reward,
      unlocked: unlockedRewards.includes(reward.id)
    })));
  }, []);

  const canAfford = (cost: number) => stats.totalPoints >= cost;

  const unlockReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || reward.unlocked || !canAfford(reward.cost)) return;

    // Update local state
    setRewards(prev => prev.map(r => 
      r.id === rewardId ? { ...r, unlocked: true } : r
    ));

    // Save to localStorage
    const unlockedRewards = JSON.parse(localStorage.getItem('unlockedRewards') || '[]');
    unlockedRewards.push(rewardId);
    localStorage.setItem('unlockedRewards', JSON.stringify(unlockedRewards));

    // Show success message
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('screenReaderAnnounce', {
        detail: { 
          message: `Recompensa desbloqueada: ${reward.name}`,
          priority: 'assertive'
        }
      }));
    }

    setSelectedReward(null);
  };

  const filteredRewards = showOnlyAvailable 
    ? rewards.filter(reward => canAfford(reward.cost) && !reward.unlocked)
    : rewards;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cosmetic': return 'text-pink-600 bg-pink-100';
      case 'gameplay': return 'text-green-600 bg-green-100';
      case 'special': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'cosmetic': return 'Cosmético';
      case 'gameplay': return 'Jogabilidade';
      case 'special': return 'Especial';
      default: return 'Outro';
    }
  };

  return (
    <div className="space-y-6">
      {/* Points Display */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Pontos de Conquista</h2>
            <p className="text-yellow-100">
              Use seus pontos para desbloquear recompensas especiais!
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{stats.totalPoints}</div>
            <div className="text-sm text-yellow-100">pontos disponíveis</div>
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map(reward => (
          <div
            key={reward.id}
            className={`
              relative p-6 rounded-lg border-2 transition-all duration-200 cursor-pointer
              ${reward.unlocked 
                ? 'border-green-300 bg-green-50 shadow-md' 
                : canAfford(reward.cost)
                  ? 'border-blue-300 bg-blue-50 hover:shadow-lg hover:scale-105'
                  : 'border-gray-200 bg-gray-100 opacity-60'
              }
            `}
            onClick={() => !reward.unlocked && setSelectedReward(reward)}
          >
            {/* Unlocked indicator */}
            {reward.unlocked && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-4xl" role="img" aria-label="Reward icon">
                  {reward.icon}
                </span>
                <div>
                  <h3 className={`font-bold text-lg ${reward.unlocked ? 'text-green-800' : 'text-gray-900'}`}>
                    {reward.name}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor(reward.type)}`}>
                    {getTypeName(reward.type)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className={`text-sm mb-4 ${reward.unlocked ? 'text-green-700' : 'text-gray-700'}`}>
              {reward.description}
            </p>

            {/* Cost and Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-600 font-bold">
                  {reward.cost} pontos
                </span>
                {canAfford(reward.cost) && !reward.unlocked && (
                  <span className="text-green-600 text-sm">✓ Disponível</span>
                )}
              </div>
              
              {reward.unlocked ? (
                <span className="text-green-600 font-medium">Desbloqueado</span>
              ) : canAfford(reward.cost) ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    unlockReward(reward.id);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Desbloquear
                </button>
              ) : (
                <span className="text-gray-500 text-sm">
                  Faltam {reward.cost - stats.totalPoints} pontos
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredRewards.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showOnlyAvailable ? 'Nenhuma recompensa disponível' : 'Nenhuma recompensa encontrada'}
          </h3>
          <p className="text-gray-600">
            {showOnlyAvailable 
              ? 'Continue desbloqueando conquistas para ganhar mais pontos!'
              : 'Complete conquistas para desbloquear recompensas especiais!'
            }
          </p>
        </div>
      )}

      {/* Reward Details Modal */}
      {selectedReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-5xl">{selectedReward.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedReward.name}</h3>
                <span className={`text-sm px-2 py-1 rounded-full font-medium ${getTypeColor(selectedReward.type)}`}>
                  {getTypeName(selectedReward.type)}
                </span>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">{selectedReward.description}</p>
            
            <div className="flex items-center justify-between mb-6">
              <div className="text-lg">
                <span className="text-yellow-600 font-bold">{selectedReward.cost} pontos</span>
                <div className="text-sm text-gray-600">
                  Você tem: {stats.totalPoints} pontos
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedReward(null)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition-colors"
              >
                Cancelar
              </button>
              {canAfford(selectedReward.cost) && (
                <button
                  onClick={() => unlockReward(selectedReward.id)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Desbloquear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementRewards;