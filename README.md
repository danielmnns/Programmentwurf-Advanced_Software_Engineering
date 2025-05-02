# Lernmanagementsystem (LMS) für Bildungseinrichtungen

Philipp Rogler, Max Knoblauch, Marcel Rupprich & Daniel Mannes

---

Dieses Lernmanagementsystem (LMS) bietet eine umfassende Plattform zur Unterstützung von Bildungseinrichtungen. Es ermöglicht Dozenten, Kursmaterialien hochzuladen und Aufgaben zu erstellen, während Studenten auf Inhalte zugreifen und ihre Leistungen verwalten können. Kursleiter haben Zugriff auf Verwaltungsfunktionen für Studenten und Kurse.

## Voraussetzungen

Bevor Sie mit der Installation beginnen, stellen Sie sicher, dass folgende Software auf Ihrem System installiert ist:

1. *Node.js (v14.x oder höher)* - [Download hier](https://nodejs.org/en/download/)
   - Nach der Installation überprüfen Sie die Version:
   ```sh 
   node --version 
   ```

2. *npm (v6.x oder höher)* - wird mit Node.js installiert
   - Überprüfen Sie die Version:
   ```sh
   npm --version
   ```
   

3. *MongoDB Community Edition (v4.4 oder höher)* - [Download hier](https://www.mongodb.com/try/download/community)
   - Installation gemäß den Anweisungen für Ihr Betriebssystem
   - Nach der Installation starten Sie den MongoDB-Dienst:
     - Windows: MongoDB sollte als Dienst starten
     - macOS/Linux: sudo systemctl start mongod oder brew services start mongodb-community
   - Optional: [MongoDB Compass](https://www.mongodb.com/products/compass) für die grafische Verwaltung

4. *Angular CLI* - Nach der Installation von Node.js & npm:
   ```sh
   npm install -g @angular/cli
   ```

   - Überprüfen Sie die Version:
    ``` sh
   ng version
   ```

## Installation

### 1. MongoDB einrichten

1. Stellen Sie sicher, dass MongoDB läuft
2. Für die Datenbankverwaltung (optional):
   - Öffnen Sie MongoDB Compass
   - Verbinden Sie sich mit dem Standard-Connection-String: mongodb://localhost:27017
   - Erstellen Sie eine Datenbank mit dem Namen lms_db (wird automatisch erstellt, wenn sie nicht existiert)

### 2. Backend einrichten

1. In das Backend-Verzeichnis wechseln:
   ```sh
   cd backend_nest
   ```

2. Abhängigkeiten installieren:
   ```sh
   npm install
   ```   

3. TypeScript-Code kompilieren:
   ```sh
   npm run build
   ```

4. Server starten:
   ```sh
   npm run start
   ```
   
   Für die Entwicklung mit automatischem Neuladen:
   ```sh
   npm run start:dev
   ```

   Der Backend-Server sollte nun unter http://localhost:3000 erreichbar sein.

### 3. Frontend einrichten

1. Öffnen Sie ein neues Terminal und wechseln Sie ins Frontend-Verzeichnis:
   ```sh
   cd frontend
   ```
   (wenn Sie sich bereits im Projektverzeichnis befinden, nutzen Sie cd ../frontend)

2. Abhängigkeiten installieren:
   ```sh
   npm install
   ```

3. Entwicklungsserver starten:
   ```sh
   ng serve
   ``` 

4. Das Frontend ist nun unter http://localhost:4200 erreichbar

## Testen der Anwendung

### Backend-Tests

Im Backend-Verzeichnis (backend_nest):

1. Unit-Tests ausführen:
   ```sh
   npm run test
   ```

2. End-to-End-Tests ausführen:
   ```sh
   npm run test:e2e
   ```

3. Test-Coverage-Bericht erstellen:
   ```sh
   npm run test:cov
   ```

### Frontend-Tests

Im Frontend-Verzeichnis (frontend):

1. Unit-Tests mit Karma ausführen:
   ```sh
   ng test
   ```

2. End-to-End-Tests ausführen:
   ```sh
   ng e2e
   ```

## Erste Schritte mit der Anwendung

1. Öffnen Sie einen Webbrowser und navigieren Sie zu http://localhost:4200
2. Melden Sie sich als Admin an:
   - Benutzername: admin
   - Passwort: admin
3. Navigieren Sie zu "Benutzerverwaltung" und erstellen Sie neue Benutzer.
4. Erkunden Sie die Plattform entsprechend Ihrer Benutzerrolle:
   - Als Administrator: Verwalten Sie Benutzer und Systemeinstellungen
   - Als Dozent/Kursleiter: Erstellen und verwalten Sie Kurse und Materialien
   - Als Student: Greifen Sie auf Kurse zu und reichen Sie Aufgaben ein

## Fehlerbehebung

- *MongoDB-Verbindungsfehler*: Stellen Sie sicher, dass MongoDB läuft und unter der angegebenen URL erreichbar ist.
- *Berechtigungsprobleme*: Für eingeschränkte Funktionen melden Sie sich mit einer Benutzerrolle an, die über entsprechende Rechte verfügt.

## Unterstützung

Bei Fragen oder Problemen melden Sie sich gerne per Mail bei uns.

---

© 2025 Lernmanagementsystem - Entwickelt im Rahmen des Moduls "Advanced Software Engineering"
