# Ecosistema Union

Plataforma SaaS B2B para networking empresarial qualificado e geração de negócios através de indicações.

## 🎯 Visão Geral

O Ecosistema Union é um "selo de qualidade" para empresários, oferecendo:
- ✅ Networking qualificado e exclusivo
- ✅ CRM de indicações com reciprocidade obrigatória
- ✅ Sistema de reputação transparente
- ✅ Gestão de eventos presenciais
- ✅ Dashboards com métricas de negócios

## 🏗️ Arquitetura

```
┌─────────────────────────────────────┐
│  Frontend (Next.js 14 + TypeScript) │
│  Port: 3000                         │
└──────────────┬──────────────────────┘
               │ HTTPS
               ↓
┌─────────────────────────────────────┐
│  Backend (FastAPI + Python 3.11)    │
│  Port: 8000                         │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        ↓             ↓
┌──────────────┐  ┌─────────┐
│ PostgreSQL   │  │  Redis  │
│ Port: 5432   │  │  6379   │
└──────────────┘  └─────────┘
```

## 🚀 Quick Start

### Pré-requisitos

- Docker & Docker Compose
- Node.js 20+
- Python 3.11+
- Git

### Rodar Localmente

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/ecosistema-union.git
cd ecosistema-union

# 2. Copiar variáveis de ambiente
cp .env.example .env

# 3. Subir containers
docker-compose up -d

# 4. Acessar aplicação
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Rodar sem Docker

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📂 Estrutura do Projeto

```
ecosistema-union/
├── frontend/           # Next.js application
│   ├── app/           # App router pages
│   ├── components/    # React components
│   ├── lib/           # Utilities
│   └── public/        # Static files
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── api/       # API routes
│   │   ├── core/      # Core config
│   │   ├── models/    # SQLAlchemy models
│   │   ├── schemas/   # Pydantic schemas
│   │   └── services/  # Business logic
│   └── alembic/       # Database migrations
├── docs/              # Documentation
│   ├── _PRD/          # Product Requirements
│   ├── _UX-Design/    # UX Specifications
│   ├── _Architecture/ # Technical Architecture
│   └── _Epics/        # Epic Breakdown
└── docker-compose.yml # Docker orchestration
```

## 🛠️ Stack Tecnológico

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui
- Zustand (state)
- SWR (data fetching)

**Backend:**
- FastAPI
- SQLAlchemy 2.0
- Alembic (migrations)
- Pydantic V2
- PostgreSQL 15
- Redis 7

**DevOps:**
- Docker & Docker Compose
- Coolify (deployment)
- GitHub Actions (CI/CD)
- AWS S3 (file storage)

## 📖 Documentação

- [PRD - Product Requirements](./docs/_PRD/index.md)
- [UX Design](./docs/_UX-Design/index.md)
- [Architecture](./docs/_Architecture/index.md)
- [Epic Breakdown](./docs/_Epics/index.md)
- [Sprint Planning](./docs/sprint-1-planning.md)

## 🧪 Testes

**Backend:**
```bash
cd backend
pytest
pytest --cov=app tests/
```

**Frontend:**
```bash
cd frontend
npm test
npm run test:e2e
```

## 🚢 Deploy

### Staging
```bash
git push origin develop
# Auto-deploy via Coolify
```

### Production
```bash
git push origin main
# Auto-deploy via Coolify
```

## 📊 Roadmap

- [x] Brainstorming e Discovery
- [x] PRD Completo
- [x] UX Design
- [x] Arquitetura Técnica
- [x] Epic Breakdown
- [ ] **Sprint 1: Setup + Auth** (em andamento)
- [ ] Sprint 2-3: Onboarding
- [ ] Sprint 4-10: CRM de Indicações
- [ ] Sprint 11-14: Eventos + Dashboards
- [ ] Sprint 15-16: Polimento + Launch

## 👥 Time

**Product Owner:** Gustavo  
**Developers:** [Nomes]

## 📝 License

Proprietary - Grupo Union © 2025

## 🤝 Contribuindo

Este é um projeto privado. Para contribuir, entre em contato com o time.

---

**Desenvolvido com ❤️ pelo time Grupo Union**
