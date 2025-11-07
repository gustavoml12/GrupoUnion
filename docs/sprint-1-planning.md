# Sprint 1 - Planning Document

**Projeto:** Ecosistema Union  
**Sprint:** 1 de 16  
**Duração:** 2 semanas (10 dias úteis)  
**Período:** [Data Início] - [Data Fim]  
**Velocity Estimada:** 15 pontos/semana = 30 pontos total

---

## 🎯 Meta do Sprint

**Objetivo Principal:**
> Estabelecer fundação técnica completa e implementar autenticação básica (registro + login).

**Critérios de Sucesso:**
- [ ] Ambiente de desenvolvimento rodando localmente (Docker)
- [ ] Ambiente de produção configurado (Coolify)
- [ ] CI/CD pipeline funcionando
- [ ] Usuário consegue se registrar
- [ ] Usuário consegue fazer login
- [ ] JWT funcionando

---

## 📊 Stories Selecionadas

### Epic 0: Setup e Infraestrutura (21 pontos)

| ID | Story | Pontos | Assignee | Status |
|----|-------|--------|----------|--------|
| 0.1 | Setup repositórios Git | 2 | Dev 1 | 📋 Todo |
| 0.2 | Docker Compose local | 3 | Dev 1 | 📋 Todo |
| 0.3 | Configurar Coolify production | 3 | Dev 1 | 📋 Todo |
| 0.4 | Setup PostgreSQL + Redis | 3 | Dev 1 | 📋 Todo |
| 0.5 | CI/CD Pipeline | 5 | Dev 1 | 📋 Todo |
| 0.6 | Setup AWS S3 | 2 | Dev 2 | 📋 Todo |
| 0.7 | Variáveis de ambiente | 1 | Dev 1 | 📋 Todo |
| 0.8 | Documentação de setup | 2 | Dev 2 | 📋 Todo |

### Epic 1: Autenticação (9 pontos)

| ID | Story | Pontos | Assignee | Status |
|----|-------|--------|----------|--------|
| 1.1 | Modelo de dados User | 3 | Dev 1 | 📋 Todo |
| 1.2 | API: Registro de usuário | 3 | Dev 1 | 📋 Todo |
| 1.3 | API: Login | 3 | Dev 1 | 📋 Todo |

**Total do Sprint:** 30 pontos

---

## 📅 Cronograma Detalhado

### Semana 1: Fundação (Dias 1-5)

#### **Dia 1 - Segunda-feira**
**Foco:** Setup inicial

**Dev 1:**
- [ ] Criar repositório no GitHub/GitLab
- [ ] Criar estrutura de pastas (frontend, backend, docs)
- [ ] Configurar .gitignore
- [ ] Criar README.md inicial
- [ ] Primeiro commit

**Dev 2:**
- [ ] Revisar PRD e Architecture
- [ ] Preparar ambiente local (instalar Docker, Node, Python)
- [ ] Clonar repositório

**Daily Standup:** 9h00 (15 min)

---

#### **Dia 2 - Terça-feira**
**Foco:** Docker Compose

**Dev 1:**
- [ ] Criar docker-compose.yml
- [ ] Configurar serviço PostgreSQL
- [ ] Configurar serviço Redis
- [ ] Testar conexões

**Dev 2:**
- [ ] Criar conta AWS (se não tiver)
- [ ] Criar bucket S3
- [ ] Configurar IAM user
- [ ] Testar upload/download

**Daily Standup:** 9h00

---

#### **Dia 3 - Quarta-feira**
**Foco:** Backend base

**Dev 1:**
- [ ] Criar estrutura backend (FastAPI)
- [ ] Criar Dockerfile backend
- [ ] Criar requirements.txt
- [ ] Implementar endpoint /health
- [ ] Configurar SQLAlchemy
- [ ] Configurar Alembic (migrations)

**Dev 2:**
- [ ] Documentar setup de S3
- [ ] Criar .env.example
- [ ] Começar README.md detalhado

**Daily Standup:** 9h00

---

#### **Dia 4 - Quinta-feira**
**Foco:** Frontend base

**Dev 1:**
- [ ] Revisar código backend
- [ ] Configurar CORS
- [ ] Testar endpoints

**Dev 2:**
- [ ] Criar projeto Next.js
- [ ] Configurar TailwindCSS
- [ ] Instalar shadcn/ui
- [ ] Criar Dockerfile frontend
- [ ] Criar layout base

**Daily Standup:** 9h00

---

#### **Dia 5 - Sexta-feira**
**Foco:** Integração + Coolify

**Dev 1:**
- [ ] Configurar Coolify
- [ ] Conectar repositório
- [ ] Configurar domínios
- [ ] Configurar SSL
- [ ] Primeiro deploy

