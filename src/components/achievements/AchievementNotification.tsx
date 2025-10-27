'use client';

import React, { useEffect, useState } from 'react';
import { useAchievementStore } from '../../store/achievementStore';
import { Achievement } from '../../types/achievements';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({ 
  achievement, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-hide after 5 seconds
    const hideTimer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 300);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-500 to-gray-600';
      case 'rare': return 'from-blue-500 to-blue-600';
      case 'epic': return 'from-purple-500 to-purple-600';
      case 'legendary': return 'from-yellow-500 to-yellow-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-yellow-400';
      default: return 'border-gray-400';
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className={`
        bg-gradient-to-r ${getRarityColor(achievement.rarity)}
        border-2 ${getRarityBorder(achievement.rarity)}
        rounded-lg shadow-lg p-4 text-white
        animate-pulse-glow
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-2xl" role="img" aria-label="Achievement icon">
              {achievement.icon}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide opacity-90">
              Conquista Desbloqueada
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Fechar notificação"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Achievement Details */}
        <div className="space-y-1">
          <h3 className="font-bold text-lg">{achievement.name}</h3>
          <p className="text-sm opacity-90">{achievement.description}</p>
          
          {/* Points and Rarity */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-medium">
              +{achievement.points} pontos
            </span>
            <span className={`
              text-xs px-2 py-1 rounded-full font-medium
              ${achievement.rarity === 'legendary' ? 'bg-yellow-200 text-yellow-800' :
                achievement.rarity === 'epic' ? 'bg-purple-200 text-purple-800' :
                achievement.rarity === 'rare' ? 'bg-blue-200 text-blue-800' :
                'bg-gray-200 text-gray-800'}
            `}>
              {achievement.rarity === 'legendary' ? 'Lendário' :
               achievement.rarity === 'epic' ? 'Épico' :
               achievement.rarity === 'rare' ? 'Raro' : 'Comum'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Container component to manage multiple notifications
export const AchievementNotificationContainer: React.FC = () => {
  const { notifications, markNotificationShown } = useAchievementStore();
  const [visibleNotifications, setVisibleNotifications] = useState<typeof notifications>([]);

  useEffect(() => {
    // Show new notifications
    const newNotifications = notifications.filter(n => !n.shown);
    if (newNotifications.length > 0) {
      setVisibleNotifications(prev => [...prev, ...newNotifications]);
      
      // Mark as shown
      newNotifications.forEach(notification => {
        markNotificationShown(notification.achievement.id);
      });
    }
  }, [notifications, markNotificationShown]);

  const handleCloseNotification = (achievementId: string) => {
    setVisibleNotifications(prev => 
      prev.filter(n => n.achievement.id !== achievementId)
    );
  };

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {visibleNotifications.map((notification, index) => (
        <div
          key={notification.achievement.id}
          style={{ 
            transform: `translateY(${index * 10}px)`,
            zIndex: 50 - index 
          }}
        >
          <AchievementNotification
            achievement={notification.achievement}
            onClose={() => handleCloseNotification(notification.achievement.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default AchievementNotification;