'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useGameStore } from '@/store/gameStore';
import { apiClient } from '@/lib/api';
import { PlayerStats, Achievement } from '@/types';

export default function StatisticsPage() {
  const { firstName, lastName } = useGameStore();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFirstName, setSearchFirstName] = useState(firstName || '');
  const [searchLastName, setSearchLastName] = useState(lastName || '');

  const fetchPlayerStats = async (first: string, last: string) => {
    if (!first.trim() || !last.trim()) {
      setError('Por favor, insere o primeiro e último nome.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const playerStats = await apiClient.getPlayerStats(first.trim(), last.trim());
      setStats(playerStats);
      
      if (!playerStats) {
        setError('Jogador não encontrado. Verifica se o nome está correto.');
      }
    } catch (err) {
      setError('Erro ao carregar estatísticas. Tente novamente mais tarde.');
      console.error('Failed to load player stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (firstName && lastName) {
      fetchPlayerStats(firstName, lastName);
    } else {
      setLoading(false);
    }
  }, [firstName, lastName]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlayerStats(searchFirstName, searchLastName);
  };

  const getCharacterEmoji = (character: 'boy' | 'girl') => {
    return character === 'boy' ? '👦' : '👧';
  };

  const getWeaponEmoji = (weapon: string) => {
    switch (weapon) {
      case 'katana': return '⚔️';
      case 'laser': return '🔫';
      case 'baseball': return '🏏';
      case 'bazooka': return '💥';
      default: return '🔧';
    }
  };

  const getDifficultyEmoji = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '😊';
      case 'medium': return '😐';
      case 'impossible': return '💀';
      default: return '❓';
    }
  };

  const formatCompletionRate = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  const renderAchievements = (achievements: Achievement[]) => {
    if (!achievements || achievements.length === 0) {
      return (
        <div className="text-center text-gray-400 py-8">
          <p>Nenhuma conquista desbloqueada ainda.</p>
          <p className="text-sm mt-2">Joga mais para desbloquear conquistas!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className="bg-black/30 rounded-lg p-4 border border-yellow-500/30"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <h4 className="font-bold text-yellow-400 mb-1">{achievement.name}</h4>
              <p className="text-sm text-gray-300 mb-2">{achievement.description}</p>
              <p className="text-xs text-gray-400">
                Desbloqueada em {new Date(achievement.unlockedAt).toLocaleDateString('pt-PT')}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 bg-black/20"></div>

      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-orange-400 mb-4 drop-shadow-lg">
            📊 Estatísticas do Jogador
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto mb-6">
            Vê as tuas estatísticas detalhadas e conquistas
          </p>
          
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all transform hover:scale-105"
          >
            ← Voltar ao Início
          </Link>
        </header>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-orange-500/30">
            <h2 className="text-xl font-bold text-orange-400 mb-4 text-center">
              Procurar Estatísticas
            </h2>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Primeiro Nome</label>
                  <input
                    type="text"
                    value={searchFirstName}
                    onChange={(e) => setSearchFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                    placeholder="Ex: João"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Último Nome</label>
                  <input
                    type="text"
                    value={searchLastName}
                    onChange={(e) => setSearchLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                    placeholder="Ex: Silva"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Procurando...
                  </div>
                ) : (
                  '🔍 Procurar Estatísticas'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-6xl mx-auto">
          {loading && !stats ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => fetchPlayerStats(searchFirstName, searchLastName)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          ) : stats ? (
            <div className="space-y-8">
              {/* Player Overview */}
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-orange-500/30">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-orange-400 mb-2">
                    {stats.firstName} {stats.lastName}
                  </h2>
                  <p className="text-gray-300">
                    Último jogo: {new Date(stats.lastPlayed).toLocaleDateString('pt-PT')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-1">
                      {stats.totalGames}
                    </div>
                    <p className="text-gray-300">Jogos Totais</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">
                      {stats.bestScore.toLocaleString()}
                    </div>
                    <p className="text-gray-300">Melhor Pontuação</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-1">
                      {Math.round(stats.averageScore).toLocaleString()}
                    </div>
                    <p className="text-gray-300">Pontuação Média</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-1">
                      {formatCompletionRate(stats.completionRate)}
                    </div>
                    <p className="text-gray-300">Taxa de Vitória</p>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-orange-500/30">
                <h3 className="text-2xl font-bold text-orange-400 mb-6 text-center">
                  Preferências
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl mb-2">
                      {getCharacterEmoji(stats.favoriteCharacter)}
                    </div>
                    <h4 className="font-bold text-white mb-1">Personagem Favorita</h4>
                    <p className="text-gray-300 capitalize">
                      {stats.favoriteCharacter === 'boy' ? 'Menino' : 'Menina'}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl mb-2">
                      {getWeaponEmoji(stats.favoriteWeapon)}
                    </div>
                    <h4 className="font-bold text-white mb-1">Arma Favorita</h4>
                    <p className="text-gray-300 capitalize">{stats.favoriteWeapon}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl mb-2">
                      {getDifficultyEmoji(stats.favoritedifficulty)}
                    </div>
                    <h4 className="font-bold text-white mb-1">Dificuldade Favorita</h4>
                    <p className="text-gray-300 capitalize">{stats.favoritedifficulty}</p>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-orange-500/30">
                <h3 className="text-2xl font-bold text-orange-400 mb-6 text-center">
                  🏆 Conquistas ({stats.achievements?.length || 0})
                </h3>
                
                {renderAchievements(stats.achievements || [])}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-orange-500/30 max-w-md mx-auto">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-orange-400 mb-2">
                  Procurar Estatísticas
                </h3>
                <p className="text-gray-300">
                  Insere o teu nome acima para ver as tuas estatísticas detalhadas.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 text-gray-400">
          <p>© 2025 - O Caminho Assombrado da Escola - Feito com ❤️ pela Sofia para o Halloween</p>
        </footer>
      </main>
    </div>
  );
}