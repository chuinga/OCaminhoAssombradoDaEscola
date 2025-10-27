'use client';

import React, { useState, useMemo } from 'react';
import { useAchievementStore } from '../../store/achievementStore';
import { ACHIEVEMENT_DEFINITIONS } from '../../types/achievements';
import { Achievement } from '../../types/achievements';

interface AchievementCardProps {
  achievement: Achievement;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  progress,
  maxProgress,
  unlocked,
  unlockedAt
}) => {
  const progressPercentage = Math.min((progress / maxProgress) * 100, 100);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'combat': return '⚔️';
      case 'survival': return '🛡️';
      case 'exploration': return '🗺️';
      case 'mastery': return '🏆';
      case 'special': return '✨';
      default: return '🎯';
    }
  };

  return (
    <div className={`
      relative p-4 rounded-lg border-2 transition-all duration-200
      ${unlocked ? getRarityColor(achievement.rarity) : 'border-gray-200 bg-gray-100'}
      ${unlocked ? 'shadow-md hover:shadow-lg' : 'opacity-60'}
    `}>
      {/* Unlocked indicator */}
      {unlocked && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-3xl" role="img" aria-label="Achievement icon">
            {achievement.icon}
          </span>
          <div>
            <h3 className={`font-bold text-lg ${unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
              {achievement.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500">
                {getCategoryIcon(achievement.category)} {achievement.category}
              </span>
              <span className={`font-medium ${getRarityTextColor(achievement.rarity)}`}>
                {achievement.rarity === 'legendary' ? 'Lendário' :
                 achievement.rarity === 'epic' ? 'Épico' :
                 achievement.rarity === 'rare' ? 'Raro' : 'Comum'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-lg font-bold ${unlocked ? 'text-green-600' : 'text-gray-400'}`}>
            +{achievement.points}
          </div>
          <div className="text-xs text-gray-500">pontos</div>
        </div>
      </div>

      {/* Description */}
      <p className={`text-sm mb-3 ${unlocked ? 'text-gray-700' : 'text-gray-500'}`}>
        {achievement.description}
      </p>

      {/* Progress bar */}
      {maxProgress > 1 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progresso</span>
            <span>{progress}/{maxProgress}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                unlocked ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Unlock date */}
      {unlocked && unlockedAt && (
        <div className="text-xs text-gray-500 mt-2">
          Desbloqueado em {new Date(unlockedAt).toLocaleDateString('pt-BR')}
        </div>
      )}
    </div>
  );
};

interface AchievementDisplayProps {
  showOnlyUnlocked?: boolean;
  category?: string;
  rarity?: string;
}

export const AchievementDisplay: React.FC<AchievementDisplayProps> = ({
  showOnlyUnlocked = false,
  category,
  rarity
}) => {
  const { progress, stats } = useAchievementStore();
  const [selectedCategory, setSelectedCategory] = useState<string>(category || 'all');
  const [selectedRarity, setSelectedRarity] = useState<string>(rarity || 'all');

  // Filter achievements based on criteria
  const filteredAchievements = useMemo(() => {
    return ACHIEVEMENT_DEFINITIONS.filter(achievement => {
      const achievementProgress = progress[achievement.id];
      
      // Filter by unlock status
      if (showOnlyUnlocked && !achievementProgress?.unlocked) {
        return false;
      }
      
      // Filter by category
      if (selectedCategory !== 'all' && achievement.category !== selectedCategory) {
        return false;
      }
      
      // Filter by rarity
      if (selectedRarity !== 'all' && achievement.rarity !== selectedRarity) {
        return false;
      }
      
      return true;
    });
  }, [progress, showOnlyUnlocked, selectedCategory, selectedRarity]);

  const categories = ['all', 'combat', 'survival', 'exploration', 'mastery', 'special'];
  const rarities = ['all', 'common', 'rare', 'epic', 'legendary'];

  const getCategoryName = (cat: string) => {
    switch (cat) {
      case 'combat': return 'Combate';
      case 'survival': return 'Sobrevivência';
      case 'exploration': return 'Exploração';
      case 'mastery': return 'Maestria';
      case 'special': return 'Especial';
      default: return 'Todas';
    }
  };

  const getRarityName = (rar: string) => {
    switch (rar) {
      case 'common': return 'Comum';
      case 'rare': return 'Raro';
      case 'epic': return 'Épico';
      case 'legendary': return 'Lendário';
      default: return 'Todas';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Estatísticas de Conquistas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.totalUnlocked}</div>
            <div className="text-sm text-gray-600">Desbloqueadas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.totalPoints}</div>
            <div className="text-sm text-gray-600">Pontos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.completionPercentage}%</div>
            <div className="text-sm text-gray-600">Completo</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.legendaryAchievements}</div>
            <div className="text-sm text-gray-600">Lendárias</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {getCategoryName(cat)}
                </option>
              ))}
            </select>
          </div>

          {/* Rarity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raridade
            </label>
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {rarities.map(rar => (
                <option key={rar} value={rar}>
                  {getRarityName(rar)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map(achievement => {
          const achievementProgress = progress[achievement.id] || {
            progress: 0,
            maxProgress: achievement.maxProgress || 1,
            unlocked: false
          };

          return (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              progress={achievementProgress.progress}
              maxProgress={achievementProgress.maxProgress}
              unlocked={achievementProgress.unlocked}
              unlockedAt={achievementProgress.unlockedAt}
            />
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏆</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma conquista encontrada
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros ou comece a jogar para desbloquear conquistas!
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementDisplay;