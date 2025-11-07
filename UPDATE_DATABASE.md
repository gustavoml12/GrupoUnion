# Atualizar Banco de Dados - Adicionar Role VISITOR

## O que mudou?

Adicionamos o role **VISITOR** para usuários que se registram mas ainda não foram aprovados como membros.

### Hierarquia de Roles:
- **VISITOR** - Visitante (cadastro público, aguardando aprovação)
- **MEMBER** - Membro (aprovado pelo Hub)
- **HUB** - Gestor do grupo
- **ADMIN** - Administrador do sistema

## Como atualizar o banco de dados

### Opção 1: Recriar o banco (DESENVOLVIMENTO)

```bash
# Entrar no container do backend
docker-compose exec backend bash

# Dropar e recriar o banco
docker-compose down
docker-compose up -d postgres
docker-compose exec postgres psql -U ecosistema_user -d ecosistema_union -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Subir backend novamente
docker-compose up -d backend

# Rodar migrations
docker-compose exec backend alembic upgrade head
```

### Opção 2: Migration manual (PRODUÇÃO)

```bash
# Entrar no PostgreSQL
docker-compose exec postgres psql -U ecosistema_user -d ecosistema_union

# Adicionar o novo valor ao ENUM
ALTER TYPE userrole ADD VALUE 'VISITOR' BEFORE 'MEMBER';

# Sair
\q
```

### Opção 3: Nova Migration (RECOMENDADO)

```bash
# Entrar no container do backend
docker-compose exec backend bash

# Criar nova migration
alembic revision -m "add visitor role"

# Editar o arquivo gerado em alembic/versions/
# Adicionar:
# def upgrade():
#     op.execute("ALTER TYPE userrole ADD VALUE 'VISITOR' BEFORE 'MEMBER'")
#
# def downgrade():
#     # Não é possível remover valores de ENUM no PostgreSQL
#     pass

# Aplicar migration
alembic upgrade head
```

## Verificar

```bash
# Ver os roles disponíveis
docker-compose exec postgres psql -U ecosistema_user -d ecosistema_union -c "SELECT unnest(enum_range(NULL::userrole));"
```

Deve mostrar:
```
VISITOR
MEMBER
HUB
ADMIN
```

## Fluxo Atualizado

1. **Usuário se registra** → Role: VISITOR, Status: PENDING
2. **Hub aprova** → Role: MEMBER, Status: ACTIVE
3. **Membro acessa funcionalidades completas**
