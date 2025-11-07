# User Experience Principles

## Personalidade da Plataforma

### Profissional e Séria
- Design limpo e corporativo
- Informações claras e diretas
- Sem excessos ou elementos infantis
- Foco em funcionalidade e eficiência

### Tradicional e Confiável
- Cores sóbrias (azul, cinza, branco)
- Tipografia clássica e legível
- Ícones e elementos que transmitem solidez
- Como um banco ou instituição respeitável

### Sentimento Desejado
- "Estou em um lugar sério e profissional"
- "Posso confiar nesta plataforma"
- "Isso é para empresários de verdade"
- "Sou parte de algo exclusivo e valioso"

---

## Princípios de Design

### 1. Clareza Acima de Tudo
- Informações importantes sempre visíveis
- Hierarquia visual clara
- Sem ambiguidade nas ações
- Textos diretos e objetivos

### 2. Eficiência
- Máximo 3 cliques para qualquer função
- Atalhos para ações frequentes
- Formulários curtos e inteligentes
- Navegação rápida entre seções

### 3. Feedback Constante
- Confirmação visual de todas as ações
- Estados de loading claros
- Mensagens de sucesso/erro visíveis
- Progresso de processos longos

### 4. Consistência
- Padrões visuais repetidos
- Mesma linguagem em toda plataforma
- Comportamentos previsíveis
- Design system bem definido

---

## Fluxos de Usuário Principais

### Fluxo 1: Onboarding do Empresário

```
1. Cadastro Inicial (2 min)
   └─> Formulário simples: nome, email, empresa, telefone

2. Boas-Vindas (1 min)
   └─> Vídeo curto explicando o grupo e expectativas

3. Trilha de Onboarding (45 min)
   ├─> Vídeo 1: O que é o Ecosistema Union (5 min)
   ├─> Vídeo 2: Como funciona a reciprocidade (5 min)
   ├─> Vídeo 3: Manual de boas práticas (10 min)
   ├─> Leitura: Regras e ética do grupo (10 min)
   └─> Questionário de qualificação (15 min)

4. Agendamento de Reunião (2 min)
   └─> Escolher data para reunião presencial

5. Aguardando Aprovação
   └─> Tela com status e próximos passos

6. Aprovado! (Primeiro Login Completo)
   └─> Tour guiado da plataforma (5 min)
```

### Fluxo 2: Criar Indicação

```
1. Dashboard → Botão "Nova Indicação" (destaque)

2. Formulário de Indicação
   ├─> Para quem? (dropdown com empresários)
   ├─> Cliente: Nome, Empresa, Telefone, Email
   ├─> Contexto/Necessidade (textarea)
   ├─> Qualificação: Quente/Morno/Frio (radio)
   └─> Observações adicionais (opcional)

3. Confirmação
   └─> Resumo da indicação antes de enviar

4. Sucesso!
   └─> Mensagem de confirmação + próximos passos
   └─> "Você receberá notificação quando houver atualização"
```

### Fluxo 3: Receber e Atender Indicação

```
1. Notificação: "Você recebeu uma nova indicação!"

2. Ver Detalhes da Indicação
   ├─> Quem indicou
   ├─> Dados do cliente
   ├─> Contexto/necessidade
   └─> Qualificação

3. Aceitar Indicação
   └─> Botão "Aceitar e Entrar em Contato"

4. Atualizar Status Conforme Avança
   ├─> "Contato Realizado"
   ├─> "Em Negociação"
   └─> "Fechado - Ganho" ou "Fechado - Perdido"

5. Após 7 Dias: Notificação de Feedback
   └─> Quem indicou recebe formulário de feedback
```

### Fluxo 4: Dashboard Diário

```
1. Login → Dashboard Principal

2. Visão Rápida (Cards no Topo)
   ├─> Indicações dadas este mês
   ├─> Indicações recebidas este mês
   ├─> Taxa de conversão
   └─> Reputação/Pontos

3. Pendências (Destaque)
   ├─> Feedbacks aguardando resposta
   ├─> Indicações sem atualização
   └─> Próximas reuniões

4. Ações Rápidas
   ├─> Nova Indicação (botão primário)
   ├─> Ver Minhas Indicações
   ├─> Ver Próximos Eventos
   └─> Ver Membros do Grupo
```

