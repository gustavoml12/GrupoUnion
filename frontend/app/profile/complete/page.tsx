'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ProfileCompletion, ProfileUpdate, Member } from '@/utils/api';
import { getUser, isAuthenticated } from '@/utils/auth';
import Image from 'next/image';

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<ProfileUpdate>({
    bio: '',
    company_description: '',
    website: '',
    business_phone: '',
    business_email: '',
    city: '',
    state: '',
    linkedin_url: '',
    instagram_url: '',
    facebook_url: '',
    twitter_url: '',
    interests: '',
    skills: ''
  });
  
  // Photo upload
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadProfile();
  }, [router]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Get current user and member data
      const userData = await api.getCurrentUser();
      if (userData.role !== 'MEMBER') {
        router.push('/dashboard');
        return;
      }
      
      // For now, we'll use the user data. In production, you'd fetch full member details
      // const memberData = await api.getMemberById(userData.id);
      // For this implementation, we'll work with what we have
      const memberData: any = {}; // Placeholder - will be populated from form
      
      // Load profile completion
      const completion = await api.getProfileCompletion();
      setProfileCompletion(completion);
      
      // Set form data from member
      setFormData({
        bio: memberData.bio || '',
        company_description: memberData.company_description || '',
        website: memberData.website || '',
        business_phone: memberData.business_phone || '',
        business_email: memberData.business_email || '',
        city: memberData.city || '',
        state: memberData.state || '',
        linkedin_url: memberData.linkedin_url || '',
        instagram_url: memberData.instagram_url || '',
        facebook_url: memberData.facebook_url || '',
        twitter_url: memberData.twitter_url || '',
        interests: memberData.interests || '',
        skills: memberData.skills || ''
      });
      
      if (memberData.profile_photo_url) {
        setPhotoPreview(`http://localhost:8000${memberData.profile_photo_url}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande. Tamanho máximo: 5MB');
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WebP');
      return;
    }
    
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleUploadPhoto = async () => {
    if (!photoFile) return;
    
    try {
      setUploadingPhoto(true);
      setError('');
      const result = await api.uploadProfilePhoto(photoFile);
      setSuccess('✅ Foto de perfil atualizada!');
      setPhotoFile(null);
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload da foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      setSaving(true);
      const result = await api.updateProfile(formData);
      setSuccess('✅ Perfil atualizado com sucesso!');
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
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
                👤 Completar Perfil
              </h1>
              <p className="text-sm text-gray-600">Enriqueça seu perfil para melhorar seu networking</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Progress & Suggestions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Progress Card */}
            {profileCompletion && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Progresso do Perfil</h2>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Completude</span>
                    <span className="text-2xl font-bold text-[#8B5CF6]">
                      {profileCompletion.completion_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] h-4 rounded-full transition-all duration-500"
                      style={{ width: `${profileCompletion.completion_percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Suggestions */}
                {profileCompletion.suggestions.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Sugestões de Melhoria</h3>
                    <div className="space-y-3">
                      {profileCompletion.suggestions.map((suggestion, index) => (
                        <div key={index} className="border-l-4 border-[#8B5CF6] pl-3 py-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">{suggestion.label}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(suggestion.priority)}`}>
                              {getPriorityLabel(suggestion.priority)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">{suggestion.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Photo Upload Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Foto de Perfil</h2>
              
              <div className="flex flex-col items-center">
                {/* Photo Preview */}
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    📷 Escolher Foto
                  </span>
                </label>

                {photoFile && (
                  <button
                    onClick={handleUploadPhoto}
                    disabled={uploadingPhoto}
                    className="mt-3 w-full px-4 py-2 bg-[#8B5CF6] text-white rounded-md hover:bg-[#7C3AED] transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    {uploadingPhoto ? 'Enviando...' : '✓ Salvar Foto'}
                  </button>
                )}

                <p className="mt-3 text-xs text-gray-500 text-center">
                  JPG, PNG, GIF ou WebP. Máx 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Informações do Perfil</h2>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Biografia
                </label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                  placeholder="Conte um pouco sobre você e sua trajetória profissional..."
                />
              </div>

              {/* Company Description */}
              <div>
                <label htmlFor="company_description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição da Empresa
                </label>
                <textarea
                  id="company_description"
                  value={formData.company_description}
                  onChange={(e) => setFormData({...formData, company_description: e.target.value})}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                  placeholder="Descreva sua empresa e o que ela faz..."
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="business_phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone Comercial
                  </label>
                  <input
                    type="tel"
                    id="business_phone"
                    value={formData.business_phone}
                    onChange={(e) => setFormData({...formData, business_phone: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label htmlFor="business_email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Comercial
                  </label>
                  <input
                    type="email"
                    id="business_email"
                    value={formData.business_email}
                    onChange={(e) => setFormData({...formData, business_email: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                    placeholder="contato@empresa.com"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                  placeholder="https://www.suaempresa.com"
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                    placeholder="São Paulo"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-gray-900">Redes Sociais</h3>
                
                <div>
                  <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    id="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                    placeholder="https://linkedin.com/in/seuperfil"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="instagram_url" className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram
                    </label>
                    <input
                      type="url"
                      id="instagram_url"
                      value={formData.instagram_url}
                      onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                      placeholder="@seuperfil"
                    />
                  </div>

                  <div>
                    <label htmlFor="facebook_url" className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook
                    </label>
                    <input
                      type="url"
                      id="facebook_url"
                      value={formData.facebook_url}
                      onChange={(e) => setFormData({...formData, facebook_url: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                      placeholder="/seuperfil"
                    />
                  </div>

                  <div>
                    <label htmlFor="twitter_url" className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter/X
                    </label>
                    <input
                      type="url"
                      id="twitter_url"
                      value={formData.twitter_url}
                      onChange={(e) => setFormData({...formData, twitter_url: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                      placeholder="@seuperfil"
                    />
                  </div>
                </div>
              </div>

              {/* Interests & Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
                    Áreas de Interesse
                  </label>
                  <textarea
                    id="interests"
                    value={formData.interests}
                    onChange={(e) => setFormData({...formData, interests: e.target.value})}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                    placeholder="Ex: Tecnologia, Marketing Digital, Inovação..."
                  />
                </div>

                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                    Habilidades
                  </label>
                  <textarea
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] sm:text-sm"
                    placeholder="Ex: Gestão de Projetos, Vendas, Liderança..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white rounded-md hover:from-[#7C3AED] hover:to-[#2563EB] transition-all text-sm font-medium disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : '💾 Salvar Perfil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
