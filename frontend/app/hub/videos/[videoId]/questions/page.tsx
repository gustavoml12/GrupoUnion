'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/utils/api';
import { getUser, isAuthenticated, getToken } from '@/utils/auth';

interface QuizOption {
  id?: string;
  option_text: string;
  is_correct: boolean;
  order: number;
}

interface QuizQuestion {
  id?: string;
  video_id: string;
  question_text: string;
  order: number;
  is_active: boolean;
  options: QuizOption[];
}

export default function VideoQuestionsPage() {
  const router = useRouter();
  const params = useParams();
  const videoId = params.videoId as string;
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  
  // Form state for new/edit question
  const [questionText, setQuestionText] = useState('');
  const [questionOrder, setQuestionOrder] = useState(0);
  const [options, setOptions] = useState<QuizOption[]>([
    { option_text: '', is_correct: false, order: 0 },
    { option_text: '', is_correct: false, order: 1 },
  ]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const user = getUser();
    if (user?.role !== 'HUB' && user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    loadQuestions();
  }, [router, videoId]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/v1/quiz/videos/${videoId}/questions/admin?include_inactive=true`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      
      if (!response.ok) throw new Error('Erro ao carregar perguntas');
      
      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar perguntas');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingQuestion(null);
    setQuestionText('');
    setQuestionOrder(questions.length);
    setOptions([
      { option_text: '', is_correct: false, order: 0 },
      { option_text: '', is_correct: false, order: 1 },
    ]);
    setShowModal(true);
  };

  const openEditModal = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setQuestionText(question.question_text);
    setQuestionOrder(question.order);
    setOptions(question.options.sort((a, b) => a.order - b.order));
    setShowModal(true);
  };

  const addOption = () => {
    setOptions([...options, { option_text: '', is_correct: false, order: options.length }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      alert('A pergunta deve ter pelo menos 2 opções');
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, field: keyof QuizOption, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    
    // If marking as correct, unmark others
    if (field === 'is_correct' && value === true) {
      newOptions.forEach((opt, i) => {
        if (i !== index) opt.is_correct = false;
      });
    }
    
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!questionText.trim()) {
      setError('Digite o texto da pergunta');
      return;
    }

    if (options.some(opt => !opt.option_text.trim())) {
      setError('Todas as opções devem ter texto');
      return;
    }

    if (!options.some(opt => opt.is_correct)) {
      setError('Marque pelo menos uma opção como correta');
      return;
    }

    const questionData = {
      video_id: videoId,
      question_text: questionText,
      order: questionOrder,
      is_active: true,
      options: options.map((opt, idx) => ({
        option_text: opt.option_text,
        is_correct: opt.is_correct,
        order: idx
      }))
    };

    try {
      if (editingQuestion) {
        // For now, we'll delete and recreate (simpler)
        // In production, you'd want proper update logic
        alert('Edição de perguntas será implementada em breve. Por favor, delete e recrie.');
        return;
      } else {
        const response = await fetch('http://localhost:8000/api/v1/quiz/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
          },
          body: JSON.stringify(questionData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Erro ao criar pergunta');
        }

        setSuccess('✅ Pergunta criada com sucesso!');
      }
      
      setShowModal(false);
      await loadQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar pergunta');
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta pergunta?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/v1/quiz/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) throw new Error('Erro ao deletar pergunta');

      setSuccess('✅ Pergunta deletada com sucesso!');
      await loadQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar pergunta');
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
                ❓ Gerenciar Perguntas do Vídeo
              </h1>
              <p className="text-sm text-gray-600">Questionário de múltipla escolha</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white rounded-md hover:from-[#7C3AED] hover:to-[#2563EB] transition-all text-sm font-medium"
              >
                ➕ Adicionar Pergunta
              </button>
              <button
                onClick={() => router.push('/hub/videos')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#8B5CF6] transition-colors"
              >
                ← Voltar
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Questions List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Perguntas Cadastradas ({questions.length})</h2>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhuma pergunta cadastrada ainda.</p>
              <button
                onClick={openCreateModal}
                className="mt-4 text-[#8B5CF6] hover:text-[#7C3AED] font-medium"
              >
                Adicionar primeira pergunta →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {questions.map((question, qIndex) => (
                <div key={question.id} className="px-6 py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg font-bold text-gray-400">#{question.order + 1}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{question.question_text}</h3>
                      </div>
                      
                      {/* Options */}
                      <div className="ml-8 space-y-2">
                        {question.options.sort((a, b) => a.order - b.order).map((option, oIndex) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-500">
                              {String.fromCharCode(65 + oIndex)})
                            </span>
                            <span className={`text-sm ${option.is_correct ? 'text-green-700 font-semibold' : 'text-gray-700'}`}>
                              {option.option_text}
                              {option.is_correct && ' ✅'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleDelete(question.id!)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                        title="Deletar"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingQuestion ? '✏️ Editar Pergunta' : '➕ Adicionar Nova Pergunta'}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Question Text */}
                    <div>
                      <label htmlFor="question_text" className="block text-sm font-medium text-gray-700 mb-1">
                        Pergunta *
                      </label>
                      <textarea
                        id="question_text"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        required
                        rows={3}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                        placeholder="Digite a pergunta aqui..."
                      />
                    </div>

                    {/* Options */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Opções de Resposta *
                        </label>
                        <button
                          type="button"
                          onClick={addOption}
                          className="text-sm text-[#8B5CF6] hover:text-[#7C3AED] font-medium"
                        >
                          + Adicionar Opção
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {options.map((option, index) => (
                          <div key={index} className="flex items-start space-x-2 p-3 border border-gray-200 rounded-md">
                            <span className="text-sm font-medium text-gray-500 mt-2">
                              {String.fromCharCode(65 + index)})
                            </span>
                            <input
                              type="text"
                              value={option.option_text}
                              onChange={(e) => updateOption(index, 'option_text', e.target.value)}
                              required
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                              placeholder="Digite a opção..."
                            />
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="correct_option"
                                checked={option.is_correct}
                                onChange={() => updateOption(index, 'is_correct', true)}
                                className="w-4 h-4 text-[#8B5CF6] focus:ring-[#8B5CF6]"
                              />
                              <span className="text-sm text-gray-700">Correta</span>
                            </label>
                            {options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        💡 Marque a opção correta usando o botão de rádio
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#8B5CF6] text-base font-medium text-white hover:bg-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingQuestion ? '💾 Salvar' : '➕ Criar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