---

## Componentes Chave da Interface

### 1. Header/Navegação
- Logo do Ecosistema Union (esquerda)
- Menu principal: Dashboard, Indicações, Membros, Eventos, Perfil
- Notificações (sino com badge)
- Avatar do usuário (dropdown com logout)

### 2. Dashboard Cards
- Cards grandes com métricas principais
- Ícones claros e profissionais
- Números em destaque
- Comparação com mês anterior (seta ↑↓)

### 3. Tabelas de Dados
- Cabeçalhos claros
- Filtros e busca no topo
- Ações por linha (ícones)
- Paginação no rodapé
- Exportar para Excel (opcional)

### 4. Formulários
- Labels claras acima dos campos
- Placeholders com exemplos
- Validação em tempo real
- Mensagens de erro próximas ao campo
- Botões de ação no rodapé (Cancelar | Salvar)

### 5. Modais/Popups
- Fundo escurecido (overlay)
- Conteúdo centralizado
- Título claro
- Botão X para fechar
- Ações no rodapé

### 6. Notificações
- Toast no canto superior direito
- Auto-dismiss após 5 segundos
- Cores: Verde (sucesso), Vermelho (erro), Azul (info), Amarelo (aviso)

---

## Paleta de Cores

### Cores Principais
- **Azul Escuro (#1E3A5F):** Cor primária, headers, botões principais
- **Azul Médio (#2E5C8A):** Links, hover states
- **Cinza Escuro (#333333):** Textos principais
- **Cinza Médio (#666666):** Textos secundários
- **Cinza Claro (#F5F5F5):** Backgrounds, cards

### Cores de Status
- **Verde (#28A745):** Sucesso, positivo, ativo
- **Vermelho (#DC3545):** Erro, negativo, removido
- **Amarelo (#FFC107):** Aviso, pendente
- **Azul (#17A2B8):** Informação, neutro

### Cores de Qualificação
- **Vermelho Quente (#FF5733):** Indicação Quente
- **Laranja Morno (#FFA500):** Indicação Morna
- **Azul Frio (#4A90E2):** Indicação Fria

---

## Tipografia

### Fontes
- **Títulos:** Inter ou Roboto (Bold, 24-32px)
- **Subtítulos:** Inter ou Roboto (Semi-Bold, 18-20px)
- **Corpo:** Inter ou Roboto (Regular, 14-16px)
- **Pequeno:** Inter ou Roboto (Regular, 12px)

### Hierarquia
- H1: 32px, Bold
- H2: 24px, Semi-Bold
- H3: 20px, Semi-Bold
- Body: 16px, Regular
- Small: 12px, Regular

---

## Ícones

### Biblioteca
- **Lucide Icons** ou **Heroicons** (consistentes, profissionais)

### Uso
- Indicações: 📊 (chart)
- Membros: 👥 (users)
- Eventos: 📅 (calendar)
- Notificações: 🔔 (bell)
- Configurações: ⚙️ (settings)
- Sair: 🚪 (logout)

---

## Estados e Interações

### Botões
- **Normal:** Cor sólida
- **Hover:** Cor mais escura (10%)
- **Active:** Cor mais escura (20%)
- **Disabled:** Cinza claro, cursor not-allowed

### Links
- **Normal:** Azul médio, sem sublinhado
- **Hover:** Azul escuro, sublinhado
- **Visited:** Mesma cor (não mudar)

### Inputs
- **Normal:** Borda cinza clara
- **Focus:** Borda azul, sombra sutil
- **Error:** Borda vermelha, mensagem abaixo
- **Success:** Borda verde (opcional)

---

## Responsividade

### Desktop (> 1024px)
- Layout de 2-3 colunas
- Sidebar fixa
- Tabelas completas
- Gráficos grandes

### Tablet (768px - 1024px)
- Layout de 1-2 colunas
- Sidebar colapsável
- Tabelas com scroll horizontal
- Gráficos médios

### Mobile (< 768px)
- Layout de 1 coluna
- Menu hamburger
- Cards empilhados
- Tabelas simplificadas ou cards
- Gráficos pequenos

---

_A experiência do usuário deve refletir a seriedade e profissionalismo do Ecosistema Union._
