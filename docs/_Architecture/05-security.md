# Security & Authentication

## Visão Geral de Segurança

Arquitetura de segurança em camadas para proteger contra:
- ✅ Interceptação de APIs (Man-in-the-Middle)
- ✅ Ataques de força bruta
- ✅ SQL Injection
- ✅ XSS (Cross-Site Scripting)
- ✅ CSRF (Cross-Site Request Forgery)
- ✅ Vazamento de dados sensíveis
- ✅ Acesso não autorizado

---

## 1. HTTPS & TLS

### Configuração Obrigatória

**Coolify + Let's Encrypt:**
```yaml
# Coolify configuração
ssl:
  enabled: true
  provider: letsencrypt
  force_https: true  # Redirecionar HTTP → HTTPS
```

**HSTS (HTTP Strict Transport Security):**
```python
# FastAPI middleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

app.add_middleware(HTTPSRedirectMiddleware)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["ecosistema-union.com", "*.ecosistema-union.com"]
)

# Headers de segurança
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response
```

**Por quê?**
- ✅ Criptografia end-to-end
- ✅ Previne interceptação de dados
- ✅ Certificado SSL gratuito
- ✅ Renovação automática

---

## 2. Autenticação JWT Segura

### Estratégia de Tokens

**Access Token (Short-lived):**
```python
# 15 minutos de validade
ACCESS_TOKEN_EXPIRE_MINUTES = 15

# Payload mínimo (menos dados = mais seguro)
{
    "sub": "user_id",
    "role": "member",
    "exp": 1699999999,
    "iat": 1699999000,
    "jti": "unique_token_id"  # Para revogação
}
```

**Refresh Token (Long-lived):**
```python
# 7 dias de validade
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Armazenado no banco de dados
class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    token = Column(String, unique=True, index=True)
    expires_at = Column(DateTime)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
```

### Implementação Segura

```python
# auth.py
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import secrets

# Configurações
SECRET_KEY = os.getenv("SECRET_KEY")  # 256-bit random key
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "jti": secrets.token_urlsafe(32)  # Token ID único
    })
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(user_id: str, db: Session) -> str:
    # Token aleatório seguro
    token = secrets.token_urlsafe(64)
    
    # Salvar no banco
    refresh_token = RefreshToken(
        id=secrets.token_urlsafe(16),
        user_id=user_id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(refresh_token)
    db.commit()
    
    return token

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

**Por quê?**
- ✅ Access token curto (minimiza janela de ataque)
- ✅ Refresh token no DB (pode ser revogado)
- ✅ JTI permite blacklist de tokens
- ✅ Bcrypt com 12 rounds (lento = seguro contra brute force)

---

## 3. Proteção Contra Interceptação de API

### 3.1 Request Signing (HMAC)

**Para chamadas críticas (ex: pagamentos, alterações sensíveis):**

```python
# Middleware de assinatura de requisições
import hmac
import hashlib
from fastapi import Request, HTTPException

API_SECRET = os.getenv("API_SECRET")  # Compartilhado com frontend

async def verify_request_signature(request: Request):
    # Pegar signature do header
    signature = request.headers.get("X-Signature")
    timestamp = request.headers.get("X-Timestamp")
    
    if not signature or not timestamp:
        raise HTTPException(status_code=401, detail="Assinatura ausente")
    
    # Verificar timestamp (previne replay attacks)
    request_time = datetime.fromtimestamp(int(timestamp))
    if datetime.utcnow() - request_time > timedelta(minutes=5):
        raise HTTPException(status_code=401, detail="Requisição expirada")
    
    # Reconstruir payload
    body = await request.body()
    payload = f"{request.method}:{request.url.path}:{timestamp}:{body.decode()}"
    
    # Calcular HMAC
    expected_signature = hmac.new(
        API_SECRET.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    # Comparação segura (previne timing attacks)
    if not hmac.compare_digest(signature, expected_signature):
        raise HTTPException(status_code=401, detail="Assinatura inválida")

# Aplicar em rotas críticas
@app.post("/api/v1/payments")
async def create_payment(request: Request):
    await verify_request_signature(request)
    # ... processar pagamento
```

**Frontend (Next.js):**
```typescript
// lib/api-client.ts
import crypto from 'crypto';

async function signedRequest(
  method: string,
  path: string,
  body?: any
): Promise<Response> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyString = body ? JSON.stringify(body) : '';
  const payload = `${method}:${path}:${timestamp}:${bodyString}`;
  
  const signature = crypto
    .createHmac('sha256', process.env.API_SECRET!)
    .update(payload)
    .digest('hex');
  
  return fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': signature,
      'X-Timestamp': timestamp,
      'Authorization': `Bearer ${accessToken}`
    },
    body: bodyString || undefined
  });
}
```

### 3.2 Rate Limiting

**Proteção contra brute force e DDoS:**

```python
# rate_limiter.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Aplicar limites
@app.post("/api/v1/auth/login")
@limiter.limit("5/minute")  # 5 tentativas por minuto
async def login(request: Request, credentials: LoginSchema):
    # ... lógica de login

