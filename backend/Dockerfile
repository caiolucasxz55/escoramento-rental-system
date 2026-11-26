# build com todas as deps; a imagem final leva so dist/ e as deps de producao
FROM node:22-alpine AS build
WORKDIR /app
# mongodb-memory-server (so testes) baixaria ~100 MB de binario no npm ci
ENV MONGOMS_DISABLE_POSTINSTALL=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# seed e hash-password rodam com `docker compose exec api npm run ...`
COPY --from=build /app/scripts ./scripts
USER node
EXPOSE 3001
CMD ["node", "dist/main.js"]
