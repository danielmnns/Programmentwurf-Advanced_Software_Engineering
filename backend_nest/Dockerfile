FROM node:18-alpine AS build

WORKDIR /app

# Kopiere package.json und package-lock.json
COPY package*.json ./

# Installiere Abhängigkeiten
RUN npm install

# Kopiere den Rest des Projektcodes
COPY . .

# Baue das Projekt
RUN npm run build

# Verwende ein kleines Image für die Ausführung
FROM node:18-alpine

WORKDIR /app

# Kopiere die gebauten Dateien aus dem Build-Stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

# Erstelle Uploads-Verzeichnis
RUN mkdir -p uploads/courseDocuments uploads/submissions uploads/taskDocuments uploads/tasks

# Port für die Anwendung
EXPOSE 3000

# Starte die Anwendung
CMD ["node", "dist/main.js"]