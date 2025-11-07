# 🚀 Deploy no Coolify - Grupo Union

## 📋 Pré-requisitos

- Conta no Coolify
- Repositório GitHub: https://github.com/gustavoml12/GrupoUnion.git
- Banco de dados PostgreSQL já configurado

## 🗄️ Configuração do Banco de Dados

**String de Conexão:**
```
postgres://postgres:Zt4uVc1eFQMsImx4SMp2qLUrqL4QYQ8bQkqDFUoz0XS7e1nk60NEnArXxLJAX38S@zkoowg8sww8s4sws4sgo4g0c:5432/postgres
```

---

## 🔧 Deploy do Backend (FastAPI)

### 1. Criar Novo Serviço no Coolify

1. Acesse seu Coolify
2. Clique em **"New Resource"** → **"Application"**
3. Selecione **"Public Repository"**
4. Cole a URL: `https://github.com/gustavoml12/GrupoUnion.git`
5. Branch: `main`
6. Build Pack: **Dockerfile**
7. **IMPORTANTE - Configure assim:**
   - **Dockerfile Location:** `Dockerfile` (SEM caminho, apenas o nome)
   - **Base Directory:** `backend`
   - **Watch Paths:** `backend/**`

### 2. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis de ambiente:

```bash
# Database
DATABASE_URL=postgresql://postgres:Zt4uVc1eFQMsImx4SMp2qLUrqL4QYQ8bQkqDFUoz0XS7e1nk60NEnArXxLJAX38S@zkoowg8sww8s4sws4sgo4g0c:5432/postgres

# Security (IMPORTANTE: Gere uma chave segura!)
SECRET_KEY=0pPHGD4JK0bYcr2UgYV12o7Om94Jlh9K
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application
APP_NAME=Grupo Union API
ENVIRONMENT=production
DEBUG=False

# CORS (Adicione o domínio do seu frontend)
ALLOWED_ORIGINS=https://union.ebnez.com.br

# File Upload
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=10485760
```

### 3. Configurar Porta

- **Port:** `8000`

### 4. Configurar Health Check (Opcional)

- **Health Check Path:** `/health`
- **Health Check Port:** `8000`

### 5. Deploy

1. Clique em **"Deploy"**
2. Aguarde o build e deploy
3. Anote a URL gerada (ex: `https://apiunion.ebnez.com.br`)

---

## 🎨 Deploy do Frontend (Next.js)

### 1. Criar Novo Serviço no Coolify

1. Clique em **"New Resource"** → **"Application"**
2. Selecione **"Public Repository"**
3. Cole a URL: `https://github.com/gustavoml12/GrupoUnion.git`
4. Branch: `main`
5. Build Pack: **Dockerfile**
6. Dockerfile Location: `frontend/Dockerfile`
7. Base Directory: `frontend`

### 2. Configurar Variáveis de Ambiente

```bash
# API Configuration (Use a URL do backend que você anotou)
NEXT_PUBLIC_API_URL=https://backend-xxx.coolify.app
NEXT_PUBLIC_APP_URL=https://frontend-xxx.coolify.app
```

### 3. Configurar Porta

- **Port:** `3000`

### 4. Deploy

1. Clique em **"Deploy"**
2. Aguarde o build e deploy
3. Acesse a URL gerada

---

## 🔐 Pós-Deploy - Criar Usuário Hub

Após o deploy do backend, você precisa criar o usuário Hub:

### Opção 1: Via Terminal do Container

1. No Coolify, acesse o terminal do container do backend
2. Execute:

```bash
python -c "
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

db = SessionLocal()
hub_user = User(
    email='hub@union.com',
    hashed_password=get_password_hash('hub123'),
    full_name='Hub Union',
    role='HUB',
    status='ACTIVE'
)
db.add(hub_user)
db.commit()
print('✅ Usuário Hub criado!')
"
```

### Opção 2: Via Script SQL

Execute no banco de dados:

```sql
INSERT INTO users (id, email, hashed_password, full_name, role, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'hub@union.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYfQPz.B4qa', -- senha: hub123
    'Hub Union',
    'HUB',
    'ACTIVE',
    NOW(),
    NOW()
);
```

---

## ✅ Verificação

### Backend

1. Acesse: `https://backend-xxx.coolify.app/docs`
2. Você deve ver a documentação Swagger da API

### Frontend

1. Acesse: `https://frontend-xxx.coolify.app`
2. Faça login com:
   - Email: `hub@union.com`
   - Senha: `hub123`

---

## 🔄 Atualizações

Para atualizar a aplicação:

1. Faça commit e push das alterações no GitHub
2. No Coolify, clique em **"Redeploy"** no serviço
3. Aguarde o novo build e deploy

---

## 📝 Notas Importantes

### Segurança

1. **MUDE o SECRET_KEY** para uma chave forte e única
2. **MUDE a senha do Hub** após o primeiro login
3. Configure **HTTPS** para ambos os serviços
4. Adicione os domínios corretos em **ALLOWED_ORIGINS**

### Volumes Persistentes

Se quiser persistir os uploads de arquivos:

1. No Coolify, vá em **"Storage"**
2. Adicione um volume:
   - Source: `/app/uploads`
   - Destination: `/app/uploads`

### Logs

Para ver os logs:
- No Coolify, clique em **"Logs"** no serviço

### Migrations

As migrations são executadas automaticamente no start do container.
Se precisar executar manualmente:

```bash
alembic upgrade head
```

---

## 🆘 Troubleshooting

### Backend não inicia

1. Verifique os logs
2. Confirme que a `DATABASE_URL` está correta
3. Verifique se o banco está acessível

### Frontend não conecta ao Backend

1. Verifique se `NEXT_PUBLIC_API_URL` está correto
2. Verifique CORS no backend
3. Confirme que o backend está rodando

### Erro de CORS

Adicione o domínio do frontend em `ALLOWED_ORIGINS` no backend:

```bash
ALLOWED_ORIGINS=https://frontend-xxx.coolify.app,https://seu-dominio.com
```

---

## 📞 Suporte

Para mais informações, consulte:
- [Documentação do Coolify](https://coolify.io/docs)
- [Repositório do Projeto](https://github.com/gustavoml12/GrupoUnion)
