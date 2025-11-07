'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, MemberCreateData } from '@/utils/api';
import { getUser, isAuthenticated } from '@/utils/auth';

const BUSINESS_CATEGORIES = [
  'TECNOLOGIA',
  'SAUDE',
  'EDUCACAO',
  'FINANCAS',
  'MARKETING',
  'CONSULTORIA',
  'CONSTRUCAO',
  'ALIMENTACAO',
  'VAREJO',
  'SERVICOS',
  'INDUSTRIA',
  'OUTROS',
];

export default function CompleteProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<MemberCreateData>({
    company_name: '',
    business_category: 'TECNOLOGIA',
    company_description: '',
    website: '',
    business_phone: '',
    business_email: '',
    city: '',
    state: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const user = getUser();
    
    // Check if user is a MEMBER
    if (user?.role !== 'MEMBER') {
      router.push('/dashboard');
      return;
    }

    // Check if profile already exists
    checkExistingProfile();
  }, [router]);

  const checkExistingProfile = async () => {
    try {
      await api.getMyMemberProfile();
      // If profile exists, redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      // Profile doesn't exist, user can complete it
      console.log('No profile found, user can create one');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.createMemberProfile(formData);
      setSuccess('✅ Perfil criado com sucesso! Redirecionando...');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar perfil');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
            Complete seu Perfil
          </h1>
          <p className="mt-2 text-gray-600">
            Parabéns! Você foi aprovado como membro. Complete seu perfil para começar a usar a plataforma.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Messages */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-4">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}

            {/* Company Name */}
            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                Nome da Empresa *
              </label>
              <input
                id="company_name"
                name="company_name"
                type="text"
                required
                value={formData.company_name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8B5CF6] focus:border-[#8B5CF6]"
                placeholder="Ex: Minha Empresa Ltda"
              />
            </div>

            {/* Business Category */}
            <div>
              <label htmlFor="business_category" className="block text-sm font-medium text-gray-700">
                Categoria de Negócio *
              </label>
              <select
                id="business_category"
                name="business_category"
                required
                value={formData.business_category}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8B5CF6] focus:border-[#8B5CF6]"
              >
                {BUSINESS_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Company Description */}
            <div>
              <label htmlFor="company_description" className="block text-sm font-medium text-gray-700">
                Descrição da Empresa
              </label>
              <textarea
                id="company_description"
                name="company_description"
                rows={4}
                value={formData.company_description}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8B5CF6] focus:border-[#8B5CF6]"
                placeholder="Conte um pouco sobre sua empresa..."
              />
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8B5CF6] focus:border-[#8B5CF6]"
                placeholder="https://www.minhaempresa.com.br"
              />
            </div>

            {/* Business Phone */}
            <div>
              <label htmlFor="business_phone" className="block text-sm font-medium text-gray-700">
                Telefone Comercial
              </label>
              <input
                id="business_phone"
                name="business_phone"
                type="tel"
                value={formData.business_phone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8B5CF6] focus:border-[#8B5CF6]"
                placeholder="(11) 3333-3333"
              />
            </div>

            {/* Business Email */}
            <div>
              <label htmlFor="business_email" className="block text-sm font-medium text-gray-700">
                Email Comercial
              </label>
              <input
                id="business_email"
                name="business_email"
                type="email"
                value={formData.business_email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8B5CF6] focus:border-[#8B5CF6]"
                placeholder="contato@minhaempresa.com.br"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  Cidade
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8B5CF6] focus:border-[#8B5CF6]"
                  placeholder="São Paulo"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#8B5CF6] focus:border-[#8B5CF6]"
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6]"
              >
                Pular por enquanto
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Completar Perfil'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
