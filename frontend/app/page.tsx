export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-6xl font-bold text-center mb-8 bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
          Ecosistema Union
        </h1>
        
        <p className="text-xl text-center mb-12 text-gray-600">
          Networking empresarial qualificado e geração de negócios
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 border border-gray-200 rounded-lg hover:border-[#8B5CF6] transition-colors">
            <h3 className="text-lg font-semibold mb-2">🎯 Networking Qualificado</h3>
            <p className="text-gray-600">
              Conecte-se com empresários sérios e comprometidos
            </p>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg hover:border-[#3B82F6] transition-colors">
            <h3 className="text-lg font-semibold mb-2">💼 CRM de Indicações</h3>
            <p className="text-gray-600">
              Gerencie indicações com reciprocidade obrigatória
            </p>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg hover:border-[#06B6D4] transition-colors">
            <h3 className="text-lg font-semibold mb-2">📊 Reputação Transparente</h3>
            <p className="text-gray-600">
              Sistema de feedback e métricas de negócios
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <a
            href="/login"
            className="px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Entrar
          </a>
          <a
            href="/register"
            className="px-6 py-3 border-2 border-[#8B5CF6] text-[#8B5CF6] rounded-lg font-semibold hover:bg-[#8B5CF6] hover:text-white transition-colors"
          >
            Cadastrar
          </a>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Status da API: <span id="api-status" className="font-semibold">Verificando...</span></p>
        </div>
      </div>
    </main>
  )
}
