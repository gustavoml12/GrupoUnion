# Epic 4: CRM de Indicações

**Prioridade:** 🔴 Critical  
**Pontos:** 55  
**Sprints:** 6-10 (4 sprints)  
**Status:** 📋 Backlog

---

## Objetivo

Implementar sistema completo de gestão de indicações (referrals) com pipeline visual, feedback obrigatório e impacto na reputação.

**Valor de Negócio:** Core do produto - sem isso não há reciprocidade nem geração de negócios.

---

## User Stories

### Story 4.1: Modelo de Dados Referral
**Como** desenvolvedor  
**Quero** criar o modelo de dados Referral  
**Para que** possamos armazenar indicações no banco

**Critérios de Aceitação:**
- [ ] Modelo SQLAlchemy criado com todos os campos
- [ ] Relacionamentos com Member (from/to)
- [ ] Enums para Qualification e ReferralStatus
- [ ] Migration criada e aplicada
- [ ] Testes unitários do modelo

**Tasks:**
- Criar modelo `Referral` em `app/models/referral.py`
- Criar enums `Qualification` e `ReferralStatus`
- Definir relacionamentos com `Member`
- Criar migration com Alembic
- Escrever testes do modelo

**Pontos:** 3  
**Prioridade:** P0 (Blocker)

---

### Story 4.2: API - Criar Indicação
**Como** empresário  
**Quero** criar uma nova indicação  
**Para que** eu possa indicar clientes para outros membros

**Critérios de Aceitação:**
- [ ] Endpoint POST `/api/v1/referrals` criado
- [ ] Validação com Pydantic (ReferralCreate schema)
- [ ] Validação: to_member_id existe e está ativo
- [ ] Validação: não pode indicar para si mesmo
- [ ] Validação: dados do cliente obrigatórios
- [ ] Notificação enviada para membro que recebe
- [ ] Audit log registrado
- [ ] Testes de API (201, 400, 401, 404)

**Tasks:**
- Criar schema `ReferralCreate` em `app/schemas/referral.py`
- Criar endpoint em `app/api/v1/referrals.py`
- Implementar validações
- Criar serviço `create_referral` em `app/services/referral.py`
- Enviar notificação
- Registrar audit log
- Escrever testes de integração

**Pontos:** 5  
**Prioridade:** P0 (Blocker)

---

### Story 4.3: API - Listar Minhas Indicações (Dadas)
**Como** empresário  
**Quero** ver todas as indicações que eu dei  
**Para que** eu possa acompanhar o status delas

**Critérios de Aceitação:**
- [ ] Endpoint GET `/api/v1/referrals/given` criado
- [ ] Filtros: status, qualification, date_range
- [ ] Paginação (50 por página)
- [ ] Ordenação por data (mais recente primeiro)
- [ ] Include: to_member (nome, empresa)
- [ ] Retorna total de registros
- [ ] Testes de API

**Tasks:**
- Criar endpoint `GET /referrals/given`
- Implementar filtros e paginação
- Criar schema `ReferralListResponse`
- Otimizar query (eager loading)
- Escrever testes

**Pontos:** 3  
**Prioridade:** P0

---

### Story 4.4: API - Listar Indicações Recebidas
**Como** empresário  
**Quero** ver todas as indicações que recebi  
**Para que** eu possa entrar em contato com os clientes

**Critérios de Aceitação:**
- [ ] Endpoint GET `/api/v1/referrals/received` criado
- [ ] Mesmos filtros e paginação do 4.3
- [ ] Include: from_member (quem indicou)
- [ ] Destacar indicações sem contato (> 24h)
- [ ] Testes de API

**Tasks:**
- Criar endpoint `GET /referrals/received`
- Implementar lógica de filtros
- Adicionar flag `needs_attention` (> 24h sem contato)
- Escrever testes

**Pontos:** 3  
**Prioridade:** P0

---

### Story 4.5: Frontend - Formulário de Criar Indicação
**Como** empresário  
**Quero** um formulário intuitivo para criar indicações  
**Para que** eu possa indicar clientes rapidamente

