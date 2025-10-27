'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Score } from '@/types';

export default function Home() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getTop10Scores();
        setScores(response.scores);
      } catch (err) {
        setError('Erro ao carregar o leaderboard. Tente novamente mais tarde.');
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900">
      {/* Halloween-themed background overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      <main className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-orange-400 mb-4 drop-shadow-lg">
            🎃 O Caminho Assombrado da Escola 🎃
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
            Ajude a criança a chegar à escola evitando monstros assombrados!
          </p>
        </header>

        {/* Main content area */}
        <div className="flex-1 flex flex-col items-center gap-8 max-w-4xl mx-auto w-full">
          {/* Game Start Section */}
          <div className="w-full max-w-md">
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-orange-500/30 text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">👻</div>
                <h3 className="text-2xl font-bold text-orange-400 mb-2">
                  Pronto para a aventura?
                </h3>
                <p className="text-gray-300">
                  Escolha a sua personagem, arma e dificuldade, e comece a sua jornada assombrada!
                </p>
              </div>

              <Link
                href="/nome"
                className="inline-block w-full px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-xl font-bold rounded-lg transition-all transform hover:scale-105 hover:shadow-lg"
              >
                🎮 Jogar
              </Link>

              <div className="mt-4">
                <Link
                  href="/configuracoes"
                  className="inline-block w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all transform hover:scale-105"
                >
                  ⚙️ Configurações de Áudio
                </Link>
              </div>

              <div className="mt-6 text-sm text-gray-400">
                <p>Compatível com:</p>
                <div className="flex justify-center gap-4 mt-2">
                  <span>📱 Mobile</span>
                  <span>💻 Desktop</span>
                  <span>📟 Tablet</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Section */}
          <div className="w-full bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-orange-500/30">
            <h2 className="text-2xl md:text-3xl font-bold text-orange-400 mb-6 text-center">
              🏆 Top 5 Jogadores
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            ) : scores.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-300 text-lg">
                  Ainda não há pontuações registadas.
                </p>
                <p className="text-gray-400 mt-2">
                  Seja o primeiro a jogar!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {scores.slice(0, 5).map((score, index) => (
                  <div
                    key={score.scoreId}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:scale-105 ${index === 0
                        ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/50'
                        : index === 1
                          ? 'bg-gradient-to-r from-gray-400/20 to-gray-600/20 border-gray-400/50'
                          : index === 2
                            ? 'bg-gradient-to-r from-orange-700/20 to-yellow-700/20 border-orange-700/50'
                            : 'bg-gray-800/50 border-gray-600/30'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-2xl font-bold ${index === 0 ? 'text-yellow-400' :
                          index === 1 ? 'text-gray-300' :
                            index === 2 ? 'text-orange-600' :
                              'text-gray-400'
                        }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-white font-semibold text-lg">
                          {score.firstName} {score.lastName}
                        </p>
                        <div className="flex gap-2 text-sm text-gray-300">
                          <span className="capitalize">{score.character === 'boy' ? '👦' : '👧'}</span>
                          <span>•</span>
                          <span className="capitalize">{score.weapon}</span>
                          <span>•</span>
                          <span className="capitalize">{score.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-400">
                        {score.score.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(score.createdAt).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>
                ))}
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
