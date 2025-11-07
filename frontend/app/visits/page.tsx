'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Visit, VisitStats, Member } from '@/utils/api';
import { getUser, isAuthenticated } from '@/utils/auth';

export default function VisitsPage() {
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewMode, setViewMode] = useState<'made' | 'received'>('made');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  
  const [createData, setCreateData] = useState({
    visited_id: '',
    purpose: 'CONHECER_SERVICOS',
    visit_date: '',
    visit_time: '',
    duration_minutes: '60',
    location: '',
    visitor_notes: ''
  });
  
  const [completeData, setCompleteData] = useState({
    visit_summary: '',
    services_learned: '',
    potential_referrals: '',
    networking_quality: 0,
    follow_up_needed: '',
    follow_up_date: ''
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const user = getUser();
    if (user?.role !== 'MEMBER') {
      router.push('/dashboard');
      return;
    }

    loadData();
  }, [router, viewMode]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [visitsData, statsData, membersData] = await Promise.all([
        api.getMyVisits(viewMode === 'made'),
        api.getMyVisitStats(),
        api.getAllMembers()
      ]);
      
      setVisits(visitsData);
      setStats(statsData);
      setMembers(membersData as any); // Members are users with member role
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVisit = async () => {
    try {
      setError('');
      setSuccess('');
      if (!createData.visited_id || !createData.visit_date || !createData.visit_time) {
        setError('Preencha todos os campos obrigatórios');
        return;
      }
      const visitDateTime = `${createData.visit_date}T${createData.visit_time}:00`;
      await api.createVisit({
        visited_id: createData.visited_id,
        purpose: createData.purpose,
        visit_date: visitDateTime,
        duration_minutes: parseInt(createData.duration_minutes),
        location: createData.location || undefined,
        visitor_notes: createData.visitor_notes || undefined
      });
      setSuccess('✅ Visita registrada com sucesso!');
      setShowCreateModal(false);
      setCreateData({ visited_id: '', purpose: 'CONHECER_SERVICOS', visit_date: '', visit_time: '', duration_minutes: '60', location: '', visitor_notes: '' });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar visita');
    }
  };

  const openCompleteModal = (visit: Visit) => {
    setSelectedVisit(visit);
    setCompleteData({ visit_summary: '', services_learned: '', potential_referrals: '', networking_quality: 0, follow_up_needed: '', follow_up_date: '' });
    setShowCompleteModal(true);
  };

  const handleCompleteVisit = async () => {
    if (!selectedVisit) return;
    try {
      setError('');
      if (!completeData.visit_summary || completeData.visit_summary.length < 10) {
        setError('O resumo deve ter no mínimo 10 caracteres');
        return;
      }
      await api.completeVisit(selectedVisit.id, completeData);
      setSuccess('✅ Visita marcada como realizada!');
      setShowCompleteModal(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao completar visita');
    }
  };

  const handleCancelVisit = async (visitId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta visita?')) return;
    try {
      await api.cancelVisit(visitId);
      setSuccess('✅ Visita cancelada');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar visita');
    }
  };

  const getPurposeLabel = (purpose: string) => {
    const labels: { [key: string]: string } = {
      CONHECER_SERVICOS: 'Conhecer Serviços', NETWORKING: 'Networking', PARCERIA: 'Parceria',
      INDICACAO: 'Indicação', FOLLOW_UP: 'Follow-up', OUTRO: 'Outro'
    };
    return labels[purpose] || purpose;
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { label: string; class: string } } = {
      AGENDADA: { label: '📅 Agendada', class: 'bg-blue-100 text-blue-800' },
      REALIZADA: { label: '✅ Realizada', class: 'bg-green-100 text-green-800' },
      CANCELADA: { label: '❌ Cancelada', class: 'bg-red-100 text-red-800' }
    };
    const badge = badges[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>{badge.label}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
                🤝 Minhas Visitas
              </h1>
              <p className="text-sm text-gray-600">Registre visitas a outros membros</p>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white rounded-md hover:from-[#7C3AED] hover:to-[#2563EB] text-sm font-medium">
                ➕ Registrar Visita
              </button>
              <button onClick={() => router.push('/dashboard')} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#8B5CF6]">
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
              <p className="text-2xl font-bold text-[#8B5CF6]">{stats.total_visits}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Realizadas</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed_visits}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Qualidade</p>
              <p className="text-2xl font-bold text-blue-600">{stats.average_networking_quality ? `${stats.average_networking_quality.toFixed(1)}/5` : 'N/A'}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Indicações</p>
              <p className="text-2xl font-bold text-orange-600">{stats.total_potential_referrals}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow mb-6">
          <nav className="-mb-px flex border-b">
            <button onClick={() => setViewMode('made')} className={`py-4 px-6 text-sm font-medium border-b-2 ${viewMode === 'made' ? 'border-[#8B5CF6] text-[#8B5CF6]' : 'border-transparent text-gray-500'}`}>
              🚶 Feitas ({stats?.visits_made || 0})
            </button>
            <button onClick={() => setViewMode('received')} className={`py-4 px-6 text-sm font-medium border-b-2 ${viewMode === 'received' ? 'border-[#8B5CF6] text-[#8B5CF6]' : 'border-transparent text-gray-500'}`}>
              👋 Recebidas ({stats?.visits_received || 0})
            </button>
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">{viewMode === 'made' ? 'Visitas que Realizei' : 'Visitas que Recebi'}</h2>
          </div>
          {visits.length === 0 ? (
            <div className="text-center py-12"><p className="text-gray-500">Nenhuma visita registrada</p></div>
          ) : (
            <div className="divide-y">
              {visits.map((visit) => (
                <div key={visit.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium">{getPurposeLabel(visit.purpose)}</h3>
                        {getStatusBadge(visit.status)}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>📅 {formatDate(visit.visit_date)}</p>
                        <p>⏱️ {visit.duration_minutes} min</p>
                        {visit.location && <p>📍 {visit.location}</p>}
                        {visit.visitor_notes && <p>📝 {visit.visitor_notes}</p>}
                        {visit.status === 'REALIZADA' && visit.visit_summary && (
                          <div className="mt-3 p-3 bg-green-50 rounded-md">
                            <p className="font-medium text-green-900">Resumo:</p>
                            <p className="text-green-800">{visit.visit_summary}</p>
                            {visit.networking_quality && <p className="mt-1">⭐ {visit.networking_quality}/5</p>}
                          </div>
                        )}
                      </div>
                    </div>
                    {viewMode === 'made' && visit.status === 'AGENDADA' && (
                      <div className="flex flex-col space-y-2 ml-4">
                        <button onClick={() => openCompleteModal(visit)} className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">
                          ✓ Realizada
                        </button>
                        <button onClick={() => handleCancelVisit(visit.id)} className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700">
                          ✕ Cancelar
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
      
      {/* Create Visit Modal */}
      {showCreateModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowCreateModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">➕ Registrar Nova Visita</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Membro a Visitar *</label>
                    <select value={createData.visited_id} onChange={(e) => setCreateData({...createData, visited_id: e.target.value})} required className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-[#8B5CF6] sm:text-sm">
                      <option value="">Selecione um membro</option>
                      {members.map((member: any) => (
                        <option key={member.id} value={member.id}>{member.full_name || member.email} - {member.company_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Propósito *</label>
                    <select value={createData.purpose} onChange={(e) => setCreateData({...createData, purpose: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-[#8B5CF6] sm:text-sm">
                      <option value="CONHECER_SERVICOS">Conhecer Serviços</option>
                      <option value="NETWORKING">Networking</option>
                      <option value="PARCERIA">Parceria</option>
                      <option value="INDICACAO">Indicação</option>
                      <option value="FOLLOW_UP">Follow-up</option>
                      <option value="OUTRO">Outro</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                      <input type="date" value={createData.visit_date} onChange={(e) => setCreateData({...createData, visit_date: e.target.value})} required className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-[#8B5CF6] sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Horário *</label>
                      <input type="time" value={createData.visit_time} onChange={(e) => setCreateData({...createData, visit_time: e.target.value})} required className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-[#8B5CF6] sm:text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duração</label>
                    <select value={createData.duration_minutes} onChange={(e) => setCreateData({...createData, duration_minutes: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-[#8B5CF6] sm:text-sm">
                      <option value="30">30 minutos</option>
                      <option value="60">60 minutos</option>
                      <option value="90">90 minutos</option>
                      <option value="120">120 minutos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                    <input type="text" value={createData.location} onChange={(e) => setCreateData({...createData, location: e.target.value})} placeholder="Endereço ou nome do local..." className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6] sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                    <textarea value={createData.visitor_notes} onChange={(e) => setCreateData({...createData, visitor_notes: e.target.value})} rows={3} placeholder="O que você espera desta visita..." className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6] sm:text-sm" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button onClick={handleCreateVisit} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-base font-medium text-white hover:from-[#7C3AED] hover:to-[#2563EB] sm:ml-3 sm:w-auto sm:text-sm">
                  ➕ Registrar Visita
                </button>
                <button onClick={() => setShowCreateModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Visit Modal */}
      {showCompleteModal && selectedVisit && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowCompleteModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">✓ Marcar Visita como Realizada</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resumo da Visita * (mín 10 caracteres)</label>
                    <textarea value={completeData.visit_summary} onChange={(e) => setCompleteData({...completeData, visit_summary: e.target.value})} rows={4} required placeholder="Descreva como foi a visita, principais pontos discutidos..." className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6] sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Serviços/Produtos Conhecidos</label>
                    <textarea value={completeData.services_learned} onChange={(e) => setCompleteData({...completeData, services_learned: e.target.value})} rows={3} placeholder="Quais serviços ou produtos você conheceu..." className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6] sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Potenciais Indicações</label>
                    <textarea value={completeData.potential_referrals} onChange={(e) => setCompleteData({...completeData, potential_referrals: e.target.value})} rows={2} placeholder="Identificou oportunidades de indicação?" className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6] sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Qualidade do Networking</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button key={rating} onClick={() => setCompleteData({...completeData, networking_quality: rating})} className={`px-4 py-2 rounded-md text-sm font-medium ${completeData.networking_quality === rating ? 'bg-[#8B5CF6] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                          {rating}⭐
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Necessário</label>
                    <input type="text" value={completeData.follow_up_needed} onChange={(e) => setCompleteData({...completeData, follow_up_needed: e.target.value})} placeholder="Ex: Enviar proposta, agendar nova reunião..." className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5CF6] sm:text-sm" />
                  </div>
                  {completeData.follow_up_needed && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data do Follow-up</label>
                      <input type="date" value={completeData.follow_up_date} onChange={(e) => setCompleteData({...completeData, follow_up_date: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-[#8B5CF6] sm:text-sm" />
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button onClick={handleCompleteVisit} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 sm:ml-3 sm:w-auto sm:text-sm">
                  ✓ Marcar como Realizada
                </button>
                <button onClick={() => setShowCompleteModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
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
