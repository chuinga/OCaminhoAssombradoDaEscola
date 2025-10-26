'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { apiClient } from '@/lib/api';
import { Score } from '@/types';

function FinalPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firstName, lastName, score, character, weapon, difficulty, resetGame } = useGameStore();
  
  // Get game result from URL parameters
  const victory = searchParams.get('victory') === 'true';
  const finalScore = parseInt(searchParams.get('score') || score.toString());
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [allScores, setAllScores] = useState<Score[]>([]);
  const [loadingScores, setLoadingScores] = useState(true);
  const [nextToken, setNextToken] = useState<string | undefined>();
  const [hasMoreScores, setHasMoreScores] = useState(false);

  // Validate that user came from a completed game
  useEffect(() => {
    if (!firstName || !lastName) {
      router.push('/');
      return;
    }
    
    // Load initial leaderboard scores
    loadAllScores();
  }, [firstName, lastName, router]);

  const loadAllScores = async (token?: string) => {
    try {
      setLoadingScores(true);
      const response = await apiClient.getAllScores(token);
      
      if (token) {
        // Append to existing scores for pagination
        setAllScores(prev => [...prev, ...response.scores]);
      } else {
        // Replace scores for initial load
        setAllScores(response.scores);
      }
      
      setNextToken(response.nextToken);
      setHasMoreScores(response.hasMore);
    } catch (error) {
      console.error('Failed to load scores:', error);
      setSubmitError('Falha ao carregar leaderboard.');
    } finally {
      setLoadingScores(false);
    }
  };

  const loadMoreScores = () => {
    if (nextToken && hasMoreScores && !loadingScores) {
      loadAllScores(nextToken);
    }
  };

  const handleReturnHome = () => {
    // Reset game state and return to home page
    resetGame();
    router.push('/');
  };

  const handleSubmitScore = async () => {
    if (isSubmitting || scoreSubmitted || !character || !weapon || !difficulty) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const scoreData = {
        firstName,
        lastName,
        score: finalScore,
        character,
        weapon,
        difficulty
      };
      
      await apiClient.submitScore(scoreData);
      setScoreSubmitted(true);
      
      // Reload leaderboard to show the new score
      await loadAllScores();
      
    } catch (error) {
      console.error('Failed to submit score:', error);
      setSubmitError('Falha ao enviar pontuação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!firstName || !lastName) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-md lg:max-w-lg w-full text-center text-white">
        {/* Game Result Header */}
        <div className="mb-8">
          {victory ? (
            <>
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl font-bold text-green-400 mb-2">Vitória!</h1>
              <p className="text-lg text-gray-300">
                Chegaste à escola em segurança!
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">💀</div>
              <h1 className="text-3xl font-bold text-red-400 mb-2">Game Over</h1>
              <p className="text-lg text-gray-300">
                Não conseguiste chegar à escola...
              </p>
            </>
          )}
        </div>

        {/* Player Info and Score */}
        <div className="bg-black/20 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Resultado Final</h2>
          <div className="space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-gray-300">Jogador:</span>
              <span className="font-semibold">{firstName} {lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Pontuação:</span>
              <span className="font-bold text-yellow-400 text-xl">{finalScore}</span>
            </div>
            {victory && (
              <div className="flex justify-between text-green-400">
                <span>Bónus de Vitória:</span>
                <span className="font-semibold">+500</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {!scoreSubmitted && (
            <button
              onClick={handleSubmitScore}
              disabled={isSubmitting || !character || !weapon || !difficulty}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Enviando...
                </div>
              ) : (
                'Enviar Pontuação'
              )}
            </button>
          )}
          
          {scoreSubmitted && (
            <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-3 text-green-400 text-center">
              ✅ Pontuação enviada com sucesso!
            </div>
          )}
          
          {submitError && (
            <p className="text-red-400 text-sm text-center">{submitError}</p>
          )}
          
          <button
            onClick={handleReturnHome}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Voltar ao Início
          </button>
        </div>

        {/* Leaderboard Display */}
        <div className="mt-6 sm:mt-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center">Leaderboard</h3>
          
          {loadingScores && allScores.length === 0 ? (
            <div className="text-center text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              Carregando pontuações...
            </div>
          ) : allScores.length === 0 ? (
            <div className="text-center text-gray-400">
              <p>Nenhuma pontuação encontrada.</p>
            </div>
          ) : (
            <div className="bg-black/20 rounded-lg max-h-48 sm:max-h-64 lg:max-h-80 overflow-y-auto">
              <div className="space-y-2 p-2 sm:p-4">
                {allScores.map((scoreEntry, index) => (
                  <div
                    key={scoreEntry.scoreId}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      scoreEntry.firstName === firstName && 
                      scoreEntry.lastName === lastName && 
                      scoreEntry.score === finalScore
                        ? 'bg-blue-600/30 border border-blue-600/50'
                        : 'bg-black/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-400 font-mono text-sm w-8">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-semibold">
                          {scoreEntry.firstName} {scoreEntry.lastName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {scoreEntry.character === 'boy' ? '👦' : '👧'} • {scoreEntry.weapon} • {scoreEntry.difficulty}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-400">
                        {scoreEntry.score.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(scoreEntry.createdAt).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Load More Button */}
              {hasMoreScores && (
                <div className="p-4 border-t border-gray-600">
                  <button
                    onClick={loadMoreScores}
                    disabled={loadingScores}
                    className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    {loadingScores ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Carregando...
                      </div>
                    ) : (
                      'Carregar Mais'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FinalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando resultados...</p>
        </div>
      </div>
    }>
      <FinalPageContent />
    </Suspense>
  );
}