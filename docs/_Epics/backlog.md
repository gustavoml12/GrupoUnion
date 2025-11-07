# Product Backlog - Ecosistema Union

**Última Atualização:** 2025-11-05  
**Total de Stories:** 81  
**Total de Pontos:** 246

---

## 🎯 Sprint 1-2: Fundação (Semanas 1-2)

### Epic 0: Setup e Infraestrutura (21 pts)

| ID | Story | Pontos | Prioridade |
|----|-------|--------|------------|
| 0.1 | Setup repositórios Git (frontend + backend) | 2 | P0 |
| 0.2 | Configurar Docker Compose local | 3 | P0 |
| 0.3 | Configurar Coolify production | 3 | P0 |
| 0.4 | Setup PostgreSQL + Redis | 3 | P0 |
| 0.5 | Configurar CI/CD pipeline | 5 | P0 |
| 0.6 | Setup AWS S3 | 2 | P0 |
| 0.7 | Configurar variáveis de ambiente | 1 | P0 |
| 0.8 | Documentação de setup | 2 | P1 |

**Meta do Sprint:** Ambiente de desenvolvimento e produção funcionando

---

## 🔐 Sprint 2-3: Autenticação (Semanas 2-3)

### Epic 1: Autenticação e Usuários (34 pts)

| ID | Story | Pontos | Prioridade |
|----|-------|--------|------------|
| 1.1 | Modelo de dados User | 3 | P0 |
| 1.2 | API: Registro de usuário | 3 | P0 |
| 1.3 | API: Login com email/senha | 3 | P0 |
| 1.4 | API: JWT access + refresh tokens | 5 | P0 |
| 1.5 | Middleware de autenticação | 3 | P0 |
| 1.6 | API: Logout e revogação de tokens | 2 | P0 |
| 1.7 | API: Recuperação de senha | 3 | P1 |
| 1.8 | Frontend: Página de login | 3 | P0 |
| 1.9 | Frontend: Página de registro | 3 | P0 |
| 1.10 | Proteção de rotas (RBAC) | 2 | P0 |
| 1.11 | Rate limiting de login | 2 | P0 |
| 1.12 | Audit log de autenticação | 2 | P1 |

**Meta do Sprint:** Sistema de autenticação seguro funcionando

---

## 🌐 Sprint 3-4: Portal Público (Semanas 3-4)

### Epic 2: Portal de Vendas (13 pts)

| ID | Story | Pontos | Prioridade |
|----|-------|--------|------------|
| 2.1 | Design da landing page | 2 | P1 |
| 2.2 | Hero section | 2 | P1 |
| 2.3 | Seção de benefícios | 2 | P1 |
| 2.4 | Seção "Como funciona" | 2 | P1 |
| 2.5 | Formulário de interesse | 3 | P1 |
| 2.6 | Página de obrigado | 1 | P1 |
| 2.7 | SEO básico | 1 | P2 |

**Meta do Sprint:** Landing page para captação de leads

---

## 👥 Sprint 4-6: Onboarding (Semanas 4-6)

### Epic 3: Onboarding de Membros (34 pts)

| ID | Story | Pontos | Prioridade |
|----|-------|--------|------------|
| 3.1 | Modelo de dados Member | 3 | P0 |
| 3.2 | Formulário de cadastro inicial | 3 | P0 |
| 3.3 | Trilha de vídeos (embed) | 3 | P0 |
| 3.4 | Questionário de qualificação | 5 | P0 |
| 3.5 | Agendamento de reunião | 3 | P0 |
| 3.6 | Dashboard Hub: candidatos | 5 | P0 |
| 3.7 | Aprovação/reprovação | 3 | P0 |
| 3.8 | Notificações de status | 2 | P0 |
| 3.9 | Completar perfil (foto, dados) | 3 | P0 |
| 3.10 | Tour guiado da plataforma | 4 | P1 |

**Meta do Sprint:** Processo completo de onboarding funcionando

---

## 💼 Sprint 6-10: CRM de Indicações (Semanas 6-10)

