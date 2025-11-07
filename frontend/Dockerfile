# Etapa 1: Construir a aplicação
FROM node:18-alpine AS builder

# Instalar dependências de build
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm ci

# Copiar o restante da aplicação
COPY . .

# Construir a aplicação
RUN npm run build

# Etapa 2: Imagem de produção
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar a aplicação construída
COPY --from=builder /app/next.config.js .
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copiar a pasta app se existir
COPY --from=builder /app/app ./app

# Copiar outros arquivos necessários
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Definir permissões
RUN chown -R nextjs:nodejs /app

# Trocar para o usuário não-root
USER nextjs

# Porta que a aplicação irá rodar
EXPOSE 3000

# Variáveis de ambiente
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Iniciar a aplicação
CMD ["node", "server.js"]
