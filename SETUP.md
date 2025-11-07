# Setup Guide - Ecosistema Union

## 🚀 Quick Start

### Pré-requisitos

- ✅ Docker Desktop instalado e **rodando**
- ✅ Node.js 20+ instalado
- ✅ Python 3.11+ instalado (opcional, apenas se rodar sem Docker)

### Primeira Vez (Setup Inicial)

```bash
# 1. Clonar repositório (se ainda não fez)
git clone <repo-url>
cd ecosistema-union

# 2. Copiar variáveis de ambiente
cp .env.example .env

# 3. Instalar dependências do frontend
cd frontend
npm install
cd ..

# 4. Subir containers Docker
docker-compose up -d

# 5. Aguardar containers iniciarem (30-60 segundos)
docker-compose logs -f

# 6. Acessar aplicação
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## 🐳 Comandos Docker

### Iniciar containers
```bash
docker-compose up -d
```

### Ver logs (todos os containers)
```bash
docker-compose logs -f
```

### Ver logs de um container específico
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Parar containers
```bash
docker-compose down
```

### Parar e remover volumes (⚠️ apaga dados do banco)
```bash
docker-compose down -v
```

### Rebuild containers (após mudanças no Dockerfile)
```bash
docker-compose up -d --build
```

### Ver status dos containers
```bash
docker-compose ps
```

### Entrar em um container
```bash
docker-compose exec backend bash
docker-compose exec frontend sh
docker-compose exec postgres psql -U ecosistema_user -d ecosistema_union
```

---

## 💻 Desenvolvimento Local (Sem Docker)

### Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
source venv/bin/activate  # Mac/Linux
# ou
venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Rodar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

# Instalar dependências (se ainda não fez)
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar produção
npm start
```

---

## 🗄️ Database

### Acessar PostgreSQL

```bash
# Via Docker
docker-compose exec postgres psql -U ecosistema_user -d ecosistema_union

# Ou via cliente local
psql -h localhost -p 5432 -U ecosistema_user -d ecosistema_union
# Senha: ecosistema_pass
```

### Comandos úteis PostgreSQL

```sql
-- Listar tabelas
\dt

-- Descrever tabela
\d users

-- Ver dados
SELECT * FROM users;

-- Sair
\q
```

### Migrations (Alembic)

```bash
# Criar nova migration
cd backend
alembic revision --autogenerate -m "descrição da mudança"

# Aplicar migrations
alembic upgrade head

# Reverter última migration
alembic downgrade -1

# Ver histórico
alembic history
```

---

## 🧪 Testes

### Backend

```bash
cd backend

# Rodar todos os testes
pytest

# Rodar com cobertura
pytest --cov=app tests/

# Rodar testes específicos
pytest tests/test_auth.py

# Rodar com verbose
pytest -v
```

### Frontend

```bash
cd frontend

# Rodar testes unitários
npm test

# Rodar testes E2E
npm run test:e2e

# Rodar com coverage
npm run test:coverage
```

---

## 🔍 Troubleshooting

### Docker não inicia

**Problema:** `Cannot connect to the Docker daemon`

**Solução:**
1. Abra o Docker Desktop
2. Aguarde até o ícone ficar verde
3. Tente novamente

---

### Porta já em uso

**Problema:** `port is already allocated`

**Solução:**
```bash
# Ver o que está usando a porta
lsof -i :3000
lsof -i :8000
lsof -i :5432

# Matar processo
kill -9 <PID>
```

---

### Frontend não conecta no backend

**Problema:** `Failed to fetch`

**Solução:**
1. Verificar se backend está rodando: http://localhost:8000/health
2. Verificar variável `NEXT_PUBLIC_API_URL` no `.env`
3. Verificar CORS no backend

---

### Erro de permissão no Docker

**Problema:** `permission denied`

**Solução (Mac/Linux):**
```bash
sudo chown -R $USER:$USER .
```

---

### Banco de dados não conecta

**Problema:** `connection refused`

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Ver logs do PostgreSQL
docker-compose logs postgres

# Reiniciar PostgreSQL
docker-compose restart postgres
```

---

### Dependências desatualizadas

**Backend:**
```bash
cd backend
pip install --upgrade -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm update
```

---

## 🔄 Reset Completo

Se algo der muito errado, reset completo:

```bash
# Parar tudo
docker-compose down -v

# Remover node_modules
rm -rf frontend/node_modules

# Remover venv
rm -rf backend/venv

# Reinstalar tudo
cd frontend && npm install && cd ..
cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && cd ..

# Subir novamente
docker-compose up -d --build
```

---

## 📊 Health Checks

### Verificar se tudo está funcionando

```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000/api/health

# PostgreSQL
docker-compose exec postgres pg_isready

# Redis
docker-compose exec redis redis-cli ping
```

---

## 🚀 Deploy

### Staging (Coolify)

```bash
git push origin develop
# Auto-deploy via Coolify
```

### Production (Coolify)

```bash
git push origin main
# Auto-deploy via Coolify
```

---

## 📝 Variáveis de Ambiente

### Desenvolvimento (.env)

```bash
# Copiar exemplo
cp .env.example .env

# Editar conforme necessário
nano .env
```

### Produção (Coolify)

Configurar no dashboard do Coolify:
- DATABASE_URL
- SECRET_KEY
- API_SECRET
- AWS credentials
- etc.

---

## 🆘 Precisa de Ajuda?

1. Verificar logs: `docker-compose logs -f`
2. Verificar este guia de troubleshooting
3. Consultar documentação: `docs/`
4. Contatar o time

---

**Desenvolvido com ❤️ pelo time Grupo Union**