**Critérios de Aceitação:**
- [ ] Página `/indicacoes/nova` criada
- [ ] Dropdown de membros (busca por nome/empresa)
- [ ] Campos: cliente (nome, empresa, telefone, email)
- [ ] Campo: contexto (textarea, min 10 chars)
- [ ] Radio buttons: qualificação (Quente/Morno/Frio)
- [ ] Validação client-side (React Hook Form + Zod)
- [ ] Loading state ao enviar
- [ ] Success message + redirect
- [ ] Error handling
- [ ] Responsivo (mobile-first)

**Tasks:**
- Criar página `app/indicacoes/nova/page.tsx`
- Criar componente `CreateReferralForm`
- Implementar validação com Zod
- Integrar com API
- Adicionar loading e error states
- Escrever testes (Playwright)

**Pontos:** 5  
**Prioridade:** P0

---

### Story 4.6: Frontend - Pipeline Kanban Visual
**Como** empresário  
**Quero** ver minhas indicações em um pipeline visual  
**Para que** eu possa acompanhar o progresso facilmente

**Critérios de Aceitação:**
- [ ] Página `/indicacoes` com Kanban board
- [ ] 6 colunas: Pendente | Contato | Negociação | Ganho | Perdido | Cancelado
- [ ] Cards com: nome cliente, empresa, qualificação, tempo
- [ ] Drag & drop para mudar status (opcional MVP)
- [ ] Click no card abre detalhes
- [ ] Filtros: dadas/recebidas, período
- [ ] Loading skeleton
- [ ] Empty states
- [ ] Responsivo (scroll horizontal em mobile)

**Tasks:**
- Criar página `app/indicacoes/page.tsx`
- Criar componente `KanbanBoard`
- Criar componente `ReferralCard`
- Implementar filtros
- Integrar com API
- Adicionar drag & drop (opcional)
- Escrever testes

**Pontos:** 8  
**Prioridade:** P0

---

### Story 4.7: API - Atualizar Status da Indicação
**Como** empresário  
**Quero** atualizar o status de uma indicação  
**Para que** o indicador saiba o andamento

**Critérios de Aceitação:**
- [ ] Endpoint PATCH `/api/v1/referrals/{id}/status` criado
- [ ] Validação: apenas quem recebeu pode atualizar
- [ ] Validação: transições de status válidas
- [ ] Salvar histórico de mudanças (ReferralStatusHistory)
- [ ] Notificar quem indicou sobre mudança
- [ ] Audit log
- [ ] Testes de API

**Tasks:**
- Criar endpoint PATCH
- Criar schema `UpdateReferralStatus`
- Implementar validações de permissão
- Criar modelo `ReferralStatusHistory`
- Salvar histórico
- Enviar notificação
- Escrever testes

**Pontos:** 5  
**Prioridade:** P0

---

### Story 4.8: Frontend - Detalhes da Indicação
**Como** empresário  
**Quero** ver todos os detalhes de uma indicação  
**Para que** eu possa acompanhar o histórico completo

**Critérios de Aceitação:**
- [ ] Página `/indicacoes/[id]` criada
- [ ] Informações completas da indicação
- [ ] Dados do cliente
- [ ] Contexto/necessidade
- [ ] Histórico de mudanças de status
- [ ] Notas internas (timeline)
- [ ] Botão para atualizar status
- [ ] Botão para adicionar nota
- [ ] Feedback (se houver)
- [ ] Responsivo

**Tasks:**
- Criar página `app/indicacoes/[id]/page.tsx`
- Criar componente `ReferralDetails`
- Criar componente `StatusHistory`
- Criar componente `NotesTimeline`
- Integrar com API
- Escrever testes

**Pontos:** 5  
**Prioridade:** P1

---

### Story 4.9: API - Adicionar Nota Interna
**Como** empresário  
**Quero** adicionar notas internas em uma indicação  
**Para que** eu possa registrar conversas e atualizações