### Epic 4: CRM de Indicações (55 pts)

**Sprint 6-7:**

| ID | Story | Pontos | Prioridade |
|----|-------|--------|------------|
| 4.1 | Modelo de dados Referral | 3 | P0 |
| 4.2 | API: Criar indicação | 5 | P0 |
| 4.3 | API: Listar indicações dadas | 3 | P0 |
| 4.4 | API: Listar indicações recebidas | 3 | P0 |
| 4.5 | Frontend: Formulário criar indicação | 5 | P0 |

**Sprint 8:**

| ID | Story | Pontos | Prioridade |
|----|-------|--------|------------|
| 4.6 | Frontend: Pipeline Kanban | 8 | P0 |
| 4.7 | API: Atualizar status | 5 | P0 |
| 4.8 | Frontend: Detalhes da indicação | 5 | P1 |

**Sprint 9:**

| ID | Story | Pontos | Prioridade |
|----|-------|--------|------------|
| 4.9 | API: Notas internas | 3 | P1 |
| 4.10 | Modelo de dados Feedback | 2 | P0 |
| 4.11 | API: Sistema de feedback | 5 | P0 |
| 4.12 | Frontend: Formulário feedback | 3 | P0 |

**Sprint 10:**

| ID | Story | Pontos | Prioridade |
|----|-------|--------|------------|
| 4.13 | Alertas feedback negativo (Hub) | 3 | P1 |
| 4.14 | Notificações de indicações | 5 | P1 |
| 4.15 | Relatório de indicações | 5 | P2 |

**Meta dos Sprints:** Sistema completo de CRM funcionando

---

## 📅 Sprint 10-12: Eventos (Semanas 10-12)

### Epic 5: Gestão de Eventos (34 pts)

**Sprint 10-11:**

| ID | Story | Pontos | Prioridade |
|----|-------|--------|------------|
| 5.1 | Modelo de dados Event | 3 | P1 |
| 5.2 | API: Criar evento (Hub) | 3 | P1 |
| 5.3 | API: Listar eventos | 2 | P1 |
| 5.4 | API: Detalhes do evento | 2 | P1 |
| 5.5 | Frontend: Criar evento | 4 | P1 |
| 5.6 | Frontend: Lista de eventos | 3 | P1 |

**Sprint 12:**

| ID | Story | Pontos | Prioridade |
|----|-------|--------|------------|
| 5.7 | API: Confirmar presença | 2 | P1 |
| 5.8 | API: Check-in (QR code) | 5 | P1 |
| 5.9 | Notificações de eventos | 3 | P1 |
| 5.10 | Upload de materiais | 3 | P2 |
| 5.11 | Lembretes automáticos | 4 | P2 |

**Meta dos Sprints:** Gestão completa de eventos

---

## 📊 Sprint 12-14: Dashboards (Semanas 12-14)

### Epic 6: Dashboards (34 pts)

**Sprint 12-13:**

| ID | Story | Pontos | Prioridade |
|----|-------|--------|------------|
| 6.1 | Dashboard do Empresário | 5 | P1 |
| 6.2 | Cards de estatísticas | 3 | P1 |
| 6.3 | Gráfico de evolução | 4 | P1 |
| 6.4 | Pendências e alertas | 3 | P1 |
| 6.5 | Dashboard do Hub | 5 | P1 |
| 6.6 | Métricas globais | 3 | P1 |

**Sprint 14:**

| ID | Story | Pontos | Prioridade |
|----|-------|--------|------------|
| 6.7 | Top membros ativos | 2 | P1 |
| 6.8 | Alertas de gestão | 2 | P1 |
| 6.9 | Lista de membros (filtros) | 3 | P1 |
| 6.10 | Perfil público do membro | 2 | P1 |
| 6.11 | Sistema de badges (básico) | 1 | P2 |
| 6.12 | Ranking de membros | 1 | P2 |

**Meta dos Sprints:** Dashboards com insights e métricas

---

## 🎨 Sprint 14-16: Polimento (Semanas 14-16)

### Epic 7: Polimento e Testes (21 pts)

