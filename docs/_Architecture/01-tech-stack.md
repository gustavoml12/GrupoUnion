# Technology Stack

## Frontend

### Framework: Next.js 14+ (App Router)

**Por quê?**
- ✅ Full-stack framework (frontend + API routes)
- ✅ React Server Components (performance)
- ✅ File-based routing (produtividade)
- ✅ Built-in optimizations (images, fonts, etc.)
- ✅ Deploy fácil (Vercel)
- ✅ TypeScript nativo
- ✅ Comunidade enorme

**Versão:** 14.0+

### Language: TypeScript

**Por quê?**
- ✅ Type safety (menos bugs)
- ✅ Melhor DX (autocomplete, refactoring)
- ✅ Documentação viva no código
- ✅ Escalabilidade de código

**Versão:** 5.0+

### Styling: TailwindCSS 3.4+

**Por quê?**
- ✅ Utility-first (produtividade)
- ✅ Customização fácil (cores do logo)
- ✅ Purge automático (bundle pequeno)
- ✅ Responsive design simples
- ✅ Dark mode built-in

**Plugins:**
- `@tailwindcss/forms`
- `@tailwindcss/typography`
- `tailwindcss-animate`

### Component Library: shadcn/ui

**Por quê?**
- ✅ Componentes modernos e acessíveis
- ✅ Customizáveis (não é biblioteca fechada)
- ✅ Baseado em Radix UI (acessibilidade)
- ✅ TailwindCSS nativo
- ✅ Copy-paste (você é dono do código)

**Componentes Principais:**
- Button, Input, Select, Textarea
- Card, Dialog, Dropdown, Popover
- Table, Tabs, Toast, Tooltip
- Form (com React Hook Form + Zod)

### State Management: Zustand

**Por quê?**
- ✅ Simples e leve (< 1KB)
- ✅ Sem boilerplate
- ✅ TypeScript perfeito
- ✅ DevTools
- ✅ Suficiente para MVP

**Alternativa (se crescer):** React Query + Context

### Forms: React Hook Form + Zod

**Por quê?**
- ✅ Performance (uncontrolled components)
- ✅ Validação type-safe (Zod)
- ✅ Integração perfeita com shadcn/ui
- ✅ Menos re-renders

### Charts: Recharts

**Por quê?**
- ✅ Baseado em React
- ✅ Customizável
- ✅ Responsivo
- ✅ Fácil de usar

**Alternativa:** Chart.js (se precisar mais features)

### Icons: Lucide React

**Por quê?**
- ✅ Modernos e consistentes
- ✅ Tree-shakeable
- ✅ Customizáveis
- ✅ Grande variedade

### HTTP Client: Native Fetch + SWR

**Por quê?**
- ✅ Fetch nativo (sem dependência extra)
- ✅ SWR para cache e revalidação
- ✅ Otimista UI fácil
- ✅ Integração perfeita com Next.js

---

## Backend

### Framework: FastAPI (Python 3.11+)

**Por quê?**
- ✅ Performance excelente (async/await nativo)
- ✅ Type hints (Python moderno)
- ✅ Documentação automática (Swagger/OpenAPI)
- ✅ Validação com Pydantic
- ✅ Fácil de aprender e manter
- ✅ Comunidade grande
- ✅ Perfeito para APIs REST

**Versão:** 0.104+

### ORM: SQLAlchemy 2.0

**Por quê?**
- ✅ ORM maduro e robusto
- ✅ Async support (performance)
- ✅ Type hints (Python moderno)
- ✅ Migrations com Alembic
- ✅ Relacionamentos complexos
- ✅ Query builder poderoso

**Versão:** 2.0+

### Migrations: Alembic

**Por quê?**
- ✅ Padrão com SQLAlchemy
- ✅ Migrations versionadas
- ✅ Auto-generate migrations
- ✅ Rollback support

### Authentication: JWT + OAuth2

**Implementação:**
- `python-jose` - JWT tokens
- `passlib` - Password hashing (bcrypt)
- `python-multipart` - Form data

**Estratégia de Segurança:**
- Access Token (15 min) - JWT
- Refresh Token (7 dias) - Stored in DB
- Password hashing com bcrypt (12 rounds)
- HTTPS obrigatório
- CORS configurado
- Rate limiting

### Validation: Pydantic V2

**Por quê?**
- ✅ Integrado com FastAPI
- ✅ Type-safe validation
- ✅ Serialization automática
- ✅ Error messages claros
- ✅ Performance excelente

**Versão:** 2.0+

### File Upload: Python-multipart + boto3

**Por quê?**
- ✅ Upload direto para S3
- ✅ Validação de tipo/tamanho
- ✅ Presigned URLs (segurança)
- ✅ Controle total

### Security Libraries

**python-jose[cryptography]** - JWT
**passlib[bcrypt]** - Password hashing
**python-multipart** - File uploads
**slowapi** - Rate limiting
**python-dotenv** - Environment variables

---

## Database

### Primary Database: PostgreSQL 15+

**Por quê?**
- ✅ Relacional (perfeito para nosso modelo)
- ✅ ACID compliant
- ✅ Robusto e escalável
- ✅ JSON support (flexibilidade)
- ✅ Full-text search
- ✅ Comunidade enorme

**Hosting:** Supabase ou Railway

### Cache: Redis

**Por quê?**
- ✅ In-memory (super rápido)
- ✅ Cache de queries
- ✅ Session storage
- ✅ Rate limiting