@app.post("/api/v1/referrals")
@limiter.limit("30/minute")  # 30 indicações por minuto
async def create_referral(request: Request):
    # ... criar indicação

@app.get("/api/v1/members")
@limiter.limit("100/minute")  # 100 consultas por minuto
async def list_members(request: Request):
    # ... listar membros
```

**Rate Limiting por Usuário (Redis):**
```python
# rate_limiter_user.py
import redis
from datetime import timedelta

redis_client = redis.Redis(host='redis', port=6379, db=0)

def check_user_rate_limit(user_id: str, action: str, limit: int, window: int):
    """
    user_id: ID do usuário
    action: tipo de ação (ex: 'create_referral')
    limit: número máximo de ações
    window: janela de tempo em segundos
    """
    key = f"rate_limit:{user_id}:{action}"
    current = redis_client.get(key)
    
    if current is None:
        redis_client.setex(key, window, 1)
        return True
    
    if int(current) >= limit:
        raise HTTPException(
            status_code=429,
            detail=f"Limite de {limit} {action} por {window}s excedido"
        )
    
    redis_client.incr(key)
    return True

# Uso
@app.post("/api/v1/referrals")
async def create_referral(
    referral: ReferralCreate,
    current_user: User = Depends(get_current_user)
):
    # Máximo 10 indicações por hora
    check_user_rate_limit(current_user.id, "create_referral", 10, 3600)
    # ... criar indicação
```

### 3.3 CORS Configurado

```python
# CORS restritivo
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ecosistema-union.com",
        "https://app.ecosistema-union.com",
        # Apenas domínios específicos, NUNCA "*"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
    max_age=3600,  # Cache preflight por 1 hora
)
```

### 3.4 Input Validation (Pydantic)

```python
# schemas.py
from pydantic import BaseModel, EmailStr, Field, validator
import re

class UserCreate(BaseModel):
    email: EmailStr  # Validação automática de email
    password: str = Field(..., min_length=8, max_length=100)
    full_name: str = Field(..., min_length=3, max_length=100)
    phone: str = Field(..., regex=r'^\(\d{2}\) \d{4,5}-\d{4}$')
    
    @validator('password')
    def password_strength(cls, v):
        if not re.search(r'[A-Z]', v):
            raise ValueError('Senha deve ter pelo menos 1 maiúscula')
        if not re.search(r'[a-z]', v):
            raise ValueError('Senha deve ter pelo menos 1 minúscula')
        if not re.search(r'\d', v):
            raise ValueError('Senha deve ter pelo menos 1 número')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Senha deve ter pelo menos 1 caractere especial')
        return v
    
    @validator('full_name')
    def sanitize_name(cls, v):
        # Remove caracteres perigosos
        return re.sub(r'[<>\"\'&]', '', v)

class ReferralCreate(BaseModel):
    to_member_id: str = Field(..., regex=r'^[a-zA-Z0-9_-]+$')
    client_name: str = Field(..., min_length=3, max_length=100)
    client_phone: str = Field(..., regex=r'^\(\d{2}\) \d{4,5}-\d{4}$')
    client_email: EmailStr | None = None
    context: str = Field(..., min_length=10, max_length=1000)
    qualification: str = Field(..., regex=r'^(HOT|WARM|COLD)$')
```

**Por quê?**
- ✅ Previne SQL Injection (dados validados antes do DB)
- ✅ Previne XSS (sanitização de inputs)
- ✅ Validação de tipos automática
- ✅ Mensagens de erro claras

---

## 4. Proteção do Banco de Dados

### 4.1 SQL Injection Prevention

**SQLAlchemy ORM (sempre usar):**
```python
# ✅ SEGURO (parametrizado)
user = db.query(User).filter(User.email == email).first()

# ✅ SEGURO (com bindparams)
stmt = select(User).where(User.email == bindparam('email'))
result = db.execute(stmt, {'email': email})

# ❌ NUNCA FAZER (SQL injection vulnerability)
# query = f"SELECT * FROM users WHERE email = '{email}'"
# db.execute(query)
```

### 4.2 Database Credentials

```python
# .env (NUNCA commitar)
DATABASE_URL=postgresql://user:password@postgres:5432/ecosistema_union
SECRET_KEY=your-super-secret-key-256-bits
API_SECRET=your-api-secret-key

# Usar variáveis de ambiente
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    api_secret: str
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### 4.3 Connection Pooling

```python
# database.py
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    settings.database_url,
    poolclass=QueuePool,
    pool_size=10,  # Conexões simultâneas
    max_overflow=20,  # Conexões extras em pico
    pool_pre_ping=True,  # Verifica conexão antes de usar
    pool_recycle=3600,  # Recicla conexões a cada hora
)
```

---

## 5. Logging & Monitoring

### 5.1 Audit Logging

