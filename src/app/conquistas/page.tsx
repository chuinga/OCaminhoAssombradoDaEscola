'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAchievementStore } from '../../store/achievementStore';
import { AchievementDisplay } from '../../components/achievements/AchievementDisplay';
import { AchievementRewards } from '../../components/achievements/AchievementRewards';

export default function AchievementsPage() {
  const { initializeAchievements } = useAchievementStore();
  const [activeTab, setActiveTab] = useState<'achievements' | 'rewards'>('achievements');

  useEffect(() => {
    // Initialize achievements when the page loads
    initializeAchievements();
  }, [initializeAchievements]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-white hover:text-orange-300 transition-colors"
                aria-label="Voltar ao início"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-3xl font-bold text-white">
                🏆 Conquistas
              </h1>
            </div>
            
            <Link
              href="/"
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Voltar ao Jogo
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Suas Conquistas no Caminho Assombrado
          </h2>
          <p className="text-gray-300 text-lg">
            Desbloqueie conquistas jogando e complete desafios especiais para ganhar pontos extras!
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-black bg-opacity-50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'achievements'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              🏆 Conquistas
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex-1 px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'rewards'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              🎁 Recompensas
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'achievements' ? (
          <AchievementDisplay />
        ) : (
          <AchievementRewards />
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black bg-opacity-50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p className="mb-2">
              Complete o jogo em diferentes dificuldades e com diferentes armas para desbloquear mais conquistas!
            </p>
            <p className="text-sm">
              Algumas conquistas são muito raras - você consegue desbloquear todas?
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}