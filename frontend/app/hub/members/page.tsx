'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, User } from '@/utils/api';
import { getUser, isAuthenticated } from '@/utils/auth';

type FilterType = 'all' | 'VISITOR' | 'MEMBER' | 'HUB' | 'ADMIN';
type StatusFilter = 'all' | 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export default function HubMembersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roleFilter, setRoleFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userPayment, setUserPayment] = useState<any>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [memberStats, setMemberStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'referrals' | 'feedback'>('info');

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const user = getUser();
    setCurrentUser(user);

    // Check if user is HUB or ADMIN
    if (user?.role !== 'HUB' && user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    // Load all users
    loadAllUsers();
  }, [router]);

  useEffect(() => {
    // Apply filters
    let filtered = allUsers;

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.full_name?.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.phone?.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(filtered);
  }, [allUsers, roleFilter, statusFilter, searchTerm]);

  const loadAllUsers = async () => {
    try {
      setLoading(true);
      const users = await api.getAllUsers();
      setAllUsers(users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { color: string; text: string; icon: string }> = {
      VISITOR: { color: 'bg-yellow-100 text-yellow-800', text: 'Visitante', icon: '👤' },
      MEMBER: { color: 'bg-green-100 text-green-800', text: 'Membro', icon: '✅' },
      HUB: { color: 'bg-purple-100 text-purple-800', text: 'Hub', icon: '⚙️' },
      ADMIN: { color: 'bg-red-100 text-red-800', text: 'Admin', icon: '👑' },
    };
    const badge = badges[role] || { color: 'bg-gray-100 text-gray-800', text: role, icon: '?' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', text: '⏳ Pendente' },
      ACTIVE: { color: 'bg-green-100 text-green-800', text: '✅ Ativo' },
      SUSPENDED: { color: 'bg-orange-100 text-orange-800', text: '⏸️ Suspenso' },
      INACTIVE: { color: 'bg-gray-100 text-gray-800', text: '❌ Inativo' },
    };
    const badge = badges[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleViewPayment = async (user: User) => {
    setSelectedUser(user);
    setLoadingPayment(true);
    setShowPaymentModal(true);
    
    try {
      // Buscar todos os pagamentos e filtrar pelo usuário
      const allPayments = await api.getPendingPayments();
      const userPaymentData = allPayments.find(p => p.user_id === user.id);
      
      // Se não encontrou nos pendentes, tentar buscar qualquer pagamento do usuário
      if (!userPaymentData) {
        // Aqui você pode adicionar uma chamada para buscar todos os pagamentos do usuário
        // Por enquanto, vamos mostrar que não há pagamento
        setUserPayment(null);
      } else {
        setUserPayment(userPaymentData);
      }
    } catch (err) {
      console.error('Erro ao buscar pagamento:', err);
      setUserPayment(null);
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleVerifyPayment = async (paymentId: string, approved: boolean, reason?: string) => {
    try {
      setError('');
      setSuccess('');
      await api.verifyPayment(paymentId, approved, reason);
      setSuccess(approved ? '✅ Pagamento aprovado! Usuário promovido a MEMBER.' : '❌ Pagamento rejeitado.');
      setShowPaymentModal(false);
      
      // Reload users
      await loadAllUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar pagamento');
    }
  };

  const handleViewUser = async (user: User) => {
    setSelectedUser(user);
    setActiveTab('info');
    setShowViewModal(true);
    setLoadingStats(true);
    
    try {
      const stats = await api.getMemberStatistics(user.id);
      setMemberStats(stats);
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
      setMemberStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setError('');
      setSuccess('');
      
      const formData = new FormData(e.target as HTMLFormElement);
      const updateData = {
        full_name: formData.get('full_name') as string,
        phone: formData.get('phone') as string,
        status: formData.get('status') as string,
      };

      await api.updateUser(selectedUser.id, updateData);
      setSuccess('✅ Usuário atualizado com sucesso!');
      setShowEditModal(false);
      
      // Reload users
      await loadAllUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário');
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
                Gestão de Usuários
              </h1>
              <p className="text-sm text-gray-600">Visitantes e Membros Cadastrados</p>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome, email ou telefone..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8B5CF6] focus:border-[#8B5CF6] text-gray-900 bg-white"
              />
            </div>

            {/* Role Filter */}
            <div>
              <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                id="role-filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as FilterType)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8B5CF6] focus:border-[#8B5CF6] text-gray-900 bg-white"
              >
                <option value="all">Todos</option>
                <option value="VISITOR">Visitantes</option>
                <option value="MEMBER">Membros</option>
                <option value="HUB">Hub</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8B5CF6] focus:border-[#8B5CF6] text-gray-900 bg-white"
              >
                <option value="all">Todos</option>
                <option value="PENDING">Pendente</option>
                <option value="ACTIVE">Ativo</option>
                <option value="SUSPENDED">Suspenso</option>
                <option value="INACTIVE">Inativo</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{allUsers.length}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{allUsers.filter(u => u.role === 'VISITOR').length}</p>
                <p className="text-xs text-gray-500">Visitantes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{allUsers.filter(u => u.role === 'MEMBER').length}</p>
                <p className="text-xs text-gray-500">Membros</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{filteredUsers.length}</p>
                <p className="text-xs text-gray-500">Filtrados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Usuários ({filteredUsers.length})
            </h2>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tente ajustar os filtros de busca.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Indicado Por
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cadastro
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center text-white font-semibold">
                              {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || 'Sem nome'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.referred_by ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {user.referred_by.full_name || 'Sem nome'}
                            </div>
                            <div className="text-gray-500 text-xs">{user.referred_by.email}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          {/* Verificar Pagamento - apenas para VISITOR com status PENDING */}
                          {user.role === 'VISITOR' && user.status === 'PENDING' && (
                            <button
                              onClick={() => handleViewPayment(user)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Verificar Pagamento"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </button>
                          )}
                          
                          {/* Visualizar */}
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-gray-600 hover:text-gray-900 p-1"
                            title="Visualizar"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          
                          {/* Editar */}
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          {/* Inativar/Ativar */}
                          {user.status === 'ACTIVE' ? (
                            <button
                              onClick={() => alert(`Inativar ${user.full_name || user.email}`)}
                              className="text-orange-600 hover:text-orange-900 p-1"
                              title="Inativar"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          ) : user.status === 'INACTIVE' ? (
                            <button
                              onClick={() => alert(`Ativar ${user.full_name || user.email}`)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Ativar"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Verification Modal */}
        {showPaymentModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPaymentModal(false)}></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Verificação de Pagamento
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {selectedUser?.full_name || selectedUser?.email}
                      </p>
                    </div>
                  </div>

                  {loadingPayment ? (
                    <div className="mt-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6] mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">Carregando pagamento...</p>
                    </div>
                  ) : userPayment ? (
                    <div className="mt-4">
                      {/* Payment Info */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Valor</p>
                            <p className="text-sm font-semibold text-gray-900">R$ {userPayment.amount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Tipo</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {userPayment.payment_type === 'ONBOARDING' ? 'Taxa de Inscrição' : 'Mensalidade'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Payment Proof */}
                      {userPayment.payment_proof_url && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Comprovante:</p>
                          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                            {userPayment.payment_proof_url.match(/\.(jpg|jpeg|png)$/i) ? (
                              <div className="space-y-2">
                                <img 
                                  src={userPayment.payment_proof_url} 
                                  alt="Comprovante" 
                                  className="max-w-full h-auto max-h-64 rounded-md border border-gray-300 cursor-pointer hover:opacity-90 transition-opacity mx-auto"
                                  onClick={() => window.open(userPayment.payment_proof_url!, '_blank')}
                                />
                                <a
                                  href={userPayment.payment_proof_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-center text-xs text-[#8B5CF6] hover:text-[#06B6D4] font-medium"
                                >
                                  Abrir em nova aba →
                                </a>
                              </div>
                            ) : (
                              <a
                                href={userPayment.payment_proof_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm text-[#8B5CF6] hover:text-[#06B6D4] font-medium"
                              >
                                📄 Ver Comprovante (PDF)
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="button"
                          onClick={() => handleVerifyPayment(userPayment.id, true)}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm"
                        >
                          ✓ Aprovar Pagamento
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const reason = prompt('Motivo da rejeição:');
                            if (reason) {
                              handleVerifyPayment(userPayment.id, false, reason);
                            }
                          }}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] sm:mt-0 sm:col-start-1 sm:text-sm"
                        >
                          ✗ Rejeitar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-500">Nenhum pagamento pendente encontrado.</p>
                    </div>
                  )}

                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] sm:text-sm"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View User Modal */}
        {showViewModal && selectedUser && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowViewModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  {/* Header */}
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Detalhes do Usuário
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{selectedUser.email}</p>
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        onClick={() => setActiveTab('info')}
                        className={`${
                          activeTab === 'info'
                            ? 'border-[#8B5CF6] text-[#8B5CF6]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        📋 Informações
                      </button>
                      <button
                        onClick={() => setActiveTab('referrals')}
                        className={`${
                          activeTab === 'referrals'
                            ? 'border-[#8B5CF6] text-[#8B5CF6]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        🎁 Indicações ({memberStats?.total_visitors_referred || 0})
                      </button>
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="mt-4">
                    {activeTab === 'info' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.full_name || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Telefone</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.phone || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Tipo</label>
                          <p className="mt-1">{getRoleBadge(selectedUser.role)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <p className="mt-1">{getStatusBadge(selectedUser.status)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Código de Indicação</label>
                          <p className="mt-1 text-sm font-mono text-gray-900">{selectedUser.referral_code}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Indicado Por</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedUser.referred_by ? `${selectedUser.referred_by.full_name || selectedUser.referred_by.email}` : '-'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Data de Cadastro</label>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.created_at)}</p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'referrals' && (
                      <div>
                        {loadingStats ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6] mx-auto"></div>
                            <p className="mt-2 text-sm text-gray-500">Carregando estatísticas...</p>
                          </div>
                        ) : memberStats ? (
                          <div>
                            {/* Stats Summary */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                              <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-sm text-blue-600 font-medium">Total Indicados</p>
                                <p className="text-2xl font-bold text-blue-900">{memberStats.total_visitors_referred}</p>
                              </div>
                              <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-sm text-green-600 font-medium">Membros Ativos</p>
                                <p className="text-2xl font-bold text-green-900">{memberStats.active_members_referred}</p>
                              </div>
                              <div className="bg-yellow-50 rounded-lg p-4">
                                <p className="text-sm text-yellow-600 font-medium">Pendentes</p>
                                <p className="text-2xl font-bold text-yellow-900">{memberStats.pending_visitors_referred}</p>
                              </div>
                            </div>

                            {/* Referrals List */}
                            {memberStats.visitors_referred && memberStats.visitors_referred.length > 0 ? (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Visitantes Indicados:</h4>
                                <div className="space-y-2">
                                  {memberStats.visitors_referred.map((visitor: any) => (
                                    <div key={visitor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{visitor.full_name || 'Sem nome'}</p>
                                        <p className="text-xs text-gray-500">{visitor.email}</p>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        {getRoleBadge(visitor.role)}
                                        {getStatusBadge(visitor.status)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-center text-sm text-gray-500 py-8">Nenhuma indicação ainda</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-center text-sm text-gray-500 py-8">Erro ao carregar estatísticas</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={() => setShowViewModal(false)}
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEditModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleUpdateUser}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    {/* Header */}
                    <div className="border-b border-gray-200 pb-4 mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Editar Usuário
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">{selectedUser.email}</p>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                          Nome Completo
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          id="full_name"
                          defaultValue={selectedUser.full_name || ''}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                          placeholder="Digite o nome completo"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Telefone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          defaultValue={selectedUser.phone || ''}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                          placeholder="(00) 00000-0000"
                        />
                      </div>

                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          name="status"
                          id="status"
                          defaultValue={selectedUser.status}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                        >
                          <option value="PENDING">Pendente</option>
                          <option value="ACTIVE">Ativo</option>
                          <option value="INACTIVE">Inativo</option>
                          <option value="SUSPENDED">Suspenso</option>
                        </select>
                      </div>

                      <div className="bg-blue-50 border border-blue-300 rounded-md p-3">
                        <p className="text-xs text-blue-800">
                          <strong>💡 Nota:</strong> O email e o tipo de usuário não podem ser alterados.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#8B5CF6] text-base font-medium text-white hover:bg-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      💾 Salvar Alterações
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
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
      </main>
    </div>
  );
}
