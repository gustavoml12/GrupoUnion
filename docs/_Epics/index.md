# Ecosistema Union - Epic Breakdown

_Created on 2025-11-05 by Gustavo_  
_Generated using BMad Method - Epic Breakdown Workflow v1.0_

---

## Executive Summary

Decomposição do PRD do **Ecosistema Union** em epics e user stories prontas para desenvolvimento. Total de **7 epics** cobrindo o MVP completo.

**Objetivo:** Lançar MVP funcional em 4 meses (16 sprints de 1 semana)

**Escopo:** 5 módulos essenciais + infraestrutura

---

## 📊 Overview de Epics

| Epic | Nome | Stories | Pontos | Prioridade | Sprint |
|------|------|---------|--------|------------|--------|
| **Epic 0** | Setup e Infraestrutura | 8 | 21 | 🔴 Critical | 1-2 |
| **Epic 1** | Autenticação e Usuários | 12 | 34 | 🔴 Critical | 2-3 |
| **Epic 2** | Portal de Vendas | 6 | 13 | 🟡 High | 3-4 |
| **Epic 3** | Onboarding de Membros | 10 | 34 | 🔴 Critical | 4-6 |
| **Epic 4** | CRM de Indicações | 15 | 55 | 🔴 Critical | 6-10 |
| **Epic 5** | Gestão de Eventos | 10 | 34 | 🟡 High | 10-12 |
| **Epic 6** | Dashboards | 12 | 34 | 🟡 High | 12-14 |
| **Epic 7** | Polimento e Testes | 8 | 21 | 🟢 Medium | 14-16 |
| **TOTAL** | **8 Epics** | **81 Stories** | **246 pts** | - | **16 sprints** |

---

## 🎯 Roadmap Visual

```
Sprint 1-2:  [████████████] Epic 0: Setup
Sprint 2-3:  [████████████] Epic 1: Auth
Sprint 3-4:  [██████] Epic 2: Portal
Sprint 4-6:  [████████████] Epic 3: Onboarding
Sprint 6-10: [████████████████████] Epic 4: CRM
Sprint 10-12:[████████████] Epic 5: Eventos
Sprint 12-14:[████████████] Epic 6: Dashboards
Sprint 14-16:[████████████] Epic 7: Polimento
             └─────────────────────────────────┘
             MVP Launch! 🚀
```

---

## 📂 Epic Structure

### [Epic 0: Setup e Infraestrutura](./epic-0-setup.md)
**Objetivo:** Preparar ambiente de desenvolvimento e produção

**Stories:**
- Setup de repositórios (frontend + backend)
- Configurar Docker Compose local
- Configurar Coolify production
- Setup banco de dados (PostgreSQL + Redis)
- Configurar CI/CD pipeline
- Setup AWS S3 para arquivos
- Configurar variáveis de ambiente
- Documentação de setup

**Pontos:** 21 | **Prioridade:** 🔴 Critical

---

### [Epic 1: Autenticação e Usuários](./epic-1-auth.md)
**Objetivo:** Sistema de autenticação seguro com JWT

**Stories:**
- Modelo de dados User
- Registro de usuário
- Login com email/senha
- JWT access + refresh tokens
- Middleware de autenticação
- Logout e revogação de tokens
- Recuperação de senha
- Proteção de rotas (RBAC)
- Rate limiting de login
- Audit log de autenticação
- Testes de segurança
- Documentação de API

**Pontos:** 34 | **Prioridade:** 🔴 Critical

---

### [Epic 2: Portal de Vendas](./epic-2-portal.md)
**Objetivo:** Landing page pública para captação de leads

**Stories:**
- Design da landing page
- Hero section com proposta de valor
- Seção de benefícios
- Seção de como funciona
- Formulário de interesse
- Página de obrigado
- SEO básico

**Pontos:** 13 | **Prioridade:** 🟡 High

---

### [Epic 3: Onboarding de Membros](./epic-3-onboarding.md)
**Objetivo:** Processo de qualificação e integração de novos membros

**Stories:**
- Modelo de dados Member
- Formulário de cadastro inicial
- Trilha de vídeos (embed)
- Questionário de qualificação
- Agendamento de reunião presencial
- Dashboard do Hub (candidatos)
- Aprovação/reprovação de candidatos
- Notificações de status
- Completar perfil (foto, dados)
- Tour guiado da plataforma

