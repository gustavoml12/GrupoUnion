'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, OnboardingVideo, VideoStats } from '@/utils/api';
import { getUser, isAuthenticated, getToken } from '@/utils/auth';

interface QuizOption {
  id: string;
  option_text: string;
  order: number;
}

interface QuizQuestion {
  id: string;
  question_text: string;
  order: number;
  options: QuizOption[];
}

interface QuizResults {
  video_id: string;
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  score_percentage: number;
  passed: boolean;
}

export default function OnboardingVideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<OnboardingVideo[]>([]);
  const [stats, setStats] = useState<VideoStats | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<OnboardingVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Quiz states
  const [showQuiz, setShowQuiz] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string}>({});
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [videosData, statsData] = await Promise.all([
        api.getOnboardingVideos(),
        api.getVideoStats()
      ]);
      setVideos(videosData);
      setStats(statsData);
      
      // Auto-select first incomplete video or first video
      const firstIncomplete = videosData.find(v => !v.user_progress?.completed);
      setSelectedVideo(firstIncomplete || videosData[0] || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar vídeos');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = async (video: OnboardingVideo) => {
    setSelectedVideo(video);
    
    // Mark as started if not already
    if (!video.user_progress) {
      try {
        await api.markVideoStarted(video.id);
        await loadData(); // Reload to update progress
      } catch (err) {
        console.error('Error marking video as started:', err);
      }
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedVideo) return;

    // Check if video has quiz
    await loadQuizQuestions(selectedVideo.id);
  };

  const loadQuizQuestions = async (videoId: string) => {
    try {
      setLoadingQuiz(true);
      const response = await fetch(`http://localhost:8000/api/v1/quiz/videos/${videoId}/questions`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) throw new Error('Erro ao carregar perguntas');

      const data = await response.json();
      
      if (data.length === 0) {
        // No quiz, mark as complete directly
        try {
          await api.markVideoCompleted(videoId);
          setSuccess('✅ Vídeo marcado como concluído!');
          await loadData();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erro ao marcar vídeo como concluído');
        }
      } else {
        // Has quiz, show it
        setQuestions(data);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setQuizResults(null);
        setShowQuiz(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar questionário');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionId
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!selectedVideo) return;

    // Check if all questions are answered
    const unanswered = questions.filter(q => !selectedAnswers[q.id]);
    if (unanswered.length > 0) {
      setError(`Por favor, responda todas as ${questions.length} perguntas antes de enviar.`);
      return;
    }

    try {
      setLoadingQuiz(true);
      setError('');

      // Submit all answers
      for (const question of questions) {
        await fetch('http://localhost:8000/api/v1/quiz/answers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            question_id: question.id,
            selected_option_id: selectedAnswers[question.id]
          }),
        });
      }

      // Get results
      const resultsResponse = await fetch(`http://localhost:8000/api/v1/quiz/videos/${selectedVideo.id}/results`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!resultsResponse.ok) throw new Error('Erro ao obter resultados');

      const results = await resultsResponse.json();
      setQuizResults(results);

      // If passed, mark video as complete
      if (results.passed) {
        await api.markVideoCompleted(selectedVideo.id);
        setSuccess('🎉 Parabéns! Você passou no questionário e completou o vídeo!');
        await loadData();
      } else {
        setError(`❌ Você precisa de 70% para passar. Sua pontuação: ${results.score_percentage}%. Tente novamente!`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar respostas');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleRetryQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizResults(null);
  };

  const getEmbedUrl = (video: OnboardingVideo): string => {
    const url = video.video_url;
    
    if (video.provider === 'YOUTUBE') {
      // Convert YouTube URL to embed format
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    
    if (video.provider === 'VIMEO') {
      // Convert Vimeo URL to embed format
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    
    // Panda Video - assume URL is already in embed format
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6] mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎥</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhum vídeo disponível</h2>
          <p className="text-gray-600 mb-6">Os vídeos de onboarding ainda não foram configurados.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white rounded-md hover:from-[#7C3AED] hover:to-[#2563EB] transition-all"
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
                🎥 Trilha de Onboarding
              </h1>
              <p className="text-sm text-gray-600">Assista aos vídeos para conhecer melhor o Grupo Union</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#8B5CF6] transition-colors"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Stats */}
        {stats && (
          <div className="mb-6 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Seu Progresso</h3>
                <p className="text-white/90 text-sm">
                  {stats.completed_videos} de {stats.total_videos} vídeos concluídos
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.completion_percentage}%</div>
                <p className="text-white/90 text-sm">Completo</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.completion_percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            {selectedVideo && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Video Embed */}
                <div className="relative" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={getEmbedUrl(selectedVideo)}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedVideo.title}
                  ></iframe>
                </div>

                {/* Video Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedVideo.title}</h2>
                      {selectedVideo.description && (
                        <p className="text-gray-600">{selectedVideo.description}</p>
                      )}
                    </div>
                    {selectedVideo.user_progress?.completed && (
                      <span className="ml-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        ✅ Concluído
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="inline-flex items-center">
                        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {selectedVideo.duration_minutes ? `${selectedVideo.duration_minutes} min` : 'Duração não especificada'}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {selectedVideo.provider}
                      </span>
                    </div>

                    {!selectedVideo.user_progress?.completed && (
                      <button
                        onClick={handleMarkComplete}
                        className="px-4 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-md hover:from-[#059669] hover:to-[#047857] transition-all text-sm font-medium"
                      >
                        ✓ Marcar como Concluído
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Video List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">
                  Todos os Vídeos ({videos.length})
                </h3>
              </div>
              
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {videos.map((video, index) => (
                  <button
                    key={video.id}
                    onClick={() => handleVideoSelect(video)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      selectedVideo?.id === video.id ? 'bg-blue-50 border-l-4 border-[#8B5CF6]' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {video.user_progress?.completed ? (
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-600">{index + 1}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          selectedVideo?.id === video.id ? 'text-[#8B5CF6]' : 'text-gray-900'
                        }`}>
                          {video.title}
                        </p>
                        {video.duration_minutes && (
                          <p className="text-xs text-gray-500 mt-1">
                            ⏱️ {video.duration_minutes} min
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Completion Message */}
            {stats && stats.completion_percentage === 100 && (
              <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-3xl mr-3">🎉</div>
                  <div>
                    <h4 className="text-sm font-semibold text-green-900">Parabéns!</h4>
                    <p className="text-xs text-green-700 mt-1">
                      Você completou todos os vídeos de onboarding!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Quiz Modal */}
      {showQuiz && questions.length > 0 && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              {!quizResults ? (
                // Quiz Questions
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                  <div className="border-b border-gray-200 pb-4 mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      📝 Questionário do Vídeo
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Responda todas as perguntas para completar o vídeo (mínimo 70% de acerto)
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Pergunta {currentQuestionIndex + 1} de {questions.length}</span>
                      <span>{Object.keys(selectedAnswers).length} de {questions.length} respondidas</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#8B5CF6] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Current Question */}
                  {questions[currentQuestionIndex] && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        {questions[currentQuestionIndex].question_text}
                      </h4>

                      <div className="space-y-3">
                        {questions[currentQuestionIndex].options
                          .sort((a, b) => a.order - b.order)
                          .map((option, index) => (
                            <label
                              key={option.id}
                              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedAnswers[questions[currentQuestionIndex].id] === option.id
                                  ? 'border-[#8B5CF6] bg-purple-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${questions[currentQuestionIndex].id}`}
                                value={option.id}
                                checked={selectedAnswers[questions[currentQuestionIndex].id] === option.id}
                                onChange={() => handleAnswerSelect(questions[currentQuestionIndex].id, option.id)}
                                className="mt-1 w-4 h-4 text-[#8B5CF6] focus:ring-[#8B5CF6]"
                              />
                              <span className="ml-3 flex-1">
                                <span className="font-medium text-gray-700 mr-2">
                                  {String.fromCharCode(65 + index)})
                                </span>
                                <span className="text-gray-900">{option.option_text}</span>
                              </span>
                            </label>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <button
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Anterior
                    </button>

                    <div className="flex space-x-2">
                      {currentQuestionIndex < questions.length - 1 ? (
                        <button
                          onClick={handleNextQuestion}
                          className="px-4 py-2 text-sm font-medium text-white bg-[#8B5CF6] rounded-md hover:bg-[#7C3AED]"
                        >
                          Próxima →
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmitQuiz}
                          disabled={loadingQuiz || Object.keys(selectedAnswers).length < questions.length}
                          className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-md hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingQuiz ? 'Enviando...' : '✓ Enviar Respostas'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Quiz Results
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                  <div className="text-center">
                    <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${
                      quizResults.passed ? 'bg-green-100' : 'bg-red-100'
                    } mb-4`}>
                      <span className="text-4xl">
                        {quizResults.passed ? '🎉' : '😔'}
                      </span>
                    </div>

                    <h3 className={`text-2xl font-bold mb-2 ${
                      quizResults.passed ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {quizResults.passed ? 'Parabéns!' : 'Não foi dessa vez'}
                    </h3>

                    <p className="text-gray-600 mb-6">
                      {quizResults.passed
                        ? 'Você passou no questionário e completou o vídeo!'
                        : 'Você precisa de pelo menos 70% de acerto para passar.'}
                    </p>

                    {/* Results Stats */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-3xl font-bold text-gray-900">
                            {quizResults.score_percentage}%
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Pontuação</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-green-600">
                            {quizResults.correct_answers}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Acertos</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-red-600">
                            {quizResults.total_questions - quizResults.correct_answers}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Erros</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center space-x-3">
                      {quizResults.passed ? (
                        <button
                          onClick={() => setShowQuiz(false)}
                          className="px-6 py-2 text-sm font-medium text-white bg-[#8B5CF6] rounded-md hover:bg-[#7C3AED]"
                        >
                          ✓ Continuar
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setShowQuiz(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            Fechar
                          </button>
                          <button
                            onClick={handleRetryQuiz}
                            className="px-6 py-2 text-sm font-medium text-white bg-[#8B5CF6] rounded-md hover:bg-[#7C3AED]"
                          >
                            🔄 Tentar Novamente
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
