'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, clearAuth, isAuthenticated } from '@/utils/auth';
import { User, api } from '@/utils/api';
import NotificationBell from '@/components/NotificationBell';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Recarregar dados do usuário do backend para garantir que está atualizado
    refreshUserData();
  }, [router]);

  const refreshUserData = async () => {
    try {
      const freshUserData = await api.getCurrentUser();
      // Atualizar localStorage com dados frescos
      localStorage.setItem('user', JSON.stringify(freshUserData));
      setUser(freshUserData);

      // Check if MEMBER has completed profile
      if (freshUserData?.role === 'MEMBER') {
        checkMemberProfile();
      }

      // Check payment status for VISITOR
      if (freshUserData?.role === 'VISITOR') {
        checkPaymentStatus();
      }
    } catch (err) {
      // Se falhar, usar dados do localStorage
      const userData = getUser();
      setUser(userData);

      if (userData?.role === 'MEMBER') {
        checkMemberProfile();
      }

      if (userData?.role === 'VISITOR') {
        checkPaymentStatus();
      }
    }
  };

  const checkMemberProfile = async () => {
    try {
      await api.getMyMemberProfile();
      setHasProfile(true);
    } catch (err) {
      setHasProfile(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      setLoadingPayment(true);
      const paymentData = await api.getMyPayment();
      setPayment(paymentData);
    } catch (err) {
      // No payment found
      setPayment(null);
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!user) {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
            Ecosistema Union
          </h1>
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#8B5CF6] transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Member Profile Incomplete Warning */}
        {user.role === 'MEMBER' && hasProfile === false && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  Complete seu Perfil de Membro
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Para aproveitar todos os recursos da plataforma, complete seu perfil com as informações da sua empresa.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/onboarding/complete-profile')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Completar Perfil Agora
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visitor Warning */}
        {user.role === 'VISITOR' && !payment && !loadingPayment && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Torne-se um Membro
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Você está cadastrado como <strong>Visitante</strong>. Para ter acesso completo às funcionalidades do Ecosistema Union, candidate-se para se tornar um <strong>Membro</strong>.
                  </p>
                  <p className="mt-2">
                    <strong>Processo:</strong> Preencher candidatura → Pagar taxa de R$ 197/mês → Aprovação do Hub
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/onboarding/apply')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Candidatar-se Agora
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Status Card for Visitor */}
        {user.role === 'VISITOR' && payment && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Status da Candidatura</h3>
                <p className="text-sm text-gray-600 mt-1">Acompanhe o progresso da sua candidatura</p>
              </div>
              {payment.status === 'PENDING' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  ⏳ Aguardando Pagamento
                </span>
              )}
              {payment.status === 'PROOF_UPLOADED' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  📤 Em Análise
                </span>
              )}
              {payment.status === 'VERIFIED' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ Pagamento Verificado
                </span>
              )}
              {payment.status === 'REJECTED' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  ❌ Rejeitado
                </span>
              )}
            </div>

            {/* Progress Steps */}
            <div className="space-y-4">
              {/* Step 1: Application */}
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                    ✓
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Candidatura Enviada</p>
                  <p className="text-xs text-gray-500">Formulário preenchido com sucesso</p>
                </div>
              </div>

              {/* Step 2: Payment */}
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {payment.status === 'PENDING' ? (
                    <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center text-white animate-pulse">
                      2
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                      ✓
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">Pagamento</p>
                  {payment.status === 'PENDING' && (
                    <>
                      <p className="text-xs text-gray-500">Aguardando comprovante de pagamento</p>
                      <button
                        onClick={() => router.push('/onboarding/payment')}
                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-90"
                      >
                        Enviar Comprovante
                      </button>
                    </>
                  )}
                  {payment.status === 'PROOF_UPLOADED' && (
                    <p className="text-xs text-gray-500">Comprovante enviado - Aguardando verificação do Hub</p>
                  )}
                  {payment.status === 'VERIFIED' && (
                    <p className="text-xs text-gray-500">Pagamento verificado com sucesso</p>
                  )}
                  {payment.status === 'REJECTED' && (
                    <>
                      <p className="text-xs text-red-600">Comprovante rejeitado</p>
                      {payment.rejection_reason && (
                        <p className="text-xs text-gray-500 mt-1">Motivo: {payment.rejection_reason}</p>
                      )}
                      <button
                        onClick={() => router.push('/onboarding/payment')}
                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        Enviar Novo Comprovante
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Step 3: Completion */}
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {payment.status === 'VERIFIED' ? (
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                      ✓
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                      3
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Aprovado como Membro</p>
                  {payment.status === 'VERIFIED' ? (
                    <p className="text-xs text-green-600 font-medium">Parabéns! Você foi aprovado como membro. Faça login novamente para acessar.</p>
                  ) : (
                    <p className="text-xs text-gray-500">Pendente</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Valor</p>
                  <p className="text-sm font-semibold text-gray-900">R$ {payment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tipo</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {payment.payment_type === 'ONBOARDING' ? 'Taxa de Inscrição' : 'Mensalidade'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Bem-vindo, {user.full_name || user.email}! 👋
          </h2>
          <p className="text-gray-600">
            {user.role === 'VISITOR' 
              ? 'Você está cadastrado como Visitante. Aguarde aprovação para se tornar um Membro.'
              : 'Você está autenticado com sucesso no Ecosistema Union!'
            }
          </p>

          {/* Hub/Admin Quick Actions */}
          {(user.role === 'HUB' || user.role === 'ADMIN') && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Ações do Hub</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => router.push('/hub/members')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-90 transition-opacity"
                >
                  👥 Gerenciar Usuários
                </button>
                <button
                  onClick={() => router.push('/hub/videos')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] hover:opacity-90 transition-opacity"
                >
                  🎥 Gerenciar Vídeos
                </button>
                <button
                  onClick={() => router.push('/hub/meetings')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#10B981] to-[#06B6D4] hover:opacity-90 transition-opacity"
                >
                  📅 Gerenciar Reuniões
                </button>
                <button
                  onClick={() => router.push('/hub/collective-meetings')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:opacity-90 transition-opacity"
                >
                  👥 Reuniões Coletivas
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Onboarding Videos Card - For MEMBER and VISITOR */}
        {(user.role === 'MEMBER' || user.role === 'VISITOR') && (
          <div className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] rounded-lg shadow p-6 mb-6 text-white">
            <h3 className="text-lg font-semibold mb-4">🎥 Trilha de Onboarding</h3>
            <p className="text-sm mb-4 text-white/90">
              Assista aos vídeos de boas-vindas e conheça melhor o Grupo Union!
            </p>
            <button
              onClick={() => router.push('/onboarding/videos')}
              className="px-4 py-2 bg-white text-[#3B82F6] rounded-md hover:bg-white/90 transition-colors text-sm font-medium"
            >
              ▶️ Assistir Vídeos
            </button>
          </div>
        )}

        {/* Complete Profile Card - Only for MEMBER */}
        {user.role === 'MEMBER' && (
          <div className="bg-gradient-to-r from-[#F59E0B] to-[#EF4444] rounded-lg shadow p-6 mb-6 text-white">
            <h3 className="text-lg font-semibold mb-4">👤 Complete seu Perfil</h3>
            <p className="text-sm mb-4 text-white/90">
              Enriqueça seu perfil com foto, biografia e redes sociais para melhorar seu networking!
            </p>
            <button
              onClick={() => router.push('/profile/complete')}
              className="px-4 py-2 bg-white text-[#F59E0B] rounded-md hover:bg-white/90 transition-colors text-sm font-medium"
            >
              ✏️ Completar Perfil
            </button>
          </div>
        )}

        {/* Visits Card - Only for MEMBER */}
        {user.role === 'MEMBER' && (
          <div className="bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-lg shadow p-6 mb-6 text-white">
            <h3 className="text-lg font-semibold mb-4">🤝 Registre suas Visitas</h3>
            <p className="text-sm mb-4 text-white/90">
              Registre visitas a outros membros para conhecer seus serviços e identificar oportunidades de indicação!
            </p>
            <button
              onClick={() => router.push('/visits')}
              className="px-4 py-2 bg-white text-[#EC4899] rounded-md hover:bg-white/90 transition-colors text-sm font-medium"
            >
              🤝 Minhas Visitas
            </button>
          </div>
        )}

        {/* Meeting Card - Only for MEMBER */}
        {user.role === 'MEMBER' && (
          <div className="bg-gradient-to-r from-[#10B981] to-[#06B6D4] rounded-lg shadow p-6 mb-6 text-white">
            <h3 className="text-lg font-semibold mb-4">📅 Agende sua Reunião</h3>
            <p className="text-sm mb-4 text-white/90">
              Agende uma reunião com nossa equipe para conhecer melhor o Grupo Union!
            </p>
            <button
              onClick={() => router.push('/meetings/schedule')}
              className="px-4 py-2 bg-white text-[#10B981] rounded-md hover:bg-white/90 transition-colors text-sm font-medium"
            >
              📅 Agendar Reunião
            </button>
          </div>
        )}

        {/* Referral Card - Only for MEMBER */}
        {user.role === 'MEMBER' && (
          <div className="bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] rounded-lg shadow p-6 mb-6 text-white">
            <h3 className="text-lg font-semibold mb-4">🎁 Convide Novos Membros</h3>
            <p className="text-sm mb-4 text-white/90">
              Compartilhe seu código de indicação e ajude a crescer nossa rede!
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/80 mb-1">Seu Código de Indicação:</p>
                  <p className="text-2xl font-bold font-mono tracking-wider">{user.referral_code}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(user.referral_code);
                    alert('✅ Código copiado!');
                  }}
                  className="px-4 py-2 bg-white text-[#8B5CF6] rounded-md hover:bg-white/90 transition-colors text-sm font-medium"
                >
                  📋 Copiar
                </button>
              </div>
            </div>
            <div className="mt-4 text-sm text-white/80">
              💡 <strong>Como funciona:</strong> Novos visitantes podem usar seu código ao se cadastrar. Quando aprovados, você será creditado pela indicação!
            </div>
          </div>
        )}

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Suas Informações</h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Nome</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.full_name || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Telefone</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.phone || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Função</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.role === 'VISITOR' ? 'bg-yellow-100 text-yellow-800' :
                  user.role === 'MEMBER' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'HUB' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.role === 'VISITOR' ? '👤 Visitante' :
                   user.role === 'MEMBER' ? '⭐ Membro' :
                   user.role === 'HUB' ? '🎯 Hub' :
                   user.role}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email Verificado</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.email_verified ? '✅ Sim' : '❌ Não'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Coming Soon */}
        <div className="mt-6 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] rounded-lg shadow p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">🚀 Em Breve</h3>
          <p className="text-sm opacity-90">
            Estamos trabalhando nas funcionalidades de CRM de Indicações, Gestão de Eventos e muito mais!
          </p>
        </div>
      </main>
    </div>
  );
}
