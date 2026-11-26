# NEXT_PUBLIC_* e embutido no bundle no build: por isso vem como build arg
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api
ARG NEXT_PUBLIC_DEMO_ADMIN_EMAIL=
ARG NEXT_PUBLIC_DEMO_ADMIN_PASSWORD=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_DEMO_ADMIN_EMAIL=$NEXT_PUBLIC_DEMO_ADMIN_EMAIL \
    NEXT_PUBLIC_DEMO_ADMIN_PASSWORD=$NEXT_PUBLIC_DEMO_ADMIN_PASSWORD \
    NEXT_OUTPUT=standalone \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# standalone: so o servidor e os arquivos usados, sem node_modules inteiro
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