**Hosting:** Upstash (serverless Redis)

**Uso:**
- Cache de dashboards
- Cache de listas de membros
- Session storage
- Rate limiting de APIs

---

## Infrastructure

### Hosting: Coolify (Self-hosted)

**Por quê?**
- ✅ Self-hosted (controle total)
- ✅ Docker-based (containers isolados)
- ✅ Deploy automático (Git push)
- ✅ Múltiplos ambientes
- ✅ SSL automático (Let's Encrypt)
- ✅ Logs centralizados
- ✅ Custo-benefício excelente

**Containers:**
1. **Frontend** - Next.js (Node.js 20)
2. **Backend** - FastAPI (Python 3.11)
3. **Database** - PostgreSQL 15
4. **Cache** - Redis 7

### Container Orchestration: Docker Compose

**Por quê?**
- ✅ Simples e efetivo
- ✅ Networking automático
- ✅ Volumes persistentes
- ✅ Fácil de debugar
- ✅ Coolify usa Docker Compose

### Database: PostgreSQL 15 (Container)

**Por quê?**
- ✅ Container dedicado
- ✅ Backups via volumes
- ✅ Isolamento de rede
- ✅ Fácil de escalar

**Configuração:**
- Volume persistente para dados
- Backup automático (cron job)
- Connection pooling (PgBouncer se necessário)

### File Storage: AWS S3

**Por quê?**
- ✅ Padrão da indústria
- ✅ Durável (99.999999999%)
- ✅ Escalável infinito
- ✅ CDN (CloudFront)
- ✅ Barato

**Uso:**
- Fotos de perfil
- Materiais de eventos
- Documentos

### Email: Resend

**Por quê?**
- ✅ API moderna
- ✅ React Email (templates em React)
- ✅ Deliverability alta
- ✅ Analytics
- ✅ Free tier: 3k emails/mês

**Alternativa:** SendGrid

### Monitoring: Sentry

**Por quê?**
- ✅ Error tracking
- ✅ Performance monitoring
- ✅ Integração com Next.js
- ✅ Source maps
- ✅ Free tier generoso

### Analytics: Vercel Analytics + Posthog

**Vercel Analytics:**
- Web vitals
- Page views
- Performance

**Posthog (Futuro):**
- Product analytics
- Feature flags
- Session replay
- A/B testing

---

## Development Tools

### Version Control: Git + GitHub

**Por quê?**
- ✅ Padrão da indústria
- ✅ CI/CD fácil
- ✅ Code review
- ✅ Issues e projects

### Package Manager: pnpm

**Por quê?**
- ✅ Mais rápido que npm/yarn
- ✅ Disk space eficiente
- ✅ Strict (menos bugs)

**Alternativa:** npm (se time preferir)

### Code Quality

**ESLint:**
- `eslint-config-next`
- `@typescript-eslint`
- `eslint-plugin-react-hooks`

**Prettier:**
- Formatação automática
- Integração com ESLint

**Husky + lint-staged:**
- Pre-commit hooks
- Lint antes de commit

### Testing (Futuro)

**Unit Tests:** Vitest
**Integration Tests:** Playwright
**E2E Tests:** Playwright

---

## Third-Party Services

### Payment Gateway (Fase 2): Stripe

**Por quê?**
- ✅ API moderna
- ✅ Webhooks confiáveis
- ✅ Dashboard completo
- ✅ Compliance (PCI DSS)
- ✅ Suporte a PIX

**Alternativa:** Mercado Pago (mais brasileiro)

### WhatsApp API (Fase 2): Twilio

**Por quê?**
- ✅ API oficial WhatsApp Business
- ✅ Confiável
- ✅ Webhooks

**Alternativa:** Evolution API (open source)

---

## Stack Summary

```
┌─────────────────────────────────────┐
│         Frontend (Vercel)           │
│  Next.js 14 + TypeScript + Tailwind │
│  shadcn/ui + Zustand + SWR          │
└──────────────┬──────────────────────┘
               │ HTTPS
               ↓
┌─────────────────────────────────────┐
│      Backend (Next.js API Routes)   │
│  TypeScript + Prisma + NextAuth     │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        ↓             ↓
┌──────────────┐  ┌─────────┐
│ PostgreSQL   │  │  Redis  │
│ (Supabase)   │  │(Upstash)│
└──────────────┘  └─────────┘
        ↓
┌──────────────┐
│   AWS S3     │
│ (Files)      │
└──────────────┘
```

---

## Cost Estimate (MVP - Monthly)

**Vercel:** $0 (Hobby plan)  
**Supabase:** $0 (Free tier - 500MB DB)  
**Upstash Redis:** $0 (Free tier - 10k commands/day)  
**AWS S3:** ~$5 (storage + bandwidth)  
**Resend:** $0 (Free tier - 3k emails/mês)  
**Sentry:** $0 (Free tier)  
**Domain:** ~$2/mês  

**Total MVP:** ~$7/mês 🎉

**Quando escalar (50+ usuários):**  
**Vercel Pro:** $20/mês  
**Supabase Pro:** $25/mês  
**Upstash:** $10/mês  
**AWS S3:** $20/mês  
**Resend:** $20/mês  

**Total (50 users):** ~$95/mês

---

_Stack moderno, produtivo e cost-effective para MVP com caminho claro para escala._
