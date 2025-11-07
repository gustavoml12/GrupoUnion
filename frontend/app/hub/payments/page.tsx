'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Payment, User } from '@/utils/api';
import { getUser, isAuthenticated } from '@/utils/auth';

export default function HubPaymentsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

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

    // Load pending payments
    loadPendingPayments();
  }, [router]);

  const loadPendingPayments = async () => {
    try {
      setLoading(true);
      const paymentsData = await api.getPendingPayments();
      setPayments(paymentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId: string) => {
    if (!confirm('Tem certeza que deseja aprovar este pagamento?')) {
      return;
    }

    try {
      setProcessingId(paymentId);
      setError('');
      setSuccess('');
      
      await api.verifyPayment(paymentId, true);
      setSuccess('✅ Pagamento aprovado com sucesso!');
      
      // Reload list
      await loadPendingPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aprovar pagamento');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedPayment || !rejectionReason.trim()) {
      setError('Por favor, informe o motivo da rejeição');
      return;
    }

    try {
      setProcessingId(selectedPayment.id);
      setError('');
      setSuccess('');
      
      await api.verifyPayment(selectedPayment.id, false, rejectionReason);
      setSuccess('❌ Pagamento rejeitado.');
      
      // Close modal and reload list
      setShowRejectModal(false);
      setSelectedPayment(null);
      setRejectionReason('');
      await loadPendingPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao rejeitar pagamento');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
              Verificação de Pagamentos
            </h1>
            <p className="text-sm text-gray-600">Aprovar ou rejeitar comprovantes</p>
          </div>
          <button
            onClick={() => router.push('/hub/members')}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#8B5CF6] transition-colors"
          >
            ← Voltar
          </button>
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

        {/* Pending Payments */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Comprovantes Pendentes ({payments.length})
            </h2>
            <p className="text-sm text-gray-600">
              Verifique os comprovantes de pagamento enviados pelos candidatos
            </p>
          </div>

          {payments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum pagamento pendente</h3>
              <p className="mt-1 text-sm text-gray-500">
                Todos os comprovantes foram processados.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <div key={payment.id} className="px-6 py-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Payment Info */}
                      <div className="flex items-center mb-3">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center text-white font-semibold text-lg">
                            💰
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-base font-semibold text-gray-900">
                            R$ {payment.amount.toFixed(2)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {payment.payment_type === 'ONBOARDING' ? 'Taxa de Inscrição' : 'Mensalidade'}
                          </p>
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Data do Pagamento</p>
                          <p className="text-sm font-medium text-gray-900">
                            {payment.payment_date ? formatDate(payment.payment_date) : 'Não informada'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Enviado em</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(payment.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Proof Preview */}
                      {payment.payment_proof_url && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2">Comprovante:</p>
                          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                            {payment.payment_proof_url.match(/\.(jpg|jpeg|png)$/i) ? (
                              <div className="space-y-2">
                                <img 
                                  src={payment.payment_proof_url} 
                                  alt="Comprovante" 
                                  className="max-w-full h-auto max-h-48 rounded-md border border-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(payment.payment_proof_url!, '_blank')}
                                />
                                <a
                                  href={payment.payment_proof_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-xs text-[#8B5CF6] hover:text-[#06B6D4] font-medium"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  Abrir em nova aba
                                </a>
                              </div>
                            ) : (
                              <a
                                href={payment.payment_proof_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm text-[#8B5CF6] hover:text-[#06B6D4] font-medium"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Ver Comprovante (PDF)
                                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Status Badge */}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        📤 Aguardando Verificação
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleApprove(payment.id)}
                        disabled={processingId === payment.id}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center"
                      >
                        {processingId === payment.id ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processando...
                          </>
                        ) : (
                          <>✓ Aprovar</>
                        )}
                      </button>
                      <button
                        onClick={() => handleRejectClick(payment)}
                        disabled={processingId === payment.id}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center"
                      >
                        ✗ Rejeitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Reject Modal */}
      {showRejectModal && selectedPayment && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowRejectModal(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Rejeitar Pagamento
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Informe o motivo da rejeição. O candidato receberá esta mensagem.
                    </p>
                  </div>
                  <div className="mt-4">
                    <textarea
                      rows={4}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="shadow-sm focus:ring-[#8B5CF6] focus:border-[#8B5CF6] block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Ex: Comprovante ilegível, valor incorreto, etc."
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={handleRejectConfirm}
                  disabled={!rejectionReason.trim() || processingId === selectedPayment.id}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingId === selectedPayment.id ? 'Processando...' : 'Confirmar Rejeição'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] sm:mt-0 sm:col-start-1 sm:text-sm"
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
