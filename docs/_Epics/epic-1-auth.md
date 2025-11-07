# Epic 1: Autenticação e Usuários

**Prioridade:** 🔴 Critical  
**Pontos:** 34  
**Sprints:** 2-3 (2 sprints)  
**Status:** 📋 Backlog

---

## Objetivo

Implementar sistema de autenticação seguro com JWT, proteção de rotas e gestão de usuários.

**Valor de Negócio:** Segurança - base para todo acesso à plataforma.

---

## User Stories

### Story 1.1: Modelo de Dados User
**Como** desenvolvedor  
**Quero** modelo User no banco  
**Para que** possamos armazenar usuários

**Critérios de Aceitação:**
- [ ] Modelo SQLAlchemy criado
- [ ] Campos: id, email, password_hash, role, status
- [ ] Enums: UserRole, UserStatus
- [ ] Migration criada
- [ ] Testes unitários

**Pontos:** 3 | **Prioridade:** P0

---

### Story 1.2: API - Registro de Usuário
**Como** visitante  
**Quero** criar uma conta  
**Para que** eu possa acessar a plataforma

**Critérios de Aceitação:**
- [ ] Endpoint POST `/api/v1/auth/register`
- [ ] Validação: email único
- [ ] Validação: senha forte (8+ chars, maiúscula, número, especial)
- [ ] Password hashing (bcrypt, 12 rounds)
- [ ] Retorna access + refresh tokens
- [ ] Audit log
- [ ] Testes de API

**Pontos:** 3 | **Prioridade:** P0

---

### Story 1.3: API - Login
**Como** usuário  
**Quero** fazer login  
**Para que** eu possa acessar minha conta

**Critérios de Aceitação:**
- [ ] Endpoint POST `/api/v1/auth/login`
- [ ] Validação: email + senha
- [ ] Retorna access + refresh tokens
- [ ] Refresh token salvo no DB
- [ ] Rate limiting (5 tentativas/min)
- [ ] Audit log (sucesso e falha)
- [ ] Testes de API

**Pontos:** 3 | **Prioridade:** P0

---

### Story 1.4: JWT Access + Refresh Tokens
**Como** desenvolvedor  
**Quero** sistema de tokens seguro  
**Para que** sessões sejam gerenciadas corretamente

**Critérios de Aceitação:**
- [ ] Access token: 15 min de validade
- [ ] Refresh token: 7 dias de validade
- [ ] Refresh token armazenado no DB
- [ ] Endpoint POST `/api/v1/auth/refresh`
- [ ] Token ID único (JTI) para revogação
- [ ] Testes de tokens

**Pontos:** 5 | **Prioridade:** P0

---

### Story 1.5: Middleware de Autenticação
**Como** desenvolvedor  
**Quero** middleware de autenticação  
**Para que** rotas sejam protegidas automaticamente

**Critérios de Aceitação:**
- [ ] Middleware `get_current_user` criado
- [ ] Valida JWT do header Authorization
- [ ] Retorna usuário autenticado
- [ ] Erro 401 se token inválido/expirado
- [ ] Testes do middleware

**Pontos:** 3 | **Prioridade:** P0

---

### Story 1.6: API - Logout
**Como** usuário  
**Quero** fazer logout  
**Para que** minha sessão seja encerrada

**Critérios de Aceitação:**
- [ ] Endpoint POST `/api/v1/auth/logout`
- [ ] Revoga refresh token no DB
- [ ] Adiciona access token à blacklist (Redis)
- [ ] Audit log
- [ ] Testes de API

**Pontos:** 2 | **Prioridade:** P0

---

### Story 1.7: API - Recuperação de Senha
**Como** usuário  
**Quero** recuperar minha senha  
**Para que** eu possa acessar se esquecer

**Critérios de Aceitação:**
- [ ] Endpoint POST `/api/v1/auth/forgot-password`
- [ ] Gera token de reset (válido por 1h)
- [ ] Envia email com link de reset
- [ ] Endpoint POST `/api/v1/auth/reset-password`
- [ ] Valida token de reset
- [ ] Atualiza senha
- [ ] Testes de API

**Pontos:** 3 | **Prioridade:** P1

---

### Story 1.8: Frontend - Página de Login
**Como** usuário  
**Quero** página de login  
**Para que** eu possa acessar a plataforma

**Critérios de Aceitação:**
- [ ] Página `/login` criada
- [ ] Campos: email, senha
- [ ] Validação client-side
- [ ] Loading state
- [ ] Error handling
- [ ] Link para "Esqueci minha senha"
- [ ] Link para "Criar conta"
- [ ] Redirect após login
- [ ] Responsivo

**Pontos:** 3 | **Prioridade:** P0

---

### Story 1.9: Frontend - Página de Registro
**Como** visitante  
**Quero** página de registro  
**Para que** eu possa criar uma conta

**Critérios de Aceitação:**
- [ ] Página `/register` criada
- [ ] Campos: nome, email, senha, confirmar senha
- [ ] Validação client-side (senha forte)
- [ ] Loading state
- [ ] Error handling
- [ ] Success message
- [ ] Redirect após registro
- [ ] Responsivo

**Pontos:** 3 | **Prioridade:** P0

---

### Story 1.10: Proteção de Rotas (RBAC)
**Como** desenvolvedor  
**Quero** proteção de rotas por role  
**Para que** apenas usuários autorizados acessem

**Critérios de Aceitação:**
- [ ] Middleware `require_role` criado
- [ ] Roles: MEMBER, HUB, ADMIN
- [ ] Decorador `@require_role("HUB")`
- [ ] Erro 403 se role insuficiente
- [ ] Testes de permissões

**Pontos:** 2 | **Prioridade:** P0

---

### Story 1.11: Rate Limiting de Login
**Como** sistema  
**Quero** rate limiting no login  
**Para que** brute force seja prevenido

**Critérios de Aceitação:**
- [ ] Limite: 5 tentativas/min por IP
- [ ] Limite: 10 tentativas/hora por email
- [ ] Bloqueio temporário após limite
- [ ] Mensagem clara de erro
- [ ] Testes de rate limiting

**Pontos:** 2 | **Prioridade:** P0

---

### Story 1.12: Audit Log de Autenticação
**Como** Hub  
**Quero** logs de autenticação  
**Para que** eu possa monitorar acessos

**Critérios de Aceitação:**
- [ ] Modelo AuditLog criado
- [ ] Log de: login, logout, registro, reset senha
- [ ] Campos: user_id, action, ip, user_agent, success
- [ ] Detecção de IP suspeito (novo IP)
- [ ] Alerta de múltiplas falhas
- [ ] Testes de audit log

**Pontos:** 2 | **Prioridade:** P1

---

## Definition of Done

- [ ] Todas as 12 stories concluídas
- [ ] Sistema de autenticação funcionando
- [ ] Testes de segurança passando
- [ ] Rate limiting ativo
- [ ] Audit logs registrando
- [ ] Documentação de API (Swagger)

---

_Epic crítico - segurança é prioridade máxima._
