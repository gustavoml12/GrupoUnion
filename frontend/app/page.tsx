'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Simula um carregamento
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    // Animação dos pontos
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0] p-4">
        <div className="text-center">
          <div className="relative w-48 h-48 mx-auto mb-8">
            <Image
              src="/logo-union.png"
              alt="Logo Union"
              fill
              className="object-contain animate-pulse"
              priority
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Preparando algo incrível para você{dots}
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] mx-auto my-6 rounded-full"></div>
          <p className="text-gray-600 text-lg">Estamos quase lá!</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0]">
      <div className="max-w-4xl w-full mx-auto text-center">
        <div className="relative w-40 h-40 mx-auto mb-8">
          <Image
            src="/logo-union.png"
            alt="Logo Union"
            fill
            className="object-contain"
            priority
          />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
          Bem-vindo ao Ecosistema Union
        </h1>
        
        <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto">
          Uma plataforma exclusiva para networking de alta performance e geração de negócios qualificados.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <a
            href="/login"
            className="px-8 py-4 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
          >
            Entrar na Plataforma
          </a>
          <a
            href="/register"
            className="px-8 py-4 border-2 border-[#8B5CF6] text-[#8B5CF6] rounded-xl font-semibold text-lg hover:bg-[#8B5CF6] hover:text-white transition-all transform hover:scale-105"
          >
            Criar Conta
          </a>
        </div>

        <div className="mt-12 p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">O que você vai encontrar:</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2 text-[#8B5CF6]">🎯 Networking Qualificado</h3>
              <p className="text-gray-600">Conecte-se com empresários comprometidos e alinhados com seus valores.</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2 text-[#3B82F6]">💼 CRM de Indicações</h3>
              <p className="text-gray-600">Gerencie suas indicações e acompanhe resultados de forma simples.</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2 text-[#06B6D4]">📊 Reputação Transparente</h3>
              <p className="text-gray-600">Sistema de feedback e métricas para relacionamentos mais seguros.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
