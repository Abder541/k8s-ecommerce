# --- Etape 1 : build du bundle React avec Vite ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./
RUN npm install

COPY vite.config.js index.html ./
COPY src ./src

RUN npm run build

# --- Etape 2 : image runtime Nginx ---
FROM nginx:1.27-alpine

# Conf Nginx avec reverse-proxy /api -> backend-service (resolution paresseuse)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Script d'injection du DNS resolver au demarrage du conteneur
COPY 40-set-resolver.sh /docker-entrypoint.d/40-set-resolver.sh
RUN chmod +x /docker-entrypoint.d/40-set-resolver.sh

# Bundle statique React
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