**Dev 2:**
- [ ] Testar Docker Compose completo
- [ ] Integrar frontend com backend (/health)
- [ ] Documentar como rodar localmente

**Daily Standup:** 9h00  
**Sprint Review Parcial:** 16h00 (30 min)

---

### Semana 2: Autenticação (Dias 6-10)

#### **Dia 6 - Segunda-feira**
**Foco:** Modelo User

**Dev 1:**
- [ ] Criar modelo User (SQLAlchemy)
- [ ] Criar enums (UserRole, UserStatus)
- [ ] Criar migration inicial
- [ ] Aplicar migration
- [ ] Testar modelo

**Dev 2:**
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Lint automático (Python + TypeScript)
- [ ] Build automático

**Daily Standup:** 9h00

---

#### **Dia 7 - Terça-feira**
**Foco:** API Registro

**Dev 1:**
- [ ] Criar schema RegisterRequest (Pydantic)
- [ ] Implementar password hashing (bcrypt)
- [ ] Criar endpoint POST /api/v1/auth/register
- [ ] Validações (email único, senha forte)
- [ ] Testes unitários
- [ ] Documentação Swagger

**Dev 2:**
- [ ] Criar página /register
- [ ] Criar formulário de registro
- [ ] Validação client-side (Zod)
- [ ] Integrar com API

**Daily Standup:** 9h00

---

#### **Dia 8 - Quarta-feira**
**Foco:** API Login + JWT

**Dev 1:**
- [ ] Criar schema LoginRequest
- [ ] Implementar geração de JWT
- [ ] Criar endpoint POST /api/v1/auth/login
- [ ] Implementar refresh token
- [ ] Salvar refresh token no DB
- [ ] Testes unitários

**Dev 2:**
- [ ] Criar página /login
- [ ] Criar formulário de login
- [ ] Armazenar tokens (localStorage)
- [ ] Integrar com API

**Daily Standup:** 9h00

---

#### **Dia 9 - Quinta-feira**
**Foco:** Middleware + Proteção

**Dev 1:**
- [ ] Criar middleware get_current_user
- [ ] Implementar validação de JWT
- [ ] Criar endpoint GET /api/v1/auth/me
- [ ] Rate limiting no login
- [ ] Testes de integração

**Dev 2:**
- [ ] Criar componente ProtectedRoute
- [ ] Implementar redirect se não autenticado
- [ ] Criar página /dashboard (básica)
- [ ] Testar fluxo completo

**Daily Standup:** 9h00

---

#### **Dia 10 - Sexta-feira**
**Foco:** Testes + Deploy

**Dev 1 + Dev 2:**
- [ ] Testes E2E (registro → login → dashboard)
- [ ] Bug fixes
- [ ] Code review mútuo
- [ ] Atualizar documentação
- [ ] Deploy em staging
- [ ] Smoke tests em staging
- [ ] Preparar demo

**Daily Standup:** 9h00  
**Sprint Review:** 15h00 (1h)  
**Sprint Retrospective:** 16h00 (1h)

---

## 🎯 Definition of Done

Uma story está **DONE** quando:

- [ ] Código implementado e funcionando
- [ ] Code review aprovado (pelo menos 1 aprovação)
- [ ] Testes unitários escritos (cobertura > 70%)
- [ ] Testes de integração (se aplicável)
- [ ] Documentação atualizada (README + Swagger)
- [ ] Deploy em staging realizado
- [ ] QA manual aprovado
- [ ] Sem bugs críticos
- [ ] Aceito pelo Product Owner

---

## 🧪 Testes Críticos

### Testes Unitários (Backend)
- [ ] Teste: criar usuário com dados válidos
- [ ] Teste: rejeitar email duplicado
- [ ] Teste: rejeitar senha fraca
- [ ] Teste: login com credenciais corretas
- [ ] Teste: rejeitar login com senha errada
- [ ] Teste: JWT válido retorna usuário
- [ ] Teste: JWT expirado retorna 401

### Testes de Integração
- [ ] Teste: fluxo completo de registro
- [ ] Teste: fluxo completo de login
- [ ] Teste: acesso a rota protegida sem token
- [ ] Teste: acesso a rota protegida com token válido

### Testes E2E (Playwright)
- [ ] Teste: usuário se registra com sucesso
- [ ] Teste: usuário faz login com sucesso
- [ ] Teste: usuário acessa dashboard após login
- [ ] Teste: usuário não autenticado é redirecionado

---

## 📦 Entregáveis do Sprint

### Código
- [ ] Repositório Git configurado
- [ ] Docker Compose funcionando
- [ ] Backend FastAPI com endpoints:
  - GET /health
  - POST /api/v1/auth/register
  - POST /api/v1/auth/login
  - GET /api/v1/auth/me