**Critérios de Aceitação:**
- [ ] Endpoint POST `/api/v1/referrals/{id}/notes` criado
- [ ] Modelo `ReferralNote` criado
- [ ] Validação: apenas envolvidos podem adicionar notas
- [ ] Notas ordenadas por data (mais recente primeiro)
- [ ] Notificar outro membro sobre nova nota
- [ ] Testes de API

**Tasks:**
- Criar modelo `ReferralNote`
- Criar endpoint POST
- Criar schema `CreateNote`
- Implementar validações
- Enviar notificação
- Escrever testes

**Pontos:** 3  
**Prioridade:** P1

---

### Story 4.10: Modelo de Dados Feedback
**Como** desenvolvedor  
**Quero** criar o modelo de dados Feedback  
**Para que** possamos armazenar feedbacks de indicações

**Critérios de Aceitação:**
- [ ] Modelo SQLAlchemy criado
- [ ] Relacionamento 1:1 com Referral
- [ ] Campos: was_well_served, quality_rating, comments, deal_closed, deal_value
- [ ] Migration criada
- [ ] Testes unitários

**Tasks:**
- Criar modelo `Feedback`
- Definir relacionamento com `Referral`
- Criar migration
- Escrever testes

**Pontos:** 2  
**Prioridade:** P0

---

### Story 4.11: API - Sistema de Feedback (7 dias)
**Como** empresário que indicou  
**Quero** dar feedback sobre a indicação após 7 dias  
**Para que** a qualidade do atendimento seja monitorada

**Critérios de Aceitação:**
- [ ] Endpoint POST `/api/v1/referrals/{id}/feedback` criado
- [ ] Validação: apenas quem indicou pode dar feedback
- [ ] Validação: indicação deve estar fechada (ganho/perdido)
- [ ] Validação: feedback único por indicação
- [ ] Campos obrigatórios: was_well_served, quality_rating
- [ ] Impacto na reputação do membro (atualizar score)
- [ ] Se rating < 3, criar alerta para Hub
- [ ] Notificar membro avaliado
- [ ] Testes de API

**Tasks:**
- Criar endpoint POST feedback
- Criar schema `CreateFeedback`
- Implementar validações
- Criar serviço `calculate_reputation`
- Atualizar `Member.reputation_score`
- Criar alerta se negativo
- Enviar notificação
- Escrever testes

**Pontos:** 5  
**Prioridade:** P0

---

### Story 4.12: Frontend - Formulário de Feedback
**Como** empresário  
**Quero** dar feedback sobre indicações  
**Para que** eu possa avaliar a qualidade do atendimento

**Critérios de Aceitação:**
- [ ] Modal/página de feedback
- [ ] Pergunta: "O cliente foi bem atendido?" (Sim/Não)
- [ ] Rating de 1-5 estrelas (qualidade)
- [ ] Campo de comentários (opcional)
- [ ] Pergunta: "Negócio foi fechado?" (Sim/Não/Em andamento)
- [ ] Se sim, campo valor (opcional)
- [ ] Validação client-side
- [ ] Success message
- [ ] Responsivo

**Tasks:**
- Criar componente `FeedbackModal`
- Implementar validação
- Integrar com API
- Adicionar ao fluxo de indicações
- Escrever testes

**Pontos:** 3  
**Prioridade:** P0

---

### Story 4.13: Alertas de Feedback Negativo (Hub)
**Como** Hub  
**Quero** ser alertado sobre feedbacks negativos  
**Para que** eu possa intervir rapidamente

**Critérios de Aceitação:**
- [ ] Quando feedback < 3 estrelas, criar alerta
- [ ] Notificação in-app para Hub
- [ ] Email para Hub (opcional)
- [ ] Dashboard Hub mostra alertas pendentes
- [ ] Hub pode ver detalhes do feedback
- [ ] Hub pode adicionar nota de acompanhamento