**Pontos:** 34 | **Prioridade:** 🔴 Critical

---

### [Epic 4: CRM de Indicações](./epic-4-crm.md)
**Objetivo:** Sistema completo de gestão de indicações e feedbacks

**Stories:**
- Modelo de dados Referral
- Criar indicação (formulário)
- Listar minhas indicações (dadas)
- Listar indicações recebidas
- Pipeline Kanban visual
- Atualizar status da indicação
- Detalhes da indicação
- Notas internas
- Sistema de feedback (7 dias)
- Modelo de dados Feedback
- Formulário de feedback
- Impacto na reputação
- Alertas de feedback negativo
- Notificações de indicações
- Relatório de indicações

**Pontos:** 55 | **Prioridade:** 🔴 Critical

---

### [Epic 5: Gestão de Eventos](./epic-5-eventos.md)
**Objetivo:** Gestão de reuniões presenciais e check-in

**Stories:**
- Modelo de dados Event
- Criar evento (Hub)
- Listar eventos
- Detalhes do evento
- Confirmar presença
- Check-in (QR code ou manual)
- Modelo EventAttendance
- Notificações de eventos
- Lembretes automáticos
- Upload de materiais do evento

**Pontos:** 34 | **Prioridade:** 🟡 High

---

### [Epic 6: Dashboards](./epic-6-dashboards.md)
**Objetivo:** Dashboards com métricas e insights

**Stories:**
- Dashboard do Empresário
- Cards de estatísticas
- Gráfico de evolução
- Pendências e alertas
- Dashboard do Hub
- Métricas globais
- Top membros ativos
- Alertas de gestão
- Lista de membros (com filtros)
- Perfil público do membro
- Sistema de badges (básico)
- Ranking de membros

**Pontos:** 34 | **Prioridade:** 🟡 High

---

### [Epic 7: Polimento e Testes](./epic-7-polimento.md)
**Objetivo:** Finalizar MVP com qualidade

**Stories:**
- Testes E2E (fluxos críticos)
- Testes de performance
- Testes de segurança
- Bug fixes
- Melhorias de UX
- Documentação de usuário
- Treinamento do Hub
- Deploy final

**Pontos:** 21 | **Prioridade:** 🟢 Medium

---

## 📈 Velocity Planning

**Velocity Estimada:** 15 pontos/sprint (time de 2 devs)

**Sprints Necessários:**
- 246 pontos ÷ 15 pontos/sprint = **16.4 sprints**
- Arredondado: **16 sprints** (4 meses)

**Buffer:** 2 sprints extras para imprevistos = **18 sprints total** (4.5 meses)

---

## 🎯 Definition of Done (DoD)

Uma story está **DONE** quando:

- [ ] Código implementado e revisado
- [ ] Testes unitários escritos (cobertura > 70%)
- [ ] Testes de integração (se aplicável)
- [ ] Documentação de API atualizada (Swagger)
- [ ] Code review aprovado
- [ ] Deploy em staging
- [ ] QA manual aprovado
- [ ] Sem bugs críticos
- [ ] Aceito pelo Product Owner

---

## 🔄 Sprint Planning Process

### Sprint Planning (Segunda-feira)
1. Revisar velocity do sprint anterior
2. Selecionar stories do backlog
3. Quebrar stories em tasks
4. Estimar tasks em horas
5. Distribuir tasks entre devs
6. Definir meta do sprint

### Daily Standup (Diário - 15min)
1. O que fiz ontem?
2. O que vou fazer hoje?
3. Tenho algum bloqueio?

### Sprint Review (Sexta-feira)
1. Demo das stories concluídas
2. Feedback do PO
3. Aceitar ou rejeitar stories

### Sprint Retrospective (Sexta-feira)
1. O que foi bem?
2. O que pode melhorar?
3. Action items para próximo sprint

---

## 📊 Backlog Priorizado

Ver arquivo: [backlog.md](./backlog.md)

---

## Related Documents

- **PRD:** [Product Requirements](../_PRD/index.md)
- **UX Design:** [User Experience](../_UX-Design/index.md)
- **Architecture:** [Technical Architecture](../_Architecture/index.md)
- **Workflow Status:** [BMM Status](../bmm-workflow-status.yaml)

---

_Epic breakdown pronto para desenvolvimento ágil com Scrum._
