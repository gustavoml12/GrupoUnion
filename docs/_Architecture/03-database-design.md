# Database Design

## Schema Overview

```prisma
// Prisma Schema para Ecosistema Union

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USERS & AUTH
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  role          UserRole  @default(MEMBER)
  status        UserStatus @default(PENDING)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  member        Member?
  sessions      Session[]
  notifications Notification[]
  
  @@index([email])
  @@index([status])
}

enum UserRole {
  MEMBER
  HUB
  ADMIN
}

enum UserStatus {
  PENDING
  ACTIVE
  SUSPENDED
  REMOVED
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([token])
}

// ============================================
// MEMBERS
// ============================================

model Member {
  id                    String   @id @default(cuid())
  userId                String   @unique
  
  // Personal Info
  fullName              String
  phone                 String
  photoUrl              String?
  
  // Company Info
  companyName           String
  category              String
  website               String?
  description           String?
  
  // Onboarding
  onboardingCompleted   Boolean  @default(false)
  onboardingCompletedAt DateTime?
  
  // Reputation
  reputationScore       Float    @default(0)
  totalPoints           Int      @default(0)
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  // Relations
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  referralsGiven        Referral[] @relation("ReferralFrom")
  referralsReceived     Referral[] @relation("ReferralTo")
  feedbacksGiven        Feedback[] @relation("FeedbackFrom")
  feedbacksReceived     Feedback[] @relation("FeedbackTo")
  eventAttendances      EventAttendance[]
  memberBadges          MemberBadge[]
  hubNotes              HubNote[]
  
  @@index([userId])
  @@index([category])
  @@index([reputationScore])
}

// ============================================
// REFERRALS (INDICAÇÕES)
// ============================================

model Referral {
  id                String          @id @default(cuid())
  
  // Who & To Whom
  fromMemberId      String
  toMemberId        String
  
  // Client Info
  clientName        String
  clientCompany     String?
  clientPhone       String
  clientEmail       String?
  context           String
  
  // Qualification
  qualification     Qualification
  
  // Status
  status            ReferralStatus  @default(PENDING_CONTACT)
  
  // Timestamps
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  closedAt          DateTime?
  
  // Relations
  fromMember        Member          @relation("ReferralFrom", fields: [fromMemberId], references: [id])
  toMember          Member          @relation("ReferralTo", fields: [toMemberId], references: [id])
  feedback          Feedback?
  statusHistory     ReferralStatusHistory[]
  notes             ReferralNote[]
  
  @@index([fromMemberId])
  @@index([toMemberId])
  @@index([status])
  @@index([createdAt])
}

enum Qualification {
  HOT
  WARM
  COLD
}

enum ReferralStatus {
  PENDING_CONTACT
  CONTACTED
  NEGOTIATING
  WON
  LOST
  CANCELLED
}

model ReferralStatusHistory {
  id          String         @id @default(cuid())
  referralId  String
  status      ReferralStatus
  changedAt   DateTime       @default(now())
  
  referral    Referral       @relation(fields: [referralId], references: [id], onDelete: Cascade)
  
  @@index([referralId])
}

model ReferralNote {
  id          String   @id @default(cuid())
  referralId  String
  content     String
  createdAt   DateTime @default(now())
  
  referral    Referral @relation(fields: [referralId], references: [id], onDelete: Cascade)
  
  @@index([referralId])
}

// ============================================
// FEEDBACK
// ============================================

model Feedback {
  id              String   @id @default(cuid())
  referralId      String   @unique
  fromMemberId    String
  toMemberId      String
  
  // Feedback Data
  wasWellServed   Boolean
  qualityRating   Int      // 1-5
  comments        String?
  dealClosed      Boolean
  dealValue       Float?
  
  createdAt       DateTime @default(now())
  
  // Relations
  referral        Referral @relation(fields: [referralId], references: [id], onDelete: Cascade)
  fromMember      Member   @relation("FeedbackFrom", fields: [fromMemberId], references: [id])
  toMember        Member   @relation("FeedbackTo", fields: [toMemberId], references: [id])
  
  @@index([referralId])
  @@index([toMemberId])
  @@index([qualityRating])
}

// ============================================
// EVENTS
// ============================================

model Event {
  id          String   @id @default(cuid())
  
  title       String
  description String?
  date        DateTime
  time        String
  location    String
  
  createdById String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  attendances EventAttendance[]
  materials   EventMaterial[]
  
  @@index([date])
}

model EventAttendance {
  id          String   @id @default(cuid())
  eventId     String
  memberId    String
  
  confirmed   Boolean  @default(false)
  checkedIn   Boolean  @default(false)
  checkedInAt DateTime?
  
  // Relations
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  member      Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)
  
  @@unique([eventId, memberId])
  @@index([eventId])
  @@index([memberId])
}

model EventMaterial {
  id        String   @id @default(cuid())
  eventId   String
  
  title     String
  fileUrl   String
  fileType  String
  
  createdAt DateTime @default(now())
  
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  @@index([eventId])
}

// ============================================
// BADGES & GAMIFICATION
// ============================================

model Badge {
  id          String   @id @default(cuid())
  
  name        String   @unique
  description String
  iconUrl     String?
  criteria    Json     // Flexible criteria storage
  
  createdAt   DateTime @default(now())
  
  // Relations
  memberBadges MemberBadge[]
}

model MemberBadge {
  id        String   @id @default(cuid())
  memberId  String
  badgeId   String
  earnedAt  DateTime @default(now())
  
  // Relations
  member    Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)
  badge     Badge    @relation(fields: [badgeId], references: [id])
  
  @@unique([memberId, badgeId])
  @@index([memberId])
}

// ============================================
// NOTIFICATIONS
// ============================================

model Notification {
  id        String   @id @default(cuid())
  userId    String
  
  type      String
  title     String
  message   String
  read      Boolean  @default(false)
  
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([read])
}

// ============================================
// HUB MANAGEMENT
// ============================================

model HubNote {
  id        String   @id @default(cuid())
  memberId  String
  
  content   String
  createdAt DateTime @default(now())
  
  member    Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)
  
  @@index([memberId])
}
```

