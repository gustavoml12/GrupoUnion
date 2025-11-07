'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import logoUnion from '../public/logo-union.png';

export default function Home() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Adiciona classe para travar o scroll da página
    document.body.style.overflow = 'hidden';
    
    // Animação dos pontos
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => {
      // Remove a classe quando o componente é desmontado
      document.body.style.overflow = 'unset';
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Overlay escuro com leve brilho roxo */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black"></div>
      
      {/* Conteúdo principal centralizado */}
      <div className="relative z-10 text-center">
        {/* Logo com animação de pulso lento */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-pulse-slow"></div>
          <Image
            src={logoUnion}
            alt="Logo Union"
            fill
            className="object-contain animate-pulse-slow"
            style={{ animationDuration: '3s' }}
            priority
          />
        </div>
        
        {/* Texto principal */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Estamos preparando algo especial para você{dots}
        </h1>
        <p className="text-purple-200 text-lg mb-8">Em breve, uma nova experiência de networking</p>
        
        {/* Barra de progresso sutil */}
        <div className="w-64 h-1 bg-purple-900/50 rounded-full overflow-hidden mx-auto mb-12">
          <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse" style={{ width: '100%' }}></div>
        </div>
      </div>
      
      {/* Botões no rodapé */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-6 z-10">
        <a
          href="/register"
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold text-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/30"
        >
          Conheça
        </a>
        <a
          href="/login"
          className="px-8 py-3 border-2 border-white/30 text-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all transform hover:scale-105"
        >
          Acesse
        </a>
      </div>
      
      {/* Efeitos visuais */}
      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.7; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1.02); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
