# Dokumentationen
- Nodejs: https://docs.nestjs.com/
- Angular: https://angular.dev/overview
    - Angular Internationalization (localisation) (https://angular.dev/guide/i18n)

## Extensions 



# LMS Backend

Ein Lernmanagementsystem (LMS) Backend, entwickelt mit Node.js. Es unterstützt mehrere Benutzerrollen (Admin, Kursleiter, Dozent, Sekretärin, Student) und bietet Funktionen wie Benutzerverwaltung, Kursmanagement, Materialmanagement und Aufgabenmanagement.

## Anforderungen

- Node.js (Version 16 oder höher)
- npm (Node Package Manager)
- MongoDB

## Installation

1. **Projekt klonen**:
   ```bash
   git clone <REPOSITORY_URL>
   cd lms-backend

2. **Abhängigkeiten installieren**
    #
    ```bach
    npm install
    npm install bcryptjs @types/bcryptjs
    npm install @nestjs/testing
    npm install jsonwebtoken
    npm install --save-dev @types/jsonwebtoken
    npm install mongoose @types/mongoose
    npm install @types/supertest --save-dev
    npm i --save-dev @types/jest
    npm install dotenv
    npm install --save-dev @types/dotenv


3. **Umgebungsvariablen konfigurieren: Erstellen Sie eine .env-Datei im Projektverzeichnis und fügen Sie die folgenden Variablen hinzu**
    ```bash
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/lms
    JWT_SECRET=your_secret_key

4. **Datenbank starten: Stellen Sie sicher, dass MongoDB ausgeführt wird.**

5. **Server starten:**
    ```bash
    npm start


#  Features
## Rollenbasierter Zugriff
- Admin:
    - Benutzerverwaltung, Hinzufügen/Löschen von Kursen, Exportieren von Daten.
- Kursleiter:
    - Erstellung und Verwaltung von Kursen, Bewertung von Aufgaben.
- Dozent:
    - Hochladen von Lernmaterialien, Verwaltung von Aufgaben.
- Sekretärin:
    - Verwaltung von Studentenprofilen, Organisation von Semesterplänen.
- Student:
    - Zugriff auf Kurse und Inhalte, Abgabe von Aufgaben.

## Endpunkte
#### Authentifizierung

`POST /api/auth/register`: Registrierung eines Benutzers.

`POST /api/auth/login`: Anmeldung eines Benutzers.

#### Benutzerverwaltung (Admin)

`GET /api/users`: Liste aller Benutzer abrufen.

`POST /api/users`: Neuen Benutzer erstellen.

`PUT /api/users/:id`: Benutzerinformationen aktualisieren.

`DELETE /api/users/:id`: Benutzer löschen.

#### Kursmanagement
`GET /api/courses`: Alle Kurse abrufen.

`POST /api/courses`: Neuen Kurs erstellen.

`PUT /api/courses/:id`: Kursinformationen aktualisieren.

`DELETE /api/courses/:id`: Kurs löschen.

#### Materialmanagement (Dozent, Kursleiter)
`POST /api/materials`: Materialien hochladen.

`GET /api/materials`: Materialien abrufen.

#### Aufgabenmanagement
`POST /api/tasks`: Aufgabe erstellen.

`GET /api/tasks`: Aufgaben abrufen.

`POST /api/tasks/:id/submit`: Aufgabe einreichen.

# Tests
## Führen Sie Tests aus, um die Funktionalität zu überprüfen:
    npm test

## Lizenz
Dieses Projekt steht unter der MIT-Lizenz.


## Eigene Notizen
Um Projekt zu builden
    tsc

Um Tests zu durchlaufen
    npm test