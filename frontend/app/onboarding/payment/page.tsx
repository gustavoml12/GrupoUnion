'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, PIXInfo, Payment } from '@/utils/api';
import { getUser, isAuthenticated } from '@/utils/auth';

export default function PaymentPage() {
  const router = useRouter();
  const [pixInfo, setPixInfo] = useState<PIXInfo | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const user = getUser();
    
    // Check if user is a VISITOR
    if (user?.role !== 'VISITOR') {
      router.push('/dashboard');
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pixData, paymentData] = await Promise.all([
        api.getPIXInfo(),
        api.getMyPayment().catch(() => null),
      ]);
      
      setPixInfo(pixData);
      setPayment(paymentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPIX = () => {
    if (pixInfo) {
      navigator.clipboard.writeText(pixInfo.pix_key);
      setSuccess('✅ Chave PIX copiada!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Tipo de arquivo inválido. Use JPG, PNG ou PDF.');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Arquivo muito grande. Tamanho máximo: 5MB.');
        return;
      }

      setSelectedFile(file);
      setError('');

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl('');
      }
    }
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Por favor, selecione um arquivo');
      return;
    }

    setError('');
    setSuccess('');
    setUploading(true);

    try {
      // Upload file first
      const uploadResult = await api.uploadPaymentFile(selectedFile);
      
      // Then register the proof with the payment
      const fullUrl = `http://localhost:8000${uploadResult.url}`;
      await api.uploadPaymentProof(fullUrl);
      
      setSuccess('✅ Comprovante enviado com sucesso! Aguarde a verificação do Hub.');
      
      // Reload payment data
      const updatedPayment = await api.getMyPayment();
      setPayment(updatedPayment);
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar comprovante');
    } finally {
      setUploading(false);
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

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', text: '⏳ Aguardando Pagamento' },
      PROOF_UPLOADED: { color: 'bg-blue-100 text-blue-800', text: '📤 Comprovante Enviado' },
      VERIFIED: { color: 'bg-green-100 text-green-800', text: '✅ Verificado' },
      REJECTED: { color: 'bg-red-100 text-red-800', text: '❌ Rejeitado' },
    };
    
    const badge = badges[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
            Pagamento da Taxa de Inscrição
          </h1>
          <p className="mt-2 text-gray-600">
            Complete o pagamento para finalizar sua candidatura
          </p>
        </div>

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

        {/* Payment Status */}
        {payment && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Status do Pagamento</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Valor: <span className="font-semibold">R$ {payment.amount.toFixed(2)}</span>
                </p>
              </div>
              {getStatusBadge(payment.status)}
            </div>

            {payment.rejection_reason && (
              <div className="mt-4 p-3 bg-red-50 rounded-md">
                <p className="text-sm text-red-800">
                  <strong>Motivo da rejeição:</strong> {payment.rejection_reason}
                </p>
              </div>
            )}
          </div>
        )}

        {/* PIX Instructions */}
        {pixInfo && payment?.status === 'PENDING' && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              💰 Instruções de Pagamento PIX
            </h2>

            {/* PIX Key */}
            <div className="bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] rounded-lg p-6 text-white mb-6">
              <p className="text-sm opacity-90 mb-2">Chave PIX:</p>
              <div className="flex items-center justify-between">
                <p className="text-xl font-mono font-bold">{pixInfo.pix_key}</p>
                <button
                  onClick={handleCopyPIX}
                  className="ml-4 px-4 py-2 bg-white text-[#8B5CF6] rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  📋 Copiar
                </button>
              </div>
              <p className="text-2xl font-bold mt-4">R$ {pixInfo.amount.toFixed(2)}</p>
              <p className="text-sm opacity-90">{pixInfo.description}</p>
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Como pagar:</h3>
              {pixInfo.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-xs font-bold mr-3">
                    {index + 1}
                  </span>
                  <p className="text-gray-700">{instruction}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Proof Form */}
        {payment?.status === 'PENDING' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              📤 Enviar Comprovante
            </h2>
            
            <form onSubmit={handleUploadProof} className="space-y-4">
              <div>
                <label htmlFor="proof_file" className="block text-sm font-medium text-gray-700">
                  Comprovante de Pagamento *
                </label>
                <p className="text-xs text-gray-500 mt-1 mb-2">
                  Faça upload da imagem ou PDF do comprovante (JPG, PNG ou PDF - máx. 5MB)
                </p>
                <input
                  id="proof_file"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  required
                  onChange={handleFileChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8B5CF6] focus:border-[#8B5CF6] text-gray-900 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#8B5CF6] file:text-white hover:file:bg-[#7C3AED]"
                />
                
                {/* Preview */}
                {selectedFile && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Arquivo selecionado:</strong> {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Tamanho: {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                    {previewUrl && (
                      <div className="mt-3">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="max-w-full h-auto max-h-64 rounded-md border border-gray-300"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Enviando...' : 'Enviar Comprovante'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Waiting for Verification */}
        {payment?.status === 'PROOF_UPLOADED' && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Aguardando Verificação
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Seu comprovante foi enviado com sucesso! A equipe do Hub irá verificar e aprovar seu pagamento em breve.
                  </p>
                  <p className="mt-2">
                    Você receberá uma notificação assim que seu pagamento for verificado.
                  </p>
                </div>
                {payment.payment_proof_url && (
                  <div className="mt-4">
                    <a
                      href={payment.payment_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Ver comprovante enviado →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Verified */}
        {payment?.status === 'VERIFIED' && (
          <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Pagamento Verificado! ✅
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Seu pagamento foi verificado com sucesso! Agora você está aguardando a aprovação final do Hub para se tornar um membro.
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Voltar ao Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
