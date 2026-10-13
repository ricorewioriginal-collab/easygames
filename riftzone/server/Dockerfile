# RIFTZONE-Spielserver. Bauen aus dem Ordner riftzone/: docker build -f server/Dockerfile -t riftzone-server .
FROM node:22-slim AS build
WORKDIR /app
COPY package.json ./
COPY package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY tsconfig.json tsconfig.server.json ./
COPY shared ./shared
COPY server ./server
RUN npm run server:build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production DATA_DIR=/data PORT=2610
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/node_modules/ws ./node_modules/ws
RUN mkdir -p /data && chown node:node /data
VOLUME /data
EXPOSE 2610
USER node
CMD ["node", "server/dist/server.mjs"]
