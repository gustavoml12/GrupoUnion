# Technical Specifications

## Recommended Technology Stack

### Frontend
- **Framework:** React 18+ ou Next.js 14+
- **Language:** TypeScript
- **Styling:** TailwindCSS + shadcn/ui (componentes)
- **State Management:** Zustand ou React Context
- **Forms:** React Hook Form + Zod (validação)
- **Charts:** Recharts ou Chart.js
- **Icons:** Lucide React
- **HTTP Client:** Axios ou Fetch API

### Backend
- **Framework:** Node.js + Express ou NestJS
- **Language:** TypeScript
- **ORM:** Prisma ou TypeORM
- **Authentication:** JWT + bcrypt
- **Validation:** Zod ou Joi
- **API Documentation:** Swagger/OpenAPI

### Database
- **Primary:** PostgreSQL 15+
- **Cache:** Redis (para sessões e queries frequentes)
- **File Storage:** AWS S3 ou similar (fotos, documentos)

### Infrastructure
- **Hosting:** Vercel (frontend) + Railway/Render (backend)
- **Database:** Supabase ou Railway
- **CDN:** Cloudflare
- **Email:** SendGrid ou Resend
- **Monitoring:** Sentry (erros) + Vercel Analytics

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
       ↓
┌─────────────────────┐
│   Frontend (React)  │
│   - Next.js App     │
│   - TailwindCSS     │
│   - shadcn/ui       │
└──────┬──────────────┘
       │ REST API
       ↓
┌─────────────────────┐
│  Backend (Node.js)  │
│   - Express/Nest    │
│   - JWT Auth        │
│   - Business Logic  │
└──────┬──────────────┘
       │
       ├─────────────┐
       ↓             ↓
┌──────────┐   ┌─────────┐
│PostgreSQL│   │  Redis  │
│ Database │   │  Cache  │
└──────────┘   └─────────┘
```

### API Structure

**RESTful Endpoints:**

```
/api/v1/auth
  POST   /register
  POST   /login
  POST   /logout
  POST   /refresh
  POST   /forgot-password
  POST   /reset-password

/api/v1/users
  GET    /me
  PUT    /me
  GET    /:id
  GET    /
  POST   /
  PUT    /:id
  DELETE /:id

/api/v1/members
  GET    /
  GET    /:id
  POST   /
  PUT    /:id/status
  GET    /:id/stats

/api/v1/referrals
  GET    /
  GET    /:id
  POST   /
  PUT    /:id/status
  POST   /:id/feedback
  GET    /stats

/api/v1/events
  GET    /
  GET    /:id
  POST   /
  PUT    /:id
  DELETE /:id
  POST   /:id/checkin

/api/v1/dashboard
  GET    /member/:id
  GET    /hub

/api/v1/notifications
  GET    /
  PUT    /:id/read
  PUT    /read-all
```

---

## Database Schema (Simplified)

### Core Tables

**users**
- id (UUID, PK)
- email (unique)
- password_hash
- role (enum: member, hub, admin)
- status (enum: pending, active, suspended, removed)
- created_at, updated_at

**members**
- id (UUID, PK)
- user_id (FK → users)
- full_name
- company_name
- category
- phone, website
- photo_url
- onboarding_completed (boolean)
- onboarding_completed_at
- reputation_score (int)
- total_points (int)
- created_at, updated_at

**referrals**
- id (UUID, PK)
- from_member_id (FK → members)
- to_member_id (FK → members)
- client_name, client_company, client_phone, client_email
- context (text)
- qualification (enum: hot, warm, cold)
- status (enum: pending, contacted, negotiating, won, lost, cancelled)
- created_at, updated_at

**feedbacks**
- id (UUID, PK)
- referral_id (FK → referrals)
- from_member_id (FK → members)
- was_well_served (boolean)
- quality_rating (int 1-5)
- comments (text)
- deal_closed (boolean)
- deal_value (decimal, nullable)
- created_at

**events**
- id (UUID, PK)
- title, description
- date, time, location
- created_by (FK → users)
- created_at, updated_at

**event_attendances**
- id (UUID, PK)
- event_id (FK → events)
- member_id (FK → members)
- confirmed (boolean)
- checked_in (boolean)
- checked_in_at

**badges**
- id (UUID, PK)
- name, description
- icon_url
- criteria (json)

**member_badges**
- id (UUID, PK)
- member_id (FK → members)
- badge_id (FK → badges)
- earned_at

**notifications**
- id (UUID, PK)
- user_id (FK → users)
- type, title, message
- read (boolean)
- created_at

---

## Security Considerations

### Authentication
- JWT tokens com expiração curta (15 min)
- Refresh tokens com expiração longa (7 dias)
- Tokens armazenados em httpOnly cookies
- CSRF protection

### Authorization
- Role-Based Access Control (RBAC)
- Middleware de verificação em todas as rotas protegidas
- Validação de ownership (usuário só acessa seus dados)

### Data Protection
- Senhas com bcrypt (salt rounds: 12)
- Dados sensíveis criptografados em repouso
- HTTPS obrigatório
- Rate limiting (100 req/min por IP)
- Input sanitization
- SQL injection prevention (ORM)
- XSS prevention (escape de HTML)

### Privacy (LGPD)
- Consentimento explícito no cadastro
- Política de privacidade clara
- Direito ao esquecimento (soft delete)
- Logs de acesso a dados sensíveis
- Anonimização de dados em relatórios

---

## Performance Optimization

### Frontend
- Code splitting (lazy loading de rotas)
- Image optimization (Next.js Image)
- Bundle size < 200KB (gzipped)
- Lighthouse score > 90

### Backend
- Query optimization (índices no DB)
- Caching de queries frequentes (Redis)
- Pagination em listas (limit 50)
- Compression (gzip)

### Database
- Índices em colunas de busca frequente
- Queries otimizadas (EXPLAIN ANALYZE)
- Connection pooling
- Backup automático diário

---

## Testing Strategy

### Unit Tests
- Cobertura > 70%
- Jest + React Testing Library (frontend)
- Jest (backend)
- Testes de funções críticas (auth, cálculos)

### Integration Tests
- Testes de APIs (Supertest)
- Testes de fluxos completos
- Mock de serviços externos

### E2E Tests (Opcional MVP)
- Playwright ou Cypress
- Fluxos críticos (onboarding, criar indicação)

---

## Deployment Strategy

### Environments
- **Development:** Local
- **Staging:** Preview deployments (Vercel)
- **Production:** vercel.app ou domínio custom

### CI/CD Pipeline
1. Push to GitHub
2. Run tests automaticamente
3. Build and deploy to staging (branches)
4. Deploy to production (main branch)

### Monitoring
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- Uptime monitoring (UptimeRobot)
- Logs centralizados (Logtail ou similar)

---

## Scalability Plan

### Phase 1: MVP (50 users)
- Single server
- Shared database
- Basic caching

### Phase 2: Growth (500 users)
- Load balancer
- Database read replicas
- CDN para assets
- Redis cluster

### Phase 3: Scale (5000+ users)
- Microservices (se necessário)
- Database sharding
- Message queue (RabbitMQ/Redis)
- Auto-scaling

---

_Stack técnico focado em produtividade, performance e escalabilidade._
