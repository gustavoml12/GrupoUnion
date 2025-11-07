'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, MeetingWithMember } from '@/utils/api';
import { getUser, isAuthenticated } from '@/utils/auth';

export default function HubMeetingsPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<MeetingWithMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingWithMember | null>(null);
  const [confirmData, setConfirmData] = useState({ meeting_link: '', location: '', hub_notes: '' });
  const [cancelReason, setCancelReason] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [createData, setCreateData] = useState({
    member_id: '',
    meeting_type: 'ONLINE',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: '60',
    location: '',
    meeting_link: '',
    hub_notes: ''
  });

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

    loadMeetings();
    loadMembers();
  }, [router, statusFilter]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const filters = statusFilter ? { status: statusFilter } : undefined;
      const data = await api.getAllMeetings(filters);
      setMeetings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar reuniões');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const data = await api.getAllMembers();
      setMembers(data);
    } catch (err) {
      console.error('Erro ao carregar membros:', err);
    }
  };

  const handleCreateMeeting = async () => {
    try {
      setError('');
      setSuccess('');

      if (!createData.member_id || !createData.scheduled_date || !createData.scheduled_time) {
        setError('Preencha todos os campos obrigatórios');
        return;
      }

      // Combine date and time
      const scheduledDateTime = `${createData.scheduled_date}T${createData.scheduled_time}:00`;

      const meetingData = {
        meeting_type: createData.meeting_type,
        scheduled_date: scheduledDateTime,
        duration_minutes: parseInt(createData.duration_minutes),
        location: createData.location || undefined,
        meeting_link: createData.meeting_link || undefined,
        hub_notes: createData.hub_notes || undefined
      };

      await api.createMeetingAsHub(createData.member_id, meetingData);
      setSuccess('✅ Reunião criada com sucesso!');
      setShowCreateModal(false);
      setCreateData({
        member_id: '',
        meeting_type: 'ONLINE',
        scheduled_date: '',
        scheduled_time: '',
        duration_minutes: '60',
        location: '',
        meeting_link: '',
        hub_notes: ''
      });
      await loadMeetings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar reunião');
    }
  };

  const openConfirmModal = (meeting: MeetingWithMember) => {
    setSelectedMeeting(meeting);
    setConfirmData({
      meeting_link: meeting.meeting_link || '',
      location: meeting.location || '',
      hub_notes: meeting.hub_notes || ''
    });
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedMeeting) return;

    try {
      setError('');
      await api.confirmMeeting(selectedMeeting.id, confirmData);
      setSuccess('✅ Reunião confirmada com sucesso!');
      setShowConfirmModal(false);
      await loadMeetings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao confirmar reunião');
    }
  };

  const openCancelModal = (meeting: MeetingWithMember) => {
    setSelectedMeeting(meeting);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    if (!selectedMeeting || !cancelReason.trim()) {
      setError('Digite o motivo do cancelamento');
      return;
    }

    try {
      setError('');
      await api.cancelMeetingAdmin(selectedMeeting.id, cancelReason);
      setSuccess('✅ Reunião cancelada com sucesso!');
      setShowCancelModal(false);
      await loadMeetings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar reunião');
    }
  };

  const handleComplete = async (meetingId: string) => {
    if (!confirm('Marcar esta reunião como concluída?')) return;

    try {
      setError('');
      await api.completeMeeting(meetingId);
      setSuccess('✅ Reunião marcada como concluída!');
      await loadMeetings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao completar reunião');
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
      PENDING: '⏳ Pendente',
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

  const getTypeBadge = (type: string) => {
    return type === 'ONLINE' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        💻 Online
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
        🏢 Presencial
      </span>
    );
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
                📅 Gerenciar Reuniões
              </h1>
              <p className="text-sm text-gray-600">Crie e gerencie reuniões com membros</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white rounded-md hover:from-[#7C3AED] hover:to-[#2563EB] transition-all text-sm font-medium"
              >
                ➕ Nova Reunião
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

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filtrar por status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] text-sm"
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendentes</option>
              <option value="CONFIRMED">Confirmadas</option>
              <option value="COMPLETED">Concluídas</option>
              <option value="CANCELLED">Canceladas</option>
            </select>
          </div>
        </div>

        {/* Meetings List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Reuniões ({meetings.length})
            </h2>
          </div>

          {meetings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhuma reunião encontrada.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Member Info */}
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {meeting.member.company_name}
                        </h3>
                        {getStatusBadge(meeting.status)}
                        {getTypeBadge(meeting.meeting_type)}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Contato:</span> {meeting.member.user_name} ({meeting.member.user_email})
                        </p>
                        <p>
                          <span className="font-medium">Data:</span> {formatDate(meeting.scheduled_date)}
                        </p>
                        <p>
                          <span className="font-medium">Duração:</span> {meeting.duration_minutes} minutos
                        </p>
                        {meeting.meeting_type === 'ONLINE' && meeting.meeting_link && (
                          <p>
                            <span className="font-medium">Link:</span>{' '}
                            <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer" className="text-[#8B5CF6] hover:underline">
                              {meeting.meeting_link}
                            </a>
                          </p>
                        )}
                        {meeting.meeting_type === 'PRESENCIAL' && meeting.location && (
                          <p>
                            <span className="font-medium">Local:</span> {meeting.location}
                          </p>
                        )}
                        {meeting.member_notes && (
                          <p>
                            <span className="font-medium">Observações do membro:</span> {meeting.member_notes}
                          </p>
                        )}
                        {meeting.hub_notes && (
                          <p>
                            <span className="font-medium">Observações internas:</span> {meeting.hub_notes}
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
                    <div className="flex items-center space-x-2 ml-4">
                      {meeting.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => openConfirmModal(meeting)}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors"
                            title="Confirmar"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openCancelModal(meeting)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                            title="Cancelar"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                      {meeting.status === 'CONFIRMED' && (
                        <>
                          <button
                            onClick={() => handleComplete(meeting.id)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                            title="Marcar como concluída"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openCancelModal(meeting)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                            title="Cancelar"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Confirm Modal */}
      {showConfirmModal && selectedMeeting && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowConfirmModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  ✅ Confirmar Reunião
                </h3>

                <div className="space-y-4">
                  {selectedMeeting.meeting_type === 'ONLINE' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Link da Reunião
                      </label>
                      <input
                        type="url"
                        value={confirmData.meeting_link}
                        onChange={(e) => setConfirmData({...confirmData, meeting_link: e.target.value})}
                        placeholder="https://meet.google.com/..."
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                      />
                    </div>
                  )}

                  {selectedMeeting.meeting_type === 'PRESENCIAL' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Local da Reunião
                      </label>
                      <input
                        type="text"
                        value={confirmData.location}
                        onChange={(e) => setConfirmData({...confirmData, location: e.target.value})}
                        placeholder="Endereço completo..."
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observações Internas (opcional)
                    </label>
                    <textarea
                      value={confirmData.hub_notes}
                      onChange={(e) => setConfirmData({...confirmData, hub_notes: e.target.value})}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                      placeholder="Anotações internas sobre a reunião..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleConfirm}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  ✅ Confirmar
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedMeeting && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCancelModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  ❌ Cancelar Reunião
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo do Cancelamento *
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={4}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                    placeholder="Digite o motivo do cancelamento (mínimo 10 caracteres)..."
                  />
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleCancel}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  ❌ Cancelar Reunião
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowCreateModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  ➕ Nova Reunião
                </h3>

                <div className="space-y-4">
                  {/* Member Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Membro *
                    </label>
                    <select
                      value={createData.member_id}
                      onChange={(e) => setCreateData({...createData, member_id: e.target.value})}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                    >
                      <option value="">Selecione um membro</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.full_name || member.email} - {member.company_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Meeting Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Reunião *
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="ONLINE"
                          checked={createData.meeting_type === 'ONLINE'}
                          onChange={(e) => setCreateData({...createData, meeting_type: e.target.value})}
                          className="mr-2"
                        />
                        💻 Online
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="PRESENCIAL"
                          checked={createData.meeting_type === 'PRESENCIAL'}
                          onChange={(e) => setCreateData({...createData, meeting_type: e.target.value})}
                          className="mr-2"
                        />
                        🏢 Presencial
                      </label>
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data *
                      </label>
                      <input
                        type="date"
                        value={createData.scheduled_date}
                        onChange={(e) => setCreateData({...createData, scheduled_date: e.target.value})}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Horário *
                      </label>
                      <input
                        type="time"
                        value={createData.scheduled_time}
                        onChange={(e) => setCreateData({...createData, scheduled_time: e.target.value})}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duração
                    </label>
                    <select
                      value={createData.duration_minutes}
                      onChange={(e) => setCreateData({...createData, duration_minutes: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                    >
                      <option value="30">30 minutos</option>
                      <option value="60">60 minutos</option>
                      <option value="90">90 minutos</option>
                      <option value="120">120 minutos</option>
                    </select>
                  </div>

                  {/* Link or Location */}
                  {createData.meeting_type === 'ONLINE' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Link da Reunião
                      </label>
                      <input
                        type="url"
                        value={createData.meeting_link}
                        onChange={(e) => setCreateData({...createData, meeting_link: e.target.value})}
                        placeholder="https://meet.google.com/..."
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Local
                      </label>
                      <input
                        type="text"
                        value={createData.location}
                        onChange={(e) => setCreateData({...createData, location: e.target.value})}
                        placeholder="Endereço do local..."
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                      />
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observações Internas
                    </label>
                    <textarea
                      value={createData.hub_notes}
                      onChange={(e) => setCreateData({...createData, hub_notes: e.target.value})}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                      placeholder="Observações internas sobre a reunião..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleCreateMeeting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-base font-medium text-white hover:from-[#7C3AED] hover:to-[#2563EB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] sm:ml-3 sm:w-auto sm:text-sm"
                >
                  ➕ Criar Reunião
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
