'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { FilteredLeaderboardResponse, Score } from '@/types';
import ShareButton from '@/components/ui/ShareButton';

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'impossible';
type PeriodFilter = 'all' | 'weekly' | 'monthly';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<FilteredLeaderboardResponse>({
    scores: [],
    total: 0,
    filters: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const difficulty = difficultyFilter === 'all' ? undefined : difficultyFilter;
      const period = periodFilter === 'all' ? undefined : periodFilter;
      
      const response = await apiClient.getFilteredLeaderboard(difficulty, period, 50);
      setLeaderboard(response);
    } catch (err) {
      setError('Erro ao carregar o leaderboard. Tente novamente mais tarde.');
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [difficultyFilter, periodFilter]);

  const getDifficultyEmoji = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '😊';
      case 'medium': return '😐';
      case 'impossible': return '💀';
      default: return '❓';
    }
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

  const getPeriodLabel = (period: PeriodFilter) => {
    switch (period) {
      case 'weekly': return 'Esta Semana';
      case 'monthly': return 'Este Mês';
      default: return 'Todos os Tempos';
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 bg-black/20"></div>

      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-orange-400 mb-4 drop-shadow-lg">
            🏆 Leaderboard Completo
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto mb-6">
            Vê todas as pontuações e filtra por dificuldade e período
          </p>
          
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all transform hover:scale-105"
          >
            ← Voltar ao Início
          </Link>
        </header>

        {/* Filters */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-orange-500/30">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Filtros</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Difficulty Filter */}
              <div>
                <label className="block text-white font-medium mb-3">Dificuldade</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['all', 'easy', 'medium', 'impossible'] as DifficultyFilter[]).map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => setDifficultyFilter(difficulty)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        difficultyFilter === difficulty
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      {difficulty === 'all' ? '🌟 Todas' : 
                       difficulty === 'easy' ? '😊 Fácil' :
                       difficulty === 'medium' ? '😐 Médio' : '💀 Impossível'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Period Filter */}
              <div>
                <label className="block text-white font-medium mb-3">Período</label>
                <div className="grid grid-cols-1 gap-2">
                  {(['all', 'weekly', 'monthly'] as PeriodFilter[]).map((period) => (
                    <button
                      key={period}
                      onClick={() => setPeriodFilter(period)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        periodFilter === period
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      {period === 'all' ? '📅 Todos os Tempos' :
                       period === 'weekly' ? '📆 Esta Semana' : '🗓️ Este Mês'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-orange-500/20">
            <p className="text-center text-gray-300">
              Mostrando <span className="font-bold text-orange-400">{leaderboard.scores.length}</span> de{' '}
              <span className="font-bold text-orange-400">{leaderboard.total}</span> pontuações
              {difficultyFilter !== 'all' && (
                <span> • Dificuldade: <span className="font-bold">{difficultyFilter}</span></span>
              )}
              {periodFilter !== 'all' && (
                <span> • Período: <span className="font-bold">{getPeriodLabel(periodFilter)}</span></span>
              )}
            </p>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-orange-500/30">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={fetchLeaderboard}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            ) : leaderboard.scores.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-300 text-lg mb-2">
                  Nenhuma pontuação encontrada para os filtros selecionados.
                </p>
                <p className="text-gray-400">
                  Tenta ajustar os filtros ou ser o primeiro a jogar!
                </p>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-3">
                  {leaderboard.scores.map((score, index) => (
                    <div
                      key={score.scoreId}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:scale-105 ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/50'
                          : index === 1
                            ? 'bg-gradient-to-r from-gray-400/20 to-gray-600/20 border-gray-400/50'
                            : index === 2
                              ? 'bg-gradient-to-r from-orange-700/20 to-yellow-700/20 border-orange-700/50'
                              : 'bg-gray-800/50 border-gray-600/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`text-2xl font-bold min-w-[3rem] text-center ${
                          index === 0 ? 'text-yellow-400' :
                          index === 1 ? 'text-gray-300' :
                          index === 2 ? 'text-orange-600' :
                          'text-gray-400'
                        }`}>
                          #{index + 1}
                        </span>
                        <div>
                          <p className="text-white font-semibold text-lg">
                            {score.firstName} {score.lastName}
                          </p>
                          <div className="flex gap-3 text-sm text-gray-300">
                            <span>{score.character === 'boy' ? '👦' : '👧'}</span>
                            <span>{getWeaponEmoji(score.weapon)} {score.weapon}</span>
                            <span>{getDifficultyEmoji(score.difficulty)} {score.difficulty}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-400">
                            {score.score.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(score.createdAt).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                        
                        <ShareButton 
                          scoreId={score.scoreId} 
                          size="sm" 
                          variant="primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 text-gray-400">
          <p>© 2025 - O Caminho Assombrado da Escola - Feito com ❤️ pela Sofia para o Halloween</p>
        </footer>
      </main>
    </div>
  );
}