- [ ] Frontend Next.js com páginas:
  - / (home)
  - /register
  - /login
  - /dashboard (básico)

### Infraestrutura
- [ ] Coolify configurado
- [ ] Deploy automático funcionando
- [ ] SSL ativo
- [ ] Variáveis de ambiente configuradas
- [ ] CI/CD pipeline rodando

### Documentação
- [ ] README.md completo (como rodar)
- [ ] API documentada (Swagger)
- [ ] .env.example criado
- [ ] Troubleshooting documentado

---

## 🚨 Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Problemas com Coolify | Média | Alto | Ter Vercel como backup |
| Complexidade do JWT | Baixa | Médio | Usar biblioteca testada (python-jose) |
| Atraso no setup | Média | Alto | Priorizar setup nos primeiros 3 dias |
| Integração frontend/backend | Baixa | Médio | Testar integração diariamente |
| Falta de experiência com FastAPI | Média | Médio | Pair programming + documentação |

---

## 📈 Métricas do Sprint

### Velocity
- **Planejado:** 30 pontos
- **Realizado:** ___ pontos (preencher no final)
- **Taxa de conclusão:** ___% (preencher no final)

### Qualidade
- **Bugs encontrados:** ___ (preencher no final)
- **Bugs resolvidos:** ___ (preencher no final)
- **Cobertura de testes:** ___% (preencher no final)

### Tempo
- **Estimado:** 80 horas (2 devs x 40h)
- **Real:** ___ horas (preencher no final)
- **Variação:** ___% (preencher no final)

---

## 🎤 Sprint Review (Sexta-feira 15h)

### Agenda
1. **Demo das funcionalidades** (30 min)
   - Mostrar ambiente rodando
   - Demonstrar registro de usuário
   - Demonstrar login
   - Mostrar dashboard básico

2. **Feedback do PO** (15 min)
   - O que funcionou bem?
   - O que precisa ajustar?
   - Aceitar ou rejeitar stories

3. **Próximos passos** (15 min)
   - Preview do Sprint 2
   - Ajustes no backlog

---

## 🔄 Sprint Retrospective (Sexta-feira 16h)

### Agenda
1. **O que foi bem?** (20 min)
   - Listar pontos positivos
   - O que devemos continuar fazendo?

2. **O que pode melhorar?** (20 min)
   - Listar pontos de melhoria
   - O que devemos parar de fazer?
   - O que devemos começar a fazer?

3. **Action Items** (20 min)
   - Definir ações concretas
   - Atribuir responsáveis
   - Definir prazos

### Template de Retrospectiva

**Continue Doing (Continuar fazendo):**
- 

**Stop Doing (Parar de fazer):**
- 

**Start Doing (Começar a fazer):**
- 

**Action Items:**
- [ ] Ação 1 - Responsável: ___ - Prazo: ___
- [ ] Ação 2 - Responsável: ___ - Prazo: ___

---

## 📋 Checklist de Início do Sprint

- [ ] Todas as stories têm critérios de aceitação claros
- [ ] Todas as stories estão estimadas
- [ ] Dependências identificadas
- [ ] Ambiente de desenvolvimento preparado
- [ ] Acesso a ferramentas (GitHub, Coolify, AWS)
- [ ] Time alinhado sobre a meta do sprint
- [ ] Definition of Done revisada
- [ ] Riscos identificados

---

## 📋 Checklist de Fim do Sprint

- [ ] Todas as stories concluídas ou movidas para próximo sprint
- [ ] Code review de todas as PRs
- [ ] Testes passando (unitários + integração + E2E)
- [ ] Deploy em staging realizado
- [ ] Documentação atualizada
- [ ] Demo preparada
- [ ] Métricas coletadas
- [ ] Retrospectiva agendada

---

## 🔗 Links Úteis

**Repositório:** [GitHub/GitLab URL]  
**Staging:** [URL do Coolify]  
**Swagger API:** http://localhost:8000/docs  
**Frontend Local:** http://localhost:3000  
**Board:** [Jira/Trello/GitHub Projects URL]  
**Documentação:** [Confluence/Notion URL]

---

## 👥 Time

**Product Owner:** Gustavo  
**Scrum Master:** [Nome]  
**Dev 1 (Backend):** [Nome]  
**Dev 2 (Frontend):** [Nome]

---

## 📞 Comunicação

**Daily Standup:** Segunda a Sexta, 9h00 (15 min)  
**Sprint Review:** Sexta-feira, 15h00 (1h)  
**Sprint Retrospective:** Sexta-feira, 16h00 (1h)  
**Canal:** [Slack/Discord/WhatsApp]  
**Emergências:** [Contato]

---

_Sprint 1 - Fundação do Ecosistema Union. Let's build! 🚀_
