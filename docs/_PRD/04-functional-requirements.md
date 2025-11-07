# Functional Requirements

## FR-1: Autenticação e Autorização

### FR-1.1 - Sistema de Login
- Login com email e senha
- Recuperação de senha via email
- 2FA opcional para segurança adicional

### FR-1.2 - Perfis de Usuário
- **Empresário:** Acesso a funcionalidades de membro
- **Hub:** Gestão de membros, aprovações, relatórios
- **Administrador:** Acesso total ao sistema

### FR-1.3 - Controle de Acesso por Status
- **Pendente:** Acesso limitado (apenas onboarding)
- **Ativo:** Acesso completo
- **Suspenso:** Não pode criar indicações
- **Removido:** Sem acesso

---

## FR-2: Portal de Vendas (Público)

### FR-2.1 - Listagem Pública
- Página acessível sem login
- Lista todos empresários ativos
- Badge "Membro Ecosistema Union"
- Filtros por categoria/ramo
- Busca por nome ou palavra-chave

### FR-2.2 - Perfil Público Individual
- Foto, nome, empresa, ramo, contato
- Descrição do negócio
- Indicadores de crescimento (opcional)
- SEO otimizado

---

## FR-3: Onboarding e Gestão de Membros

### FR-3.1 - Cadastro e Onboarding
- Formulário de cadastro inicial
- Trilha digital (1 hora): vídeos + manual + questionário
- Confirmação de presença em reunião presencial
- Aprovação pelo Hub
- Fluxo: Pendente → Em Onboarding → Aprovado → Ativo

### FR-3.2 - Perfil do Empresário
- Dados pessoais e profissionais editáveis
- Upload de foto
- Histórico automático (indicações, reuniões, pontos, badges)
- Notas internas do Hub (não visível para empresário)

### FR-3.3 - Gestão pelo Hub
- Dashboard de membros (lista, filtros, busca)
- Aprovar/Reprovar candidatos
- Suspender/Remover membros (com justificativa)
- Adicionar notas e observações
- Relatórios de membros

---

## FR-4: Gestão de Eventos/Reuniões

### FR-4.1 - Criação e Gestão
- Criar evento (data, hora, local, tema, pauta)
- Eventos recorrentes (semanais)
- Envio automático de convites
- Upload de materiais (slides, documentos)

### FR-4.2 - Presença
- Confirmação de presença (Sim/Não/Talvez)
- Check-in via QR code ou manual
- Registro de horário de chegada
- Histórico de presença por empresário
- Alertas para ausências frequentes

### FR-4.3 - Calendário
- Visualização mensal/semanal
- Próximos eventos destacados
- Histórico de eventos passados

---

## FR-5: Gestão de Indicações (CRM)

### FR-5.1 - Criar Indicação
- Formulário: De (auto), Para (dropdown), Cliente (dados completos)
- Qualificação: Quente/Morno/Frio
- Observações adicionais
- Notificação automática para quem recebe

### FR-5.2 - Pipeline Visual (Kanban)
- Colunas: Pendente Contato → Contato Realizado → Em Negociação → Fechado (Ganho/Perdido) → Cancelado
- Drag-and-drop para mover
- Histórico de mudanças
- Notas internas (visível para ambos)

### FR-5.3 - Feedback Obrigatório (7 dias)
- Sistema agenda automaticamente
- Notificação para quem indicou
- Formulário: Atendimento (Sim/Não), Qualidade (1-5), Negócio fechado, Valor
- Feedback impacta reputação
- Feedback negativo (<3 estrelas) gera alerta para Hub

### FR-5.4 - Dashboard de Indicações
- Abas: Dadas / Recebidas / Aguardando Feedback
- Estatísticas: Total, taxa conversão, valor gerado, avaliação média
- Filtros: Status, Data, Empresário, Qualificação

### FR-5.5 - Notificações
- Nova indicação recebida
- Mudança de status
- Lembrete de feedback (7 dias)
- Feedback recebido
- Indicação fechada

---

## FR-6: Dashboards e Relatórios

### FR-6.1 - Dashboard do Empresário
**Métricas (Cards):**
- Indicações dadas/recebidas (mês/total)
- Taxa de conversão
- Valor total gerado
- Reputação/Pontos
- Ranking no grupo

**Gráficos:**
- Evolução de indicações (6 meses)
- Taxa de sucesso por mês
- Presença em reuniões (3 meses)

**Pendências:**
- Feedbacks aguardando resposta
- Indicações sem atualização (>7 dias)
- Próximas reuniões

**Progresso:**
- Tempo no grupo
- Badges conquistados
- Próximo badge (barra de progresso)