---

## Key Design Decisions

### 1. User vs Member Separation

**Por quê?**
- User = autenticação e autorização
- Member = dados de negócio
- Permite Hub/Admin sem ser Member
- Separação de concerns

### 2. CUID vs UUID

**Escolha:** CUID (Collision-resistant Unique Identifier)

**Por quê?**
- Mais curto que UUID
- Sortable (ordenação por criação)
- URL-safe
- Melhor performance em índices

### 3. Soft Delete vs Hard Delete

**Escolha:** Hard delete com status

**Por quê?**
- Status REMOVED mantém histórico
- Queries mais simples (sem paranoid mode)
- LGPD: direito ao esquecimento = hard delete quando solicitado

### 4. JSON Fields

**Uso:** Badge criteria

**Por quê?**
- Flexibilidade para diferentes tipos de badges
- Não precisa de schema rígido
- PostgreSQL tem excelente suporte a JSON

### 5. Cascading Deletes

**Estratégia:**
- User deleted → Member deleted → Tudo cascade
- Referral deleted → Feedback, Notes cascade
- Event deleted → Attendances, Materials cascade

**Por quê?**
- Integridade referencial garantida
- Menos código de limpeza
- PostgreSQL faz o trabalho

---

## Indexes Strategy

### Primary Indexes (Automatic)
- Todos os `@id`
- Todos os `@unique`

### Custom Indexes (Performance)

**Users:**
- `email` - Login lookup
- `status` - Filtrar ativos

**Members:**
- `userId` - Join com User
- `category` - Filtrar por categoria
- `reputationScore` - Ranking

**Referrals:**
- `fromMemberId` - Minhas indicações dadas
- `toMemberId` - Minhas indicações recebidas
- `status` - Filtrar por status
- `createdAt` - Ordenação temporal

**Feedback:**
- `referralId` - Lookup por indicação
- `toMemberId` - Reputação do membro
- `qualityRating` - Filtrar feedbacks negativos

**Events:**
- `date` - Filtrar por data

**Notifications:**
- `userId` - Minhas notificações
- `read` - Não lidas

---

## Relationships Summary

