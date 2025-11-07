# User Journey Flows

## Fluxo 1: Onboarding do Empresário

**Objetivo:** Qualificar e integrar novo empresário ao ecossistema

```
START
  ↓
[1] Cadastro Inicial (2 min)
  - Nome, email, telefone, empresa
  - Senha
  ↓
[2] Boas-Vindas
  - Vídeo curto (30s): "Bem-vindo ao Ecosistema Union"
  - Expectativas claras
  ↓
[3] Trilha de Onboarding (45-60 min)
  ├─> Vídeo 1: O que é o Ecosistema (5 min)
  ├─> Vídeo 2: Como funciona a reciprocidade (5 min)
  ├─> Vídeo 3: Manual de boas práticas (10 min)
  ├─> Leitura: Regras e ética do grupo (10 min)
  └─> Questionário de qualificação (15-20 min)
      - 10-15 perguntas
      - Entendimento do modelo
      - Comprometimento
      - Capacidade de atendimento
  ↓
[4] Agendamento de Reunião Presencial
  - Escolher data disponível
  - Confirmação obrigatória
  ↓
[5] Aguardando Aprovação
  - Tela de status
  - "Seu cadastro está em análise"
  - Próximos passos
  ↓
[6] Aprovação pelo Hub
  - Hub analisa respostas
  - Hub confirma presença na reunião
  - Decisão: Aprovar / Reprovar / Solicitar mais info
  ↓
[7] Notificação de Aprovação
  - Email + notificação in-app
  - "Parabéns! Você foi aprovado!"
  ↓
[8] Primeiro Login Completo
  - Tour guiado da plataforma (5 min)
  - Completar perfil
  - Upload de foto
  ↓
[9] Empresário Ativo
  - Acesso completo à plataforma
  - Pode dar e receber indicações
  ↓
END
```

**Tempo Total:** 1-2 horas (digital) + reunião presencial

---

## Fluxo 2: Criar e Rastrear Indicação

**Objetivo:** Empresário indica cliente para outro empresário e acompanha resultado

```
START
  ↓
[1] Dashboard → Botão "Nova Indicação"
  ↓
[2] Formulário de Indicação
  ├─> Para quem? (dropdown com empresários)
  ├─> Dados do cliente (nome, empresa, telefone, email)
  ├─> Contexto/necessidade (textarea)
  ├─> Qualificação (Quente/Morno/Frio)
  └─> Observações adicionais (opcional)
  ↓
[3] Confirmação
  - Resumo da indicação
  - "Tem certeza?"
  ↓
[4] Indicação Criada
  - Status: "Pendente Contato"
  - Notificação enviada para empresário B
  ↓
[5] Empresário B Recebe Notificação
  - In-app + email
  - "Você recebeu uma nova indicação!"
  ↓
[6] Empresário B Visualiza Detalhes
  - Dados completos do cliente
  - Contexto da indicação
  - Botão "Aceitar e Entrar em Contato"
  ↓
[7] Empresário B Atualiza Status
  ├─> "Contato Realizado"
  ├─> "Em Negociação"
  ├─> "Fechado - Ganho"
  ├─> "Fechado - Perdido"
  └─> "Cancelado"
  ↓
[8] Empresário A Acompanha
  - Vê mudanças de status em tempo real
  - Recebe notificações de atualizações
  ↓
[9] Após 7 Dias: Sistema Envia Lembrete
  - Notificação para empresário A
  - "Sua indicação precisa de feedback"
  ↓
[10] Empresário A Dá Feedback
  - Cliente foi bem atendido? (Sim/Não)
  - Qualidade do atendimento (1-5 estrelas)
  - Comentários
  - Negócio foi fechado? (Sim/Não/Em andamento)
  - Valor aproximado (opcional)
  ↓
[11] Feedback Registrado
  - Impacta reputação de empresário B
  - Se negativo (<3 estrelas) → Alerta para Hub
  ↓
[12] Indicação Completa
  - Histórico salvo
  - Estatísticas atualizadas
  - Pontos/badges concedidos
  ↓
END
```

**Tempo Total:** 5-10 min (criar) + acompanhamento contínuo

---

## Fluxo 3: Participar de Reunião Presencial

**Objetivo:** Empresário confirma presença e faz check-in na reunião

```
START
  ↓
[1] Hub Cria Evento
  - Data, hora, local
  - Tema/pauta
  - Convites automáticos enviados
  ↓
[2] Empresário Recebe Convite
  - Email + notificação in-app
  - Detalhes do evento
  ↓
[3] Empresário Confirma Presença
  - Botão "Confirmar Presença"
  - Opções: Sim / Não / Talvez
  ↓
[4] Lembrete Automático (24h antes)
  - "Lembrete: Reunião amanhã às 14h"
  ↓
[5] Lembrete Automático (2h antes)
  - "Lembrete: Reunião em 2 horas"
  ↓
[6] Empresário Chega no Local
  - QR code exibido na tela
  ↓
[7] Check-in
  - Hub escaneia QR code
  - Ou check-in manual pelo Hub
  - Horário de chegada registrado
  ↓
[8] Presença Confirmada
  - "Check-in realizado com sucesso!"
  - +5 pontos
  ↓
[9] Materiais do Evento Disponíveis
  - Slides, documentos
  - Notas da reunião
  ↓
[10] Histórico Atualizado
  - Presença registrada
  - Estatísticas de participação atualizadas
  ↓
END
```