```python
# audit_log.py
class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    action = Column(String)  # "login", "create_referral", etc
    resource_type = Column(String)  # "user", "referral", etc
    resource_id = Column(String)
    ip_address = Column(String)
    user_agent = Column(String)
    success = Column(Boolean)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

def log_action(
    db: Session,
    user_id: str,
    action: str,
    resource_type: str,
    resource_id: str,
    request: Request,
    success: bool = True,
    error: str = None
):
    log = AuditLog(
        id=secrets.token_urlsafe(16),
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent"),
        success=success,
        error_message=error
    )
    db.add(log)
    db.commit()

# Uso
@app.post("/api/v1/referrals")
async def create_referral(
    referral: ReferralCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        new_referral = create_referral_service(db, referral, current_user.id)
        log_action(db, current_user.id, "create_referral", "referral", new_referral.id, request)
        return new_referral
    except Exception as e:
        log_action(db, current_user.id, "create_referral", "referral", None, request, False, str(e))
        raise
```

### 5.2 Security Monitoring

```python
# Detectar atividades suspeitas
def detect_suspicious_activity(user_id: str, action: str, db: Session):
    # Múltiplas tentativas de login falhadas
    if action == "login_failed":
        recent_failures = db.query(AuditLog).filter(
            AuditLog.user_id == user_id,
            AuditLog.action == "login_failed",
            AuditLog.created_at > datetime.utcnow() - timedelta(minutes=15),
            AuditLog.success == False
        ).count()
        
        if recent_failures >= 5:
            # Bloquear conta temporariamente
            user = db.query(User).filter(User.id == user_id).first()
            user.status = "SUSPENDED"
            db.commit()
            
            # Enviar alerta
            send_security_alert(user.email, "Conta bloqueada por múltiplas tentativas de login")
    
    # Acesso de IP diferente
    if action == "login":
        last_login = db.query(AuditLog).filter(
            AuditLog.user_id == user_id,
            AuditLog.action == "login",
            AuditLog.success == True
        ).order_by(AuditLog.created_at.desc()).offset(1).first()
        
        if last_login and last_login.ip_address != request.client.host:
            # Enviar alerta de novo IP
            send_security_alert(user.email, f"Login detectado de novo IP: {request.client.host}")
```

---

## 6. Secrets Management

### 6.1 Environment Variables

```bash
# .env (local development)
DATABASE_URL=postgresql://user:pass@localhost:5432/db
SECRET_KEY=dev-secret-key-change-in-production
API_SECRET=dev-api-secret
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# .env.production (Coolify)
DATABASE_URL=postgresql://user:strong-pass@postgres:5432/ecosistema_union
SECRET_KEY=<256-bit-random-key>
API_SECRET=<256-bit-random-key>
AWS_ACCESS_KEY_ID=<production-key>
AWS_SECRET_ACCESS_KEY=<production-secret>
```

### 6.2 Gerar Secrets Seguros

```python
# generate_secrets.py
import secrets

def generate_secret_key(length: int = 64) -> str:
    """Gera chave secreta segura"""
    return secrets.token_urlsafe(length)

# Executar uma vez
print("SECRET_KEY:", generate_secret_key())
print("API_SECRET:", generate_secret_key())
```

---

## 7. Docker Security

### 7.1 Dockerfile Seguro (Backend)

```dockerfile
# Usar imagem oficial e específica
FROM python:3.11-slim

# Não rodar como root
RUN useradd -m -u 1000 appuser

# Instalar dependências
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY --chown=appuser:appuser . .

# Trocar para usuário não-root
USER appuser

# Expor porta
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Comando
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 7.2 Docker Compose Seguro

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.ecosistema-union.com
    networks:
      - app-network
    restart: unless-stopped

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:${DB_PASSWORD}@postgres:5432/ecosistema_union
      - SECRET_KEY=${SECRET_KEY}
      - API_SECRET=${API_SECRET}
    depends_on:
      - postgres
      - redis
    networks:
      - app-network
    restart: unless-stopped
    # Limites de recursos
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=ecosistema_union
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-network
    restart: unless-stopped
    # Não expor porta publicamente (apenas na rede interna)

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    networks:
      - app-network
    restart: unless-stopped

networks:
  app-network:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
```

---

## 8. Checklist de Segurança

### Pré-Deploy
- [ ] HTTPS configurado (Let's Encrypt)
- [ ] Secrets em variáveis de ambiente (não no código)
- [ ] Senhas hasheadas com bcrypt
- [ ] JWT com expiração curta
- [ ] Rate limiting configurado
- [ ] CORS restritivo
- [ ] Input validation (Pydantic)
- [ ] SQL parametrizado (SQLAlchemy)
- [ ] Logs de auditoria
- [ ] Backup automático do DB

### Pós-Deploy
- [ ] Monitorar logs de segurança
- [ ] Revisar tentativas de login falhadas
- [ ] Verificar acessos de IPs suspeitos
- [ ] Atualizar dependências regularmente
- [ ] Testar endpoints com ferramentas de segurança
- [ ] Revisar permissões de usuários

---

_Segurança em camadas: cada camada adiciona proteção contra diferentes vetores de ataque._
