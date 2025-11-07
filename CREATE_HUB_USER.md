# Criar Usuário HUB para Teste

## Opção 1: Via SQL Direto

```bash
docker-compose exec postgres psql -U ecosistema_user -d ecosistema_union
```

Depois execute:

```sql
-- Inserir usuário HUB
INSERT INTO users (
  id, 
  email, 
  password_hash, 
  role, 
  status, 
  full_name, 
  phone, 
  email_verified, 
  created_at, 
  updated_at
) VALUES (
  gen_random_uuid()::text,
  'hub@union.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYfQTZ9QKd2', -- senha: hub123
  'HUB',
  'ACTIVE',
  'Hub Manager',
  '(11) 98888-8888',
  true,
  NOW(),
  NOW()
);
```

## Opção 2: Promover Usuário Existente

Se você já tem um usuário cadastrado e quer promovê-lo a HUB:

```sql
-- Ver usuários
SELECT id, email, role, status FROM users;

-- Promover usuário específico
UPDATE users 
SET role = 'HUB', status = 'ACTIVE' 
WHERE email = 'seu-email@aqui.com';
```

## Credenciais do Usuário HUB

**Email:** hub@union.com  
**Senha:** hub123

## Como Testar

1. **Faça login com o usuário HUB:**
   - Acesse: http://localhost:3000/login
   - Email: hub@union.com
   - Senha: hub123

2. **No Dashboard, clique em "👥 Gerenciar Membros"**

3. **Crie um visitante para testar:**
   - Abra uma aba anônima
   - Acesse: http://localhost:3000/register
   - Crie uma conta normal

4. **Volte para o Hub e aprove o visitante:**
   - Você verá o visitante na lista
   - Clique em "✓ Aprovar"
   - O visitante será promovido a MEMBER

## Verificar Roles no Banco

```sql
-- Ver todos os usuários e seus roles
SELECT 
  email, 
  role, 
  status, 
  full_name,
  created_at
FROM users
ORDER BY created_at DESC;
```