**Tempo Total:** 2-3 min (confirmação + check-in)

---

## Fluxo 4: Buscar e Indicar Cliente para Membro

**Objetivo:** Empresário busca membro adequado e faz indicação

```
START
  ↓
[1] Dashboard → "Membros"
  ↓
[2] Buscar Membro
  - Por nome, empresa ou categoria
  - Filtros: categoria, status, reputação
  ↓
[3] Lista de Membros
  - Cards com foto, nome, empresa
  - Reputação (estrelas)
  - Categoria
  ↓
[4] Selecionar Membro
  - Click no card
  ↓
[5] Ver Perfil Completo
  - Informações detalhadas
  - Estatísticas
  - Badges
  - Avaliações
  ↓
[6] Botão "Indicar Cliente"
  - Abre formulário de indicação
  - Campo "Para quem" já preenchido
  ↓
[7] Preencher Dados do Cliente
  - (Mesmo fluxo de "Criar Indicação")
  ↓
[8] Indicação Criada
  - Notificação enviada
  ↓
END
```

**Tempo Total:** 3-5 min

---

## Fluxo 5: Hub Aprova Novo Membro

**Objetivo:** Hub analisa candidato e decide aprovação

```
START
  ↓
[1] Candidato Completa Onboarding
  - Trilha digital finalizada
  - Questionário respondido
  - Reunião presencial agendada
  ↓
[2] Hub Recebe Notificação
  - "Novo candidato aguardando aprovação"
  ↓
[3] Hub Acessa Dashboard
  - Seção "Candidatos Pendentes"
  ↓
[4] Hub Visualiza Candidato
  - Dados pessoais e profissionais
  - Respostas do questionário
  - Pontuação automática (se aplicável)
  - Status da reunião presencial
  ↓
[5] Hub Analisa
  - Adequação ao perfil do grupo
  - Comprometimento demonstrado
  - Capacidade de atendimento
  - Fit cultural
  ↓
[6] Hub Toma Decisão
  ├─> [Aprovar]
  │     ↓
  │   Candidato recebe notificação
  │   Status muda para "Ativo"
  │   Acesso completo liberado
  │     ↓
  │   END
  │
  ├─> [Reprovar]
  │     ↓
  │   Hub adiciona justificativa
  │   Candidato recebe notificação
  │   Acesso bloqueado
  │     ↓
  │   END
  │
  └─> [Solicitar Mais Informações]
        ↓
      Hub envia mensagem
      Candidato responde
      Volta para análise
        ↓
      (Loop até decisão final)
```

**Tempo Total:** 10-15 min por candidato

---

## Fluxo 6: Hub Gerencia Membro Problemático

**Objetivo:** Hub identifica e age sobre membro com feedbacks negativos

```
START
  ↓
[1] Sistema Detecta Feedback Negativo
  - Feedback < 3 estrelas
  - Ou múltiplas reclamações
  ↓
[2] Alerta Automático para Hub
  - Notificação in-app + email
  - "Atenção: Feedback negativo recebido"
  ↓
[3] Hub Acessa Dashboard
  - Seção "Alertas"
  ↓
[4] Hub Visualiza Detalhes
  - Quem deu o feedback
  - Qual indicação
  - Comentários
  - Histórico do membro
  ↓
[5] Hub Investiga
  - Conversa com quem deu feedback
  - Conversa com membro problemático
  - Analisa padrão de comportamento
  ↓
[6] Hub Decide Ação
  ├─> [Advertência]
  │     ↓
  │   Conversa e orientação
  │   Nota interna registrada
  │   Monitoramento próximo
  │     ↓
  │   END
  │
  ├─> [Suspensão Temporária]
  │     ↓
  │   Define prazo (ex: 30 dias)
  │   Adiciona justificativa
  │   Membro não pode criar indicações
  │   Notificação enviada
  │     ↓
  │   END
  │
  └─> [Remoção Permanente]
        ↓
      Adiciona justificativa legal
      Acesso bloqueado
      Notificação enviada
      Histórico mantido
        ↓
      END
```

**Tempo Total:** 30-60 min (investigação + decisão)

---

## Pontos de Decisão Críticos

### Decisão 1: Aprovar ou Reprovar Candidato
- **Critério:** Adequação ao perfil + comprometimento
- **Impacto:** Qualidade do ecossistema
- **Reversível:** Não (reprovar é permanente)

### Decisão 2: Qualificação da Indicação (Quente/Morno/Frio)
- **Critério:** Prontidão do cliente para fechar
- **Impacto:** Expectativa de quem recebe
- **Reversível:** Não (mas pode adicionar notas)

### Decisão 3: Dar Feedback Positivo ou Negativo
- **Critério:** Qualidade do atendimento recebido
- **Impacto:** Reputação do membro
- **Reversível:** Não (feedback é permanente)

### Decisão 4: Suspender ou Remover Membro
- **Critério:** Gravidade e frequência de problemas
- **Impacto:** Qualidade do grupo
- **Reversível:** Suspensão sim, remoção não

---

_Fluxos otimizados para eficiência e clareza, minimizando fricção e maximizando valor percebido._