```
User (1) ─── (1) Member
  │
  └─── (N) Session
  └─── (N) Notification

Member (1) ─── (N) Referral (as from)
       (1) ─── (N) Referral (as to)
       (1) ─── (N) Feedback (as from)
       (1) ─── (N) Feedback (as to)
       (1) ─── (N) EventAttendance
       (1) ─── (N) MemberBadge
       (1) ─── (N) HubNote

Referral (1) ─── (1) Feedback
         (1) ─── (N) ReferralStatusHistory
         (1) ─── (N) ReferralNote

Event (1) ─── (N) EventAttendance
      (1) ─── (N) EventMaterial

Badge (1) ─── (N) MemberBadge
```

---

## Data Integrity Rules

### Constraints

1. **Email único** - Não pode ter 2 users com mesmo email
2. **Member único por User** - 1 user = 1 member
3. **Feedback único por Referral** - 1 indicação = 1 feedback
4. **EventAttendance único** - 1 member não pode confirmar 2x mesmo evento

### Validations (Application Level)

1. **Email válido** - Regex validation
2. **Phone válido** - Formato brasileiro
3. **Quality rating** - Entre 1 e 5
4. **Deal value** - Positivo
5. **Reputation score** - Entre 0 e 5

---

## Migrations Strategy

### Development
```bash
# Criar migration
npx prisma migrate dev --name add_feature_x

# Aplicar migrations
npx prisma migrate dev

# Reset database (cuidado!)
npx prisma migrate reset
```

### Production
```bash
# Aplicar migrations
npx prisma migrate deploy

# Seed data (se necessário)
npx prisma db seed
```

### Rollback Strategy
- Criar migration reversa manual
- Backup antes de migrations grandes
- Test em staging primeiro

---

## Seed Data (Initial)

```typescript
// prisma/seed.ts

const badges = [
  {
    name: "Novo Membro",
    description: "Bem-vindo ao Ecosistema Union!",
    criteria: { type: "onboarding_complete" }
  },
  {
    name: "Primeira Indicação",
    description: "Deu sua primeira indicação",
    criteria: { type: "referrals_given", count: 1 }
  },
  {
    name: "Conector Bronze",
    description: "10 indicações dadas",
    criteria: { type: "referrals_given", count: 10 }
  },
  {
    name: "Conector Prata",
    description: "50 indicações dadas",
    criteria: { type: "referrals_given", count: 50 }
  },
  {
    name: "Conector Ouro",
    description: "100 indicações dadas",
    criteria: { type: "referrals_given", count: 100 }
  },
  {
    name: "100% Presente",
    description: "3 meses sem faltar reunião",
    criteria: { type: "attendance", months: 3, rate: 100 }
  },
  {
    name: "Fechador Master",
    description: "Taxa de conversão > 80%",
    criteria: { type: "conversion_rate", rate: 80 }
  }
];
```

---

## Performance Considerations

### Query Optimization

**N+1 Problem Prevention:**
```typescript
// ❌ Bad (N+1)
const referrals = await prisma.referral.findMany();
for (const ref of referrals) {
  const member = await prisma.member.findUnique({ where: { id: ref.fromMemberId } });
}

// ✅ Good (1 query)
const referrals = await prisma.referral.findMany({
  include: {
    fromMember: true,
    toMember: true
  }
});
```

**Pagination:**
```typescript
// Always paginate large lists
const members = await prisma.member.findMany({
  take: 50,
  skip: page * 50,
  orderBy: { createdAt: 'desc' }
});
```

**Select Only What You Need:**
```typescript
// ❌ Bad (fetch all fields)
const members = await prisma.member.findMany();

// ✅ Good (select specific fields)
const members = await prisma.member.findMany({
  select: {
    id: true,
    fullName: true,
    companyName: true,
    photoUrl: true
  }
});
```

### Caching Strategy (Redis)

**Cache Keys:**
- `member:{id}` - Member profile (TTL: 1h)
- `member:list:{category}` - Members by category (TTL: 5min)
- `dashboard:{memberId}` - Member dashboard (TTL: 5min)
- `stats:global` - Global stats (TTL: 1h)

**Invalidation:**
- Member updated → Invalidate `member:{id}`
- Referral created → Invalidate dashboards
- Feedback given → Invalidate reputation

---

_Database design otimizado para performance, escalabilidade e integridade de dados._
