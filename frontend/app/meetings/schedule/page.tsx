'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Meeting, MeetingCreate } from '@/utils/api';
import { getUser, isAuthenticated } from '@/utils/auth';

export default function ScheduleMeetingPage() {
  const router = useRouter();
  const [myMeetings, setMyMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [meetingType, setMeetingType] = useState<'ONLINE' | 'PRESENCIAL'>('ONLINE');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [memberNotes, setMemberNotes] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadMyMeetings();
  }, [router]);

  const loadMyMeetings = async () => {
    try {
      setLoading(true);
      const data = await api.getMyMeetings(false);
      setMyMeetings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar reuniões');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!scheduledDate || !scheduledTime) {
      setError('Selecione data e hora da reunião');
      return;
    }

    // Combine date and time
    const dateTimeString = `${scheduledDate}T${scheduledTime}:00`;
    const meetingDateTime = new Date(dateTimeString);

    // Check if date is in the future
    if (meetingDateTime < new Date()) {
      setError('A data da reunião deve ser no futuro');
      return;
    }

    const meetingData: MeetingCreate = {
      meeting_type: meetingType,
      scheduled_date: meetingDateTime.toISOString(),
      duration_minutes: durationMinutes,
      member_notes: memberNotes || undefined
    };

    try {
      await api.createMeeting(meetingData);
      setSuccess('✅ Reunião agendada com sucesso! Aguarde a confirmação do Hub.');
      setShowModal(false);
      // Reset form
      setScheduledDate('');
      setScheduledTime('');
      setMemberNotes('');
      await loadMyMeetings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao agendar reunião');
    }
  };

  const handleCancel = async (meetingId: string) => {
    const reason = prompt('Digite o motivo do cancelamento (mínimo 10 caracteres):');
    if (!reason || reason.length < 10) {
      alert('Motivo inválido. Digite pelo menos 10 caracteres.');
      return;
    }

    try {
      setError('');
      await api.cancelMyMeeting(meetingId, reason);
      setSuccess('✅ Reunião cancelada com sucesso!');
      await loadMyMeetings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar reunião');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800'
    };
    const labels = {
      PENDING: '⏳ Aguardando Confirmação',
      CONFIRMED: '✅ Confirmada',
      CANCELLED: '❌ Cancelada',
      COMPLETED: '✓ Concluída'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Check if user has pending meeting
  const hasPendingMeeting = myMeetings.some(m => m.status === 'PENDING');

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
                📅 Minhas Reuniões
              </h1>
              <p className="text-sm text-gray-600">Agende e gerencie suas reuniões</p>
            </div>
            <div className="flex space-x-3">
              {!hasPendingMeeting && (
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white rounded-md hover:from-[#7C3AED] hover:to-[#2563EB] transition-all text-sm font-medium"
                >
                  ➕ Agendar Reunião
                </button>
              )}
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

        {/* Info Card */}
        {hasPendingMeeting && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Você já possui uma reunião pendente
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Aguarde a confirmação ou cancele a reunião atual para agendar uma nova.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Meetings List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Reuniões Agendadas ({myMeetings.length})
            </h2>
          </div>

          {myMeetings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Você ainda não tem reuniões agendadas.</p>
              <button
                onClick={() => setShowModal(true)}
                className="text-[#8B5CF6] hover:text-[#7C3AED] font-medium"
              >
                Agendar primeira reunião →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {myMeetings.map((meeting) => (
                <div key={meeting.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {meeting.meeting_type === 'ONLINE' ? '💻 Reunião Online' : '🏢 Reunião Presencial'}
                        </h3>
                        {getStatusBadge(meeting.status)}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Data:</span> {formatDate(meeting.scheduled_date)}
                        </p>
                        <p>
                          <span className="font-medium">Duração:</span> {meeting.duration_minutes} minutos
                        </p>
                        {meeting.meeting_link && (
                          <p>
                            <span className="font-medium">Link:</span>{' '}
                            <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer" className="text-[#8B5CF6] hover:underline">
                              Acessar reunião
                            </a>
                          </p>
                        )}
                        {meeting.location && (
                          <p>
                            <span className="font-medium">Local:</span> {meeting.location}
                          </p>
                        )}
                        {meeting.member_notes && (
                          <p>
                            <span className="font-medium">Suas observações:</span> {meeting.member_notes}
                          </p>
                        )}
                        {meeting.hub_notes && (
                          <p className="text-blue-600">
                            <span className="font-medium">Observações do Hub:</span> {meeting.hub_notes}
                          </p>
                        )}
                        {meeting.cancellation_reason && (
                          <p className="text-red-600">
                            <span className="font-medium">Motivo do cancelamento:</span> {meeting.cancellation_reason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {meeting.status === 'PENDING' && (
                      <div className="ml-4">
                        <button
                          onClick={() => handleCancel(meeting.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    📅 Agendar Nova Reunião
                  </h3>

                  <div className="space-y-4">
                    {/* Meeting Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Reunião *
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            value="ONLINE"
                            checked={meetingType === 'ONLINE'}
                            onChange={(e) => setMeetingType(e.target.value as 'ONLINE')}
                            className="w-4 h-4 text-[#8B5CF6] focus:ring-[#8B5CF6]"
                          />
                          <span className="ml-2 text-sm text-gray-700">💻 Online</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            value="PRESENCIAL"
                            checked={meetingType === 'PRESENCIAL'}
                            onChange={(e) => setMeetingType(e.target.value as 'PRESENCIAL')}
                            className="w-4 h-4 text-[#8B5CF6] focus:ring-[#8B5CF6]"
                          />
                          <span className="ml-2 text-sm text-gray-700">🏢 Presencial</span>
                        </label>
                      </div>
                    </div>

                    {/* Date */}
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                        Data *
                      </label>
                      <input
                        type="date"
                        id="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={getMinDate()}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                      />
                    </div>

                    {/* Time */}
                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                        Horário *
                      </label>
                      <input
                        type="time"
                        id="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                      />
                    </div>

                    {/* Duration */}
                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                        Duração
                      </label>
                      <select
                        id="duration"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                      >
                        <option value="30">30 minutos</option>
                        <option value="60">60 minutos</option>
                        <option value="90">90 minutos</option>
                        <option value="120">120 minutos</option>
                      </select>
                    </div>

                    {/* Notes */}
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                        Observações (opcional)
                      </label>
                      <textarea
                        id="notes"
                        value={memberNotes}
                        onChange={(e) => setMemberNotes(e.target.value)}
                        rows={3}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                        placeholder="Adicione informações relevantes sobre a reunião..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#8B5CF6] text-base font-medium text-white hover:bg-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    📅 Agendar
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
