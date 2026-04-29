# Dockerfile para Payment Service

FROM node:20-alpine as builder

WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm install

# Copiar código-fonte
COPY . .

# Construir
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copiar apenas dependências de produção
COPY package*.json ./
RUN npm install --only=production

# Copiar build do estágio anterior
COPY --from=builder /app/dist ./dist

EXPOSE 3002

CMD ["node", "dist/main.js"]
