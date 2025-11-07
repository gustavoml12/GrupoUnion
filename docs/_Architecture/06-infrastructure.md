# Infrastructure & Deployment

## Arquitetura Coolify + Docker

### Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                      COOLIFY SERVER                          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Docker Network (app-network)               │ │
│  │                                                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │  Frontend    │  │   Backend    │  │  PostgreSQL  │ │ │
│  │  │  (Next.js)   │  │  (FastAPI)   │  │      15      │ │ │
│  │  │  Node 20     │  │  Python 3.11 │  │              │ │ │
│  │  │  Port: 3000  │  │  Port: 8000  │  │  Port: 5432  │ │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │ │
│  │         │                  │                  │         │ │
│  │         └──────────────────┼──────────────────┘         │ │
│  │                            │                            │ │
│  │                    ┌───────┴────────┐                  │ │
│  │                    │     Redis      │                  │ │
│  │                    │       7        │                  │ │
│  │                    │  Port: 6379    │                  │ │
│  │                    └────────────────┘                  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Nginx Reverse Proxy                    │ │
│  │          (Gerenciado automaticamente pelo Coolify)      │ │
│  │                                                          │ │
│  │  app.ecosistema-union.com → Frontend (3000)            │ │
│  │  api.ecosistema-union.com → Backend (8000)             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (Let's Encrypt)
                              ↓
                        ┌──────────┐
                        │ Internet │
                        └──────────┘
```

---

## Docker Compose Configuration

### docker-compose.yml

```yaml
version: '3.8'

services:
  # ============================================
  # FRONTEND - Next.js
  # ============================================
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: ecosistema-frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.ecosistema-union.com
      - NEXT_PUBLIC_APP_URL=https://app.ecosistema-union.com
    networks:
      - app-network
    restart: unless-stopped
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # ============================================
  # BACKEND - FastAPI
  # ============================================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ecosistema-backend
    ports:
      - "8000:8000"
    environment:
      # Database
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      
      # Redis
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
      
      # Security
      - SECRET_KEY=${SECRET_KEY}
      - API_SECRET=${API_SECRET}
      - ALGORITHM=HS256
      - ACCESS_TOKEN_EXPIRE_MINUTES=15
      - REFRESH_TOKEN_EXPIRE_DAYS=7
      
      # AWS S3
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_REGION=${AWS_REGION}
      - S3_BUCKET_NAME=${S3_BUCKET_NAME}
      
      # Email
      - RESEND_API_KEY=${RESEND_API_KEY}
      - EMAIL_FROM=${EMAIL_FROM}
      
      # App
      - APP_NAME=Ecosistema Union
      - FRONTEND_URL=https://app.ecosistema-union.com
      - ENVIRONMENT=production
      
      # CORS
      - CORS_ORIGINS=https://app.ecosistema-union.com,https://ecosistema-union.com
    networks:
      - app-network
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '1.5'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M

  # ============================================
  # DATABASE - PostgreSQL
  # ============================================
  postgres:
    image: postgres:15-alpine
    container_name: ecosistema-postgres
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_INITDB_ARGS=--encoding=UTF-8 --lc-collate=pt_BR.UTF-8 --lc-ctype=pt_BR.UTF-8
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backend/scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.25'
          memory: 256M
    # Não expor porta publicamente (apenas rede interna)
    # ports:
    #   - "5432:5432"  # Comentado por segurança

  # ============================================
  # CACHE - Redis
  # ============================================
  redis:
    image: redis:7-alpine
    container_name: ecosistema-redis
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis-data:/data
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.1'
          memory: 128M

# ============================================
# NETWORKS
# ============================================
networks:
  app-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

# ============================================
# VOLUMES
# ============================================
volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local
```

---

## Dockerfiles

### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copiar package files
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm ci --only=production

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependências do stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fonte
COPY . .

# Build args
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1

# Build
RUN npm run build

# ============================================
# Stage 3: Runner
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Trocar para usuário não-root
USER nextjs

# Expor porta
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start
CMD ["node", "server.js"]
```

### Backend Dockerfile

```dockerfile
# backend/Dockerfile

# ============================================
# Stage 1: Builder
# ============================================
FROM python:3.11-slim AS builder

WORKDIR /app

# Instalar dependências de build
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir --user -r requirements.txt

# ============================================
# Stage 2: Runner
# ============================================
FROM python:3.11-slim

WORKDIR /app

# Instalar apenas runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Criar usuário não-root
RUN useradd -m -u 1000 appuser

# Copiar dependências do builder
COPY --from=builder /root/.local /home/appuser/.local

# Copiar código
COPY --chown=appuser:appuser . .

# Adicionar .local/bin ao PATH
ENV PATH=/home/appuser/.local/bin:$PATH

# Trocar para usuário não-root
USER appuser

# Expor porta
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start com Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

---

## Environment Variables (.env)

```bash
# .env (para Coolify)

# ============================================
# DATABASE
# ============================================
DB_USER=ecosistema_user
DB_PASSWORD=<STRONG_PASSWORD_HERE>
DB_NAME=ecosistema_union

# ============================================
# REDIS
# ============================================
REDIS_PASSWORD=<STRONG_PASSWORD_HERE>

# ============================================
# SECURITY
# ============================================
SECRET_KEY=<256_BIT_RANDOM_KEY>
API_SECRET=<256_BIT_RANDOM_KEY>

# ============================================
# AWS S3
# ============================================
AWS_ACCESS_KEY_ID=<YOUR_AWS_KEY>
AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET>
AWS_REGION=us-east-1
S3_BUCKET_NAME=ecosistema-union-files

# ============================================
# EMAIL (Resend)
# ============================================
RESEND_API_KEY=<YOUR_RESEND_KEY>
EMAIL_FROM=noreply@ecosistema-union.com

# ============================================
# FRONTEND
# ============================================
NEXT_PUBLIC_API_URL=https://api.ecosistema-union.com
NEXT_PUBLIC_APP_URL=https://app.ecosistema-union.com
```

---

## Coolify Configuration

### 1. Criar Projeto no Coolify

1. Acesse Coolify dashboard
2. Criar novo projeto: "Ecosistema Union"
3. Conectar repositório Git (GitHub/GitLab)
4. Selecionar branch: `main`

### 2. Configurar Environments

**Production:**
- Branch: `main`
- Auto-deploy: ✅ Enabled
- Domain: `app.ecosistema-union.com`
- SSL: ✅ Let's Encrypt

**Staging (opcional):**
- Branch: `develop`
- Auto-deploy: ✅ Enabled
- Domain: `staging.ecosistema-union.com`
- SSL: ✅ Let's Encrypt

### 3. Configurar Variáveis de Ambiente

No Coolify, adicionar todas as variáveis do `.env`:

```
DB_USER=ecosistema_user
DB_PASSWORD=***
DB_NAME=ecosistema_union
REDIS_PASSWORD=***
SECRET_KEY=***
API_SECRET=***
...
```

### 4. Deploy

```bash
# Coolify faz deploy automático ao push
git push origin main

# Ou deploy manual via Coolify UI
```

---

## Backup Strategy

### Database Backup (Automated)

```bash
# backup.sh
#!/bin/bash

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql.gz"

# Criar backup
docker exec ecosistema-postgres pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE

# Manter apenas últimos 30 dias
find $BACKUP_DIR -type f -mtime +30 -delete

# Upload para S3 (opcional)
aws s3 cp $BACKUP_FILE s3://ecosistema-union-backups/postgres/
```

**Cron Job (diário às 3am):**
```bash
0 3 * * * /path/to/backup.sh
```

### Restore Backup

```bash
# Restore do backup mais recente
gunzip < backup_20250105_030000.sql.gz | docker exec -i ecosistema-postgres psql -U $DB_USER $DB_NAME
```

---

## Monitoring & Logs

### Logs Centralizados

```bash
# Ver logs de todos os containers
docker-compose logs -f

# Ver logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Últimas 100 linhas
docker-compose logs --tail=100 backend
```

### Monitoring (Coolify Built-in)

Coolify fornece:
- ✅ CPU usage
- ✅ Memory usage
- ✅ Disk usage
- ✅ Network traffic
- ✅ Container status
- ✅ Logs em tempo real

### External Monitoring (Opcional)

**Sentry (Errors):**
```python
# backend/app/main.py
import sentry_sdk

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    environment=os.getenv("ENVIRONMENT"),
    traces_sample_rate=0.1,
)
```

**Uptime Monitoring:**
- UptimeRobot (free)
- Pingdom
- StatusCake

---

## Scaling Strategy

### Vertical Scaling (Aumentar recursos)

```yaml
# docker-compose.yml
backend:
  deploy:
    resources:
      limits:
        cpus: '2'      # Aumentar de 1.5 para 2
        memory: 4G     # Aumentar de 2G para 4G
