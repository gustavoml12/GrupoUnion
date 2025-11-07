'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, OnboardingVideo, OnboardingVideoCreate } from '@/utils/api';
import { getUser, isAuthenticated } from '@/utils/auth';

export default function HubVideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<OnboardingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<OnboardingVideo | null>(null);

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

    loadVideos();
  }, [router]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data = await api.getAllVideosAdmin(true);
      setVideos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar vídeos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData(e.target as HTMLFormElement);
    const videoData: OnboardingVideoCreate = {
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      video_url: formData.get('video_url') as string,
      provider: formData.get('provider') as 'YOUTUBE' | 'PANDA' | 'VIMEO',
      thumbnail_url: formData.get('thumbnail_url') as string || undefined,
      duration_minutes: formData.get('duration_minutes') ? parseInt(formData.get('duration_minutes') as string) : undefined,
      order: formData.get('order') ? parseInt(formData.get('order') as string) : 0,
      is_active: formData.get('is_active') === 'true',
    };

    try {
      if (editingVideo) {
        await api.updateVideo(editingVideo.id, videoData);
        setSuccess('✅ Vídeo atualizado com sucesso!');
      } else {
        await api.createVideo(videoData);
        setSuccess('✅ Vídeo criado com sucesso!');
      }
      
      setShowModal(false);
      setEditingVideo(null);
      await loadVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar vídeo');
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Tem certeza que deseja deletar este vídeo?')) return;

    try {
      setError('');
      setSuccess('');
      await api.deleteVideo(videoId);
      setSuccess('✅ Vídeo deletado com sucesso!');
      await loadVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar vídeo');
    }
  };

  const openEditModal = (video: OnboardingVideo) => {
    setEditingVideo(video);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingVideo(null);
    setShowModal(true);
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
                🎥 Gerenciar Vídeos de Onboarding
              </h1>
              <p className="text-sm text-gray-600">Trilha de vídeos para novos membros</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white rounded-md hover:from-[#7C3AED] hover:to-[#2563EB] transition-all text-sm font-medium"
              >
                ➕ Adicionar Vídeo
              </button>
              <button
                onClick={() => router.push('/dashboard')}
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

        {/* Videos List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Vídeos Cadastrados ({videos.length})</h2>
          </div>

          {videos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum vídeo cadastrado ainda.</p>
              <button
                onClick={openCreateModal}
                className="mt-4 text-[#8B5CF6] hover:text-[#7C3AED] font-medium"
              >
                Adicionar primeiro vídeo →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {videos.map((video) => (
                <div key={video.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl font-bold text-gray-400">#{video.order}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{video.title}</h3>
                          {video.description && (
                            <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {video.provider}
                        </span>
                        {video.duration_minutes && (
                          <span className="text-gray-500">⏱️ {video.duration_minutes} min</span>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          video.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {video.is_active ? '✅ Ativo' : '⏸️ Inativo'}
                        </span>
                        <a
                          href={video.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#8B5CF6] hover:text-[#7C3AED]"
                        >
                          🔗 Ver URL
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => router.push(`/hub/videos/${video.id}/questions`)}
                        className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-md transition-colors"
                        title="Gerenciar Perguntas"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => openEditModal(video)}
                        className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-colors"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
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
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingVideo ? '✏️ Editar Vídeo' : '➕ Adicionar Novo Vídeo'}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Título *
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        defaultValue={editingVideo?.title || ''}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                        placeholder="Ex: Bem-vindo ao Grupo Union"
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        rows={3}
                        defaultValue={editingVideo?.description || ''}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                        placeholder="Breve descrição do conteúdo do vídeo"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
                          Plataforma *
                        </label>
                        <select
                          name="provider"
                          id="provider"
                          required
                          defaultValue={editingVideo?.provider || 'YOUTUBE'}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                        >
                          <option value="YOUTUBE">YouTube</option>
                          <option value="PANDA">Panda Video</option>
                          <option value="VIMEO">Vimeo</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-1">
                          Duração (min)
                        </label>
                        <input
                          type="number"
                          name="duration_minutes"
                          id="duration_minutes"
                          min="1"
                          defaultValue={editingVideo?.duration_minutes || ''}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                          placeholder="10"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-1">
                        URL do Vídeo *
                      </label>
                      <input
                        type="url"
                        name="video_url"
                        id="video_url"
                        required
                        defaultValue={editingVideo?.video_url || ''}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>

                    <div>
                      <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-700 mb-1">
                        URL da Thumbnail (opcional)
                      </label>
                      <input
                        type="url"
                        name="thumbnail_url"
                        id="thumbnail_url"
                        defaultValue={editingVideo?.thumbnail_url || ''}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                        placeholder="https://..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                          Ordem *
                        </label>
                        <input
                          type="number"
                          name="order"
                          id="order"
                          required
                          min="0"
                          defaultValue={editingVideo?.order ?? 0}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-1">
                          Status *
                        </label>
                        <select
                          name="is_active"
                          id="is_active"
                          required
                          defaultValue={editingVideo?.is_active ? 'true' : 'false'}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                        >
                          <option value="true">Ativo</option>
                          <option value="false">Inativo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#8B5CF6] text-base font-medium text-white hover:bg-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingVideo ? '💾 Salvar' : '➕ Criar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingVideo(null);
                    }}
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
