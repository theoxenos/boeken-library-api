FROM node:lts AS build
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM build as migrate
RUN npm run drizzle:migrate

FROM node:lts-slim as production
ENV NODE_ENV=production
WORKDIR /app
RUN chown -R node:node /app
USER node

COPY package*.json ./
RUN npm ci --legacy-peer-deps --omit=dev

COPY --chown=node:node --from=migrate /app/sqlite.db /app/
COPY --chown=node:node --from=migrate /app/dist/ /app/

CMD ["node", "index.js"]