### FR-6.2 - Dashboard do Hub
**Métricas do Ecossistema (Cards):**
- Total membros ativos
- Novos membros este mês
- Taxa de retenção
- Total indicações/negócios no mês
- Valor total circulando
- Média indicações por empresário
- Taxa de conversão geral
- NPS médio

**Gráficos:**
- Crescimento de membros
- Evolução de indicações e negócios
- Distribuição por categoria
- Top 10 membros mais ativos

**Alertas:**
- Feedbacks negativos recentes
- Membros inativos (>30 dias sem indicações)
- Baixa presença em reuniões
- Candidatos aguardando aprovação

**Relatórios:**
- Relatório mensal completo
- Relatório de qualidade (feedbacks)
- Relatório de eventos (presença)

---

## FR-7: Sistema de Reputação (Básico no MVP)

### FR-7.1 - Pontos
- +10 pontos por indicação dada
- +50 pontos por negócio fechado
- +20 pontos por feedback positivo recebido
- +5 pontos por presença em reunião

### FR-7.2 - Badges Automáticos
- "Novo Membro" (ao entrar)
- "Primeira Indicação" (primeira indicação dada)
- "Primeiro Negócio" (primeiro negócio fechado)
- "Conector Bronze" (10 indicações)
- "Conector Prata" (50 indicações)
- "Conector Ouro" (100 indicações)
- "100% Presente" (3 meses sem faltas)

### FR-7.3 - Ranking (Opcional)
- Ranking geral por pontos
- Visível no dashboard
- Atualização em tempo real

---

## FR-8: Notificações e Comunicação

### FR-8.1 - Tipos de Notificação
- In-app (sino no header)
- Email automático
- Central de notificações (histórico)

### FR-8.2 - Eventos que Geram Notificação
- Nova indicação recebida
- Mudança de status em indicação
- Lembrete de feedback (7 dias)
- Feedback recebido
- Novo evento criado
- Lembrete de evento (24h e 2h antes)
- Aprovação/reprovação de cadastro
- Suspensão/remoção (com motivo)
- Conquista de novo badge

### FR-8.3 - Preferências
- Empresário pode configurar quais notificações receber
- Opções: Todas, Apenas importantes, Nenhuma (por tipo)

---

## FR-9: Busca e Filtros

### FR-9.1 - Busca Global
- Buscar empresários por nome, empresa, ramo
- Buscar indicações por cliente, empresário
- Buscar eventos por tema, data

### FR-9.2 - Filtros Avançados
- Membros: Status, Categoria, Data entrada, Reputação
- Indicações: Status, Qualificação, Data, Empresário
- Eventos: Data, Tipo, Presença confirmada

---

## FR-10: Exportação e Relatórios

### FR-10.1 - Exportação de Dados
- Exportar lista de membros (Excel/CSV)
- Exportar indicações (Excel/CSV)
- Exportar presença em eventos (Excel/CSV)
- Exportar relatórios (PDF)

### FR-10.2 - Relatórios Automáticos
- Relatório mensal enviado por email para Hub
- Resumo semanal para empresários (opcional)
- Alertas de qualidade (feedbacks negativos)

---

## Regras de Negócio Críticas

### RN-1: Qualificação de Entrada
- Onboarding completo é obrigatório
- Presença em reunião presencial é obrigatória
- Aprovação do Hub é obrigatória
- Sem aprovação = sem acesso à plataforma

### RN-2: Feedback Obrigatório
- Feedback deve ser dado em até 7 dias após indicação
- Sistema envia lembretes automáticos
- Feedback impacta reputação de quem recebeu
- Feedback negativo (<3 estrelas) gera alerta imediato para Hub

### RN-3: Gestão de Qualidade
- Uma reclamação = análise pelo Hub
- Múltiplas reclamações = suspensão ou remoção
- Remoção é permanente e justificada
- Histórico de remoções é mantido

### RN-4: Reciprocidade
- Empresário pode dar indicações ilimitadas
- Empresário recebe indicações baseado em:
  - Reputação (feedbacks positivos)
  - Disponibilidade (não suspenso)
  - Categoria/ramo (match com necessidade)
  - Presença ativa (reuniões, engajamento)

### RN-5: Privacidade
- Dados de clientes indicados são privados
- Apenas quem indicou e quem recebeu veem detalhes
- Hub vê estatísticas agregadas, não dados sensíveis
- Perfil público mostra apenas informações autorizadas

---

_Requisitos funcionais são a base do sistema. Cada funcionalidade deve agregar valor claro aos empresários._