```

### Horizontal Scaling (Múltiplas instâncias)

```yaml
# docker-compose.yml
backend:
  deploy:
    replicas: 3  # 3 instâncias do backend
```

**Load Balancer (Nginx):**
```nginx
upstream backend {
    server backend-1:8000;
    server backend-2:8000;
    server backend-3:8000;
}
```

### Database Scaling

**Read Replicas:**
```yaml
postgres-replica:
  image: postgres:15-alpine
  environment:
    - POSTGRES_PRIMARY_HOST=postgres
    - POSTGRES_PRIMARY_PORT=5432
```

**Connection Pooling (PgBouncer):**
```yaml
pgbouncer:
  image: pgbouncer/pgbouncer
  environment:
    - DATABASES_HOST=postgres
    - DATABASES_PORT=5432
    - POOL_MODE=transaction
    - MAX_CLIENT_CONN=100
```

---

## Cost Estimate (Coolify Self-Hosted)

**VPS (Hetzner/DigitalOcean):**
- 4 vCPU, 8GB RAM, 160GB SSD: ~€20-40/mês

**AWS S3:**
- 10GB storage + bandwidth: ~$5/mês

**Domain + SSL:**
- Domain: ~$15/ano
- SSL: Grátis (Let's Encrypt)

**Email (Resend):**
- Free tier: 3k emails/mês
- Paid: $20/mês (50k emails)

**Total MVP:** ~€30-50/mês (~R$ 150-250/mês)

**Total (100 users):** ~€50-80/mês (~R$ 250-400/mês)

---

_Infraestrutura robusta, escalável e cost-effective com Coolify + Docker._
