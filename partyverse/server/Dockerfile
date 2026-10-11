# Spielserver (Colyseus). Bauen aus dem Ordner partyverse/: docker build -f server/Dockerfile -t partyverse-server .
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json tsconfig.server.json ./
COPY shared ./shared
COPY server ./server
RUN npm run server:build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/server/dist ./server/dist
EXPOSE 2567
USER node
CMD ["node", "server/dist/server.mjs"]
