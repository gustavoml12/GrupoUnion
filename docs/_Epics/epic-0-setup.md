# Epic 0: Setup e Infraestrutura

**Prioridade:** 🔴 Critical  
**Pontos:** 21  
**Sprints:** 1-2 (2 sprints)  
**Status:** 📋 Backlog

---

## Objetivo

Preparar ambiente de desenvolvimento e produção com Docker, Coolify, CI/CD e todas as ferramentas necessárias.

**Valor de Negócio:** Fundação técnica - sem isso não há como desenvolver.

---

## User Stories

### Story 0.1: Setup de Repositórios Git
**Como** desenvolvedor  
**Quero** repositórios Git organizados  
**Para que** possamos versionar código e colaborar

**Critérios de Aceitação:**
- [ ] Repositório criado no GitHub/GitLab
- [ ] Estrutura de pastas: `/frontend`, `/backend`, `/docs`
- [ ] `.gitignore` configurado
- [ ] README.md inicial
- [ ] Branch protection (main)
- [ ] Template de PR

**Pontos:** 2 | **Prioridade:** P0

---

### Story 0.2: Docker Compose Local
**Como** desenvolvedor  
**Quero** ambiente local com Docker  
**Para que** todos tenham ambiente idêntico

**Critérios de Aceitação:**
- [ ] `docker-compose.yml` criado
- [ ] 4 containers: frontend, backend, postgres, redis
- [ ] Networking configurado
- [ ] Volumes para persistência
- [ ] Health checks
- [ ] Documentação de como rodar

**Pontos:** 3 | **Prioridade:** P0

---

### Story 0.3: Configurar Coolify Production
**Como** DevOps  
**Quero** Coolify configurado  
**Para que** possamos fazer deploys automáticos

**Critérios de Aceitação:**
- [ ] Projeto criado no Coolify
- [ ] Repositório conectado
- [ ] Auto-deploy configurado (branch main)
- [ ] Domínios configurados
- [ ] SSL (Let's Encrypt) ativo
- [ ] Variáveis de ambiente configuradas

**Pontos:** 3 | **Prioridade:** P0

---

### Story 0.4: Setup PostgreSQL + Redis
**Como** desenvolvedor  
**Quero** bancos de dados configurados  
**Para que** possamos persistir dados

**Critérios de Aceitação:**
- [ ] PostgreSQL 15 rodando (container)
- [ ] Redis 7 rodando (container)
- [ ] Conexões testadas
- [ ] Backup automático configurado
- [ ] Migrations iniciais (Alembic)
- [ ] Seeds de desenvolvimento

**Pontos:** 3 | **Prioridade:** P0

---

### Story 0.5: CI/CD Pipeline
**Como** desenvolvedor  
**Quero** pipeline de CI/CD  
**Para que** testes rodem automaticamente

**Critérios de Aceitação:**
- [ ] GitHub Actions / GitLab CI configurado
- [ ] Lint automático (Python + TypeScript)
- [ ] Testes automáticos
- [ ] Build automático
- [ ] Deploy automático (staging + production)
- [ ] Notificações de falha

**Pontos:** 5 | **Prioridade:** P0

---

### Story 0.6: Setup AWS S3
**Como** desenvolvedor  
**Quero** S3 configurado  
**Para que** possamos armazenar arquivos

**Critérios de Aceitação:**
- [ ] Bucket S3 criado
- [ ] IAM user com permissões corretas
- [ ] CORS configurado
- [ ] Lifecycle policy (opcional)
- [ ] Teste de upload/download
- [ ] Documentação de uso

**Pontos:** 2 | **Prioridade:** P0

---

### Story 0.7: Variáveis de Ambiente
**Como** desenvolvedor  
**Quero** variáveis de ambiente organizadas  
**Para que** secrets fiquem seguros

**Critérios de Aceitação:**
- [ ] `.env.example` criado
- [ ] Secrets gerados (SECRET_KEY, API_SECRET)
- [ ] Variáveis no Coolify
- [ ] Documentação de variáveis
- [ ] Validação de variáveis no startup

**Pontos:** 1 | **Prioridade:** P0

---

### Story 0.8: Documentação de Setup
**Como** novo desenvolvedor  
**Quero** documentação clara  
**Para que** eu possa configurar ambiente rapidamente

**Critérios de Aceitação:**
- [ ] README.md completo
- [ ] Pré-requisitos listados
- [ ] Passo a passo de setup
- [ ] Troubleshooting comum
- [ ] Como rodar testes
- [ ] Como fazer deploy

**Pontos:** 2 | **Prioridade:** P1

---

## Definition of Done

- [ ] Todas as 8 stories concluídas
- [ ] Docker Compose rodando localmente
- [ ] Coolify fazendo deploy automático
- [ ] CI/CD pipeline funcionando
- [ ] Documentação completa
- [ ] Time consegue rodar projeto em < 15 min

---

_Epic de fundação - base para todo o desenvolvimento._
