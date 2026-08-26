FROM node:lts AS build
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
COPY package*.json ./
RUN npm ci --legacy-peer-deps --omit=dev

COPY --chown=node:node --from=migrate /app/sqlite.db /app/
COPY --chown=node:node --from=migrate /app/dist /app/

USER node
CMD ["node", "dist/index.js"]