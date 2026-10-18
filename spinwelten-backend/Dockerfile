# Spinwelten-Backend – kleines Image ohne npm-Abhängigkeiten.
# Die Spiel-Logik (spinwelten/js/core + js/data) kommt über einen zweiten Build-Kontext "game":
#   docker build --build-context game=../spinwelten -t spinwelten-backend .
# (im Ordner spinwelten-backend; benötigt BuildKit, Standard seit Docker 23)
FROM node:22-alpine
ENV NODE_ENV=production PORT=8080 DATA_DIR=/data SPINWELTEN_GAME_DIR=/app/game
WORKDIR /app/backend
COPY package.json ./
COPY src ./src
COPY --from=game js/core /app/game/js/core
COPY --from=game js/data /app/game/js/data
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME ["/data"]
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:8080/v1/health || exit 1
CMD ["node", "src/server.js"]
