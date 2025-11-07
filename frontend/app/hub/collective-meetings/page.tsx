'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, CollectiveMeeting, CollectiveMeetingStats, CollectiveMeetingWithAttendees } from '@/utils/api';
import { getUser, isAuthenticated } from '@/utils/auth';

export default function HubCollectiveMeetingsPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<CollectiveMeeting[]>([]);
  const [stats, setStats] = useState<CollectiveMeetingStats | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<CollectiveMeetingWithAttendees | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  
  const [createData, setCreateData] = useState({
    title: '',
    description: '',
    meeting_type: 'ONLINE' as 'ONLINE' | 'PRESENCIAL',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: '60',
    location: '',
    meeting_link: '',
    agenda: ''
  });

  const [attendanceData, setAttendanceData] = useState<string[]>([]);

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

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [meetingsData, statsData] = await Promise.all([
        api.getCollectiveMeetings(),
        api.getCollectiveMeetingStats()
      ]);
      
      setMeetings(meetingsData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async () => {
    try {
      setError('');
      setSuccess('');
      
      if (!createData.title || !createData.scheduled_date || !createData.scheduled_time) {
        setError('Preencha todos os campos obrigatórios');
        return;
      }

      if (createData.meeting_type === 'ONLINE' && !createData.meeting_link) {
        setError('Link da reunião é obrigatório para reuniões online');
        return;
      }

      if (createData.meeting_type === 'PRESENCIAL' && !createData.location) {
        setError('Local é obrigatório para reuniões presenciais');
        return;
      }

      const meetingDateTime = `${createData.scheduled_date}T${createData.scheduled_time}:00`;

      await api.createCollectiveMeeting({
        title: createData.title,
        description: createData.description || undefined,
        meeting_type: createData.meeting_type,
        scheduled_date: meetingDateTime,
        duration_minutes: parseInt(createData.duration_minutes),
        location: createData.location || undefined,
        meeting_link: createData.meeting_link || undefined,
        agenda: createData.agenda || undefined
      });

      setSuccess('✅ Reunião criada! Todos os membros ativos foram convidados.');
      setShowCreateModal(false);
      setCreateData({
        title: '',
        description: '',
        meeting_type: 'ONLINE',
        scheduled_date: '',
        scheduled_time: '',
        duration_minutes: '60',
        location: '',
        meeting_link: '',
        agenda: ''
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar reunião');
    }
  };

  const openDetailsModal = async (meetingId: string) => {
    try {
      const meetingDetails = await api.getCollectiveMeeting(meetingId);
      setSelectedMeeting(meetingDetails);
      setShowDetailsModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes');
    }
  };

  const openAttendanceModal = async (meetingId: string) => {
    try {
      const meetingDetails = await api.getCollectiveMeeting(meetingId);
      setSelectedMeeting(meetingDetails);
      setAttendanceData([]);
      setShowAttendanceModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar participantes');
    }
  };

  const handleMarkAttendance = async () => {
    if (!selectedMeeting) return;
    
    try {
      await api.markMeetingAttendance(selectedMeeting.id, attendanceData);
      setSuccess('✅ Presença registrada!');
      setShowAttendanceModal(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar presença');
    }
  };

  const handleCompleteMeeting = async (meetingId: string) => {
    const notes = prompt('Adicione observações sobre a reunião (opcional):');
    
    try {
      await api.completeCollectiveMeeting(meetingId, notes || undefined);
      setSuccess('✅ Reunião marcada como realizada!');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao completar reunião');
    }
  };

  const handleCancelMeeting = async (meetingId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta reunião?')) return;
    
    try {
      await api.cancelCollectiveMeeting(meetingId);
      setSuccess('✅ Reunião cancelada');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar reunião');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { label: string; class: string } } = {
      AGENDADA: { label: '📅 Agendada', class: 'bg-blue-100 text-blue-800' },
      CONFIRMADA: { label: '✅ Confirmada', class: 'bg-green-100 text-green-800' },
      REALIZADA: { label: '🎉 Realizada', class: 'bg-purple-100 text-purple-800' },
      CANCELADA: { label: '❌ Cancelada', class: 'bg-red-100 text-red-800' }
    };
    const badge = badges[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>{badge.label}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
                👥 Reuniões Coletivas
              </h1>
              <p className="text-sm text-gray-600">Gerencie reuniões com todos os membros</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white rounded-md hover:from-[#7C3AED] hover:to-[#2563EB] text-sm font-medium"
              >
                ➕ Nova Reunião
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#8B5CF6]"
              >
                ← Voltar
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}
        {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">{success}</div>}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-[#8B5CF6]">{stats.total_meetings}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Próximas</p>
              <p className="text-2xl font-bold text-blue-600">{stats.upcoming_meetings}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Realizadas</p>
              <p className="text-2xl font-bold text-green-600">{stats.past_meetings}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Taxa de Presença</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.average_attendance_rate ? `${stats.average_attendance_rate.toFixed(0)}%` : 'N/A'}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Todas as Reuniões</h2>
          </div>

          {meetings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhuma reunião agendada</p>
            </div>
          ) : (
            <div className="divide-y">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium">{meeting.title}</h3>
                        {getStatusBadge(meeting.status)}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>📅 {formatDate(meeting.scheduled_date)}</p>
                        <p>⏱️ {meeting.duration_minutes} minutos</p>
                        <p>
                          {meeting.meeting_type === 'ONLINE' ? '💻 Online' : '📍 Presencial'}
                          {meeting.meeting_type === 'ONLINE' && meeting.meeting_link && ` - ${meeting.meeting_link}`}
                          {meeting.meeting_type === 'PRESENCIAL' && meeting.location && ` - ${meeting.location}`}
                        </p>
                        {meeting.description && <p className="text-gray-700 mt-2">{meeting.description}</p>}
                        
                        <div className="mt-2 flex items-center space-x-4 text-xs">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            👥 {meeting.total_invited} convidados
                          </span>
                          <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                            ✅ {meeting.total_confirmed} confirmados
                          </span>
                          {meeting.status === 'REALIZADA' && (
                            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">
                              🎯 {meeting.total_attended} presentes
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => openDetailsModal(meeting.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      >
                        👁️ Ver Detalhes
                      </button>
                      
                      {meeting.status === 'AGENDADA' && (
                        <>
                          <button
                            onClick={() => openAttendanceModal(meeting.id)}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
                          >
                            📋 Registrar Presença
                          </button>
                          <button
                            onClick={() => handleCompleteMeeting(meeting.id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                          >
                            ✓ Marcar Realizada
                          </button>
                          <button
                            onClick={() => handleCancelMeeting(meeting.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                          >
                            ✕ Cancelar
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

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowCreateModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">➕ Nova Reunião Coletiva</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                  <input 
                    type="text" 
                    value={createData.title} 
                    onChange={(e) => setCreateData({...createData, title: e.target.value})} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent bg-white text-gray-900"
                    placeholder="Ex: Reunião Mensal - Janeiro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea 
                    value={createData.description} 
                    onChange={(e) => setCreateData({...createData, description: e.target.value})} 
                    rows={3} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent bg-white text-gray-900"
                    placeholder="Descreva o objetivo da reunião..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <select 
                    value={createData.meeting_type} 
                    onChange={(e) => setCreateData({...createData, meeting_type: e.target.value as 'ONLINE' | 'PRESENCIAL'})} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="ONLINE">💻 Online</option>
                    <option value="PRESENCIAL">📍 Presencial</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                    <input 
                      type="date" 
                      value={createData.scheduled_date} 
                      onChange={(e) => setCreateData({...createData, scheduled_date: e.target.value})} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horário *</label>
                    <input 
                      type="time" 
                      value={createData.scheduled_time} 
                      onChange={(e) => setCreateData({...createData, scheduled_time: e.target.value})} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent bg-white text-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duração</label>
                  <select 
                    value={createData.duration_minutes} 
                    onChange={(e) => setCreateData({...createData, duration_minutes: e.target.value})} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="30">30 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                    <option value="120">120 min</option>
                  </select>
                </div>
                {createData.meeting_type === 'ONLINE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link da Reunião *</label>
                    <input 
                      type="url" 
                      value={createData.meeting_link} 
                      onChange={(e) => setCreateData({...createData, meeting_link: e.target.value})} 
                      placeholder="https://meet.google.com/..." 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent bg-white text-gray-900"
                    />
                  </div>
                )}
                {createData.meeting_type === 'PRESENCIAL' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Local *</label>
                    <input 
                      type="text" 
                      value={createData.location} 
                      onChange={(e) => setCreateData({...createData, location: e.target.value})} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent bg-white text-gray-900"
                      placeholder="Ex: Sala de Reuniões - Edifício Union"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pauta</label>
                  <textarea 
                    value={createData.agenda} 
                    onChange={(e) => setCreateData({...createData, agenda: e.target.value})} 
                    rows={3} 
                    placeholder="Tópicos a serem discutidos..." 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent bg-white text-gray-900"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Cancelar</button>
                <button onClick={handleCreateMeeting} className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white rounded-md hover:from-[#7C3AED] hover:to-[#2563EB]">➕ Criar Reunião</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedMeeting && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowDetailsModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-3xl w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedMeeting.title}</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <p className="text-sm text-gray-600">{selectedMeeting.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Data:</strong> {formatDate(selectedMeeting.scheduled_date)}</div>
                  <div><strong>Duração:</strong> {selectedMeeting.duration_minutes} min</div>
                  <div><strong>Tipo:</strong> {selectedMeeting.meeting_type === 'ONLINE' ? '💻 Online' : '📍 Presencial'}</div>
                  <div><strong>Status:</strong> {getStatusBadge(selectedMeeting.status)}</div>
                </div>
                {selectedMeeting.agenda && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <strong className="text-sm">Pauta:</strong>
                    <p className="text-sm mt-1">{selectedMeeting.agenda}</p>
                  </div>
                )}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Participantes ({selectedMeeting.attendees.length})</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedMeeting.attendees.map((att) => (
                      <div key={att.member_id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{att.member_name}</p>
                          <p className="text-xs text-gray-600">{att.company_name}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {att.confirmed && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">✅ Confirmou</span>}
                          {att.attended && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">🎯 Presente</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && selectedMeeting && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowAttendanceModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">📋 Registrar Presença</h3>
              <p className="text-sm text-gray-600 mb-4">Marque os membros que compareceram à reunião:</p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedMeeting.attendees.map((att) => (
                  <label key={att.member_id} className="flex items-center p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer border border-gray-200">
                    <input
                      type="checkbox"
                      checked={attendanceData.includes(att.member_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAttendanceData([...attendanceData, att.member_id]);
                        } else {
                          setAttendanceData(attendanceData.filter(id => id !== att.member_id));
                        }
                      }}
                      className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{att.member_name}</p>
                      <p className="text-xs text-gray-600">{att.company_name}</p>
                    </div>
                    {att.confirmed && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">✅ Confirmou</span>}
                  </label>
                ))}
              </div>
              <div className="flex justify-between items-center mt-6">
                <p className="text-sm text-gray-600">{attendanceData.length} de {selectedMeeting.attendees.length} presentes</p>
                <div className="flex space-x-3">
                  <button onClick={() => setShowAttendanceModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Cancelar</button>
                  <button onClick={handleMarkAttendance} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">💾 Salvar Presença</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
