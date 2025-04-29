FROM node:18 as build

WORKDIR /app

# Kopiere package.json und package-lock.json
COPY package*.json ./

# Installiere Abhängigkeiten
RUN npm install

# Kopiere den Rest des Projektcodes
COPY . .

# Konfiguriere die Produktionsumgebung für Angular
RUN npm run build --prod

# Verwende nginx für das Hosting der gebauten Angular-Anwendung
FROM nginx:alpine

# Kopiere die gebauten Dateien aus dem Build-Stage
COPY --from=build /app/dist/* /usr/share/nginx/html/

# Kopiere angepasste Nginx-Konfiguration
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf

# Port für den Webserver
EXPOSE 4200

# Starte Nginx
CMD ["nginx", "-g", "daemon off;"]