**Tasks:**
- Criar modelo `Alert`
- Criar serviço `create_alert_for_negative_feedback`
- Adicionar alertas ao Dashboard Hub
- Criar página de detalhes do alerta
- Escrever testes

**Pontos:** 3  
**Prioridade:** P1

---

### Story 4.14: Notificações de Indicações
**Como** empresário  
**Quero** receber notificações sobre minhas indicações  
**Para que** eu fique sempre atualizado

**Critérios de Aceitação:**
- [ ] Notificação: nova indicação recebida
- [ ] Notificação: status da indicação mudou
- [ ] Notificação: nova nota adicionada
- [ ] Notificação: feedback recebido
- [ ] Notificação: lembrete de feedback (7 dias)
- [ ] Notificações in-app (badge de contador)
- [ ] Marcar como lida
- [ ] Marcar todas como lidas

**Tasks:**
- Criar serviço `NotificationService`
- Implementar cada tipo de notificação
- Criar componente `NotificationBell`
- Criar dropdown de notificações
- Integrar com API
- Escrever testes

**Pontos:** 5  
**Prioridade:** P1

---

### Story 4.15: Relatório de Indicações
**Como** empresário  
**Quero** ver um relatório das minhas indicações  
**Para que** eu possa analisar meu desempenho

**Critérios de Aceitação:**
- [ ] Página `/indicacoes/relatorio`
- [ ] Métricas: total dadas, total recebidas
- [ ] Taxa de conversão (ganho/total)
- [ ] Valor total gerado (se informado)
- [ ] Gráfico de evolução mensal
- [ ] Filtros por período
- [ ] Exportar CSV (opcional MVP)
- [ ] Responsivo

**Tasks:**
- Criar endpoint GET `/api/v1/referrals/stats`
- Criar página de relatório
- Implementar gráficos (Recharts)
- Adicionar filtros
- Escrever testes

**Pontos:** 5  
**Prioridade:** P2

---

## Dependências

**Bloqueadores:**
- Epic 1: Autenticação (precisa de usuários autenticados)
- Epic 3: Onboarding (precisa de membros ativos)

**Dependentes:**
- Epic 6: Dashboards (usa dados de indicações)

---

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Complexidade do Kanban | Média | Alto | Começar sem drag&drop, adicionar depois |
| Performance com muitas indicações | Baixa | Médio | Paginação + índices no DB |
| Cálculo de reputação complexo | Média | Alto | Algoritmo simples no MVP, refinar depois |
| Notificações em tempo real | Baixa | Baixo | Polling no MVP, WebSocket depois |

---

## Testes Críticos

### Testes de Integração
- [ ] Fluxo completo: criar indicação → atualizar status → dar feedback
- [ ] Validação de permissões (apenas envolvidos podem editar)
- [ ] Cálculo correto de reputação
- [ ] Notificações enviadas corretamente

### Testes E2E
- [ ] Empresário A cria indicação para Empresário B
- [ ] Empresário B recebe notificação
- [ ] Empresário B atualiza status
- [ ] Empresário A vê atualização
- [ ] Empresário A dá feedback
- [ ] Reputação de B é atualizada

---

## Definition of Done

- [ ] Todas as 15 stories concluídas
- [ ] Testes unitários (cobertura > 70%)
- [ ] Testes de integração passando
- [ ] Testes E2E do fluxo crítico
- [ ] Documentação de API (Swagger)
- [ ] Code review aprovado
- [ ] Deploy em staging
- [ ] QA manual aprovado
- [ ] Demo para stakeholders
- [ ] Aceito pelo Product Owner

---

## Notas

- **Priorização:** Stories 4.1-4.12 são P0 (MVP mínimo)
- **Performance:** Adicionar índices em `from_member_id`, `to_member_id`, `status`, `created_at`
- **UX:** Feedback deve ser solicitado automaticamente após 7 dias (job agendado)
- **Segurança:** Rate limiting de 10 indicações/hora por usuário

---

_Epic mais crítico do MVP - core da proposta de valor do Ecosistema Union._