**Sprint 14-15:**

| ID | Story | Pontos | Prioridade |
|----|-------|--------|------------|
| 7.1 | Testes E2E (fluxos críticos) | 5 | P0 |
| 7.2 | Testes de performance | 3 | P1 |
| 7.3 | Testes de segurança | 3 | P0 |
| 7.4 | Bug fixes críticos | 3 | P0 |
| 7.5 | Melhorias de UX | 3 | P1 |

**Sprint 16:**

| ID | Story | Pontos | Prioridade |
|----|-------|--------|------------|
| 7.6 | Documentação de usuário | 2 | P1 |
| 7.7 | Treinamento do Hub | 1 | P1 |
| 7.8 | Deploy final e validação | 1 | P0 |

**Meta dos Sprints:** MVP polido e pronto para lançamento

---

## 📈 Resumo por Sprint

| Sprint | Semana | Epic | Pontos | Stories |
|--------|--------|------|--------|---------|
| 1-2 | 1-2 | Epic 0: Setup | 21 | 8 |
| 2-3 | 2-3 | Epic 1: Auth | 34 | 12 |
| 3-4 | 3-4 | Epic 2: Portal | 13 | 7 |
| 4-6 | 4-6 | Epic 3: Onboarding | 34 | 10 |
| 6-7 | 6-7 | Epic 4: CRM (Parte 1) | 19 | 5 |
| 8 | 8 | Epic 4: CRM (Parte 2) | 18 | 3 |
| 9 | 9 | Epic 4: CRM (Parte 3) | 13 | 4 |
| 10 | 10 | Epic 4: CRM (Parte 4) + Epic 5 (Parte 1) | 19 | 9 |
| 11 | 11 | Epic 5: Eventos (Parte 2) | 15 | 5 |
| 12 | 12 | Epic 5: Eventos (Parte 3) + Epic 6 (Parte 1) | 19 | 7 |
| 13 | 13 | Epic 6: Dashboards (Parte 2) | 15 | 6 |
| 14 | 14 | Epic 6: Dashboards (Parte 3) + Epic 7 (Parte 1) | 14 | 7 |
| 15 | 15 | Epic 7: Polimento (Parte 2) | 6 | 3 |
| 16 | 16 | Epic 7: Deploy Final | 4 | 3 |
| **TOTAL** | **16 semanas** | **8 Epics** | **246** | **81** |

---

## 🎯 Prioridades

### P0 - Critical (MVP Mínimo)
- Epic 0: Setup
- Epic 1: Autenticação
- Epic 3: Onboarding
- Epic 4: CRM (stories 4.1-4.12)
- Epic 7: Testes (stories 7.1, 7.3, 7.4, 7.8)

### P1 - High (MVP Completo)
- Epic 2: Portal
- Epic 5: Eventos
- Epic 6: Dashboards
- Epic 4: CRM (stories 4.13-4.14)
- Epic 7: Polimento (stories 7.2, 7.5, 7.6, 7.7)

### P2 - Medium (Nice to Have)
- Epic 4: CRM (story 4.15)
- Epic 5: Eventos (stories 5.10, 5.11)
- Epic 6: Dashboards (stories 6.11, 6.12)

---

## 📋 Definition of Ready

Uma story está **READY** para o sprint quando:

- [ ] Critérios de aceitação claros
- [ ] Estimada em pontos
- [ ] Dependências identificadas
- [ ] Design/mockups disponíveis (se UI)
- [ ] API contract definido (se backend)
- [ ] Prioridade definida
- [ ] Aceita pelo time

---

## ✅ Definition of Done

Uma story está **DONE** quando:

- [ ] Código implementado
- [ ] Code review aprovado
- [ ] Testes unitários (cobertura > 70%)
- [ ] Testes de integração (se aplicável)
- [ ] Documentação de API (Swagger)
- [ ] Deploy em staging
- [ ] QA manual aprovado
- [ ] Sem bugs críticos
- [ ] Aceito pelo PO

---

_Backlog priorizado e pronto para desenvolvimento ágil._
