# Backlog für Lernmanagementsystem (LMS) für Bildungseinrichtungen

## Epics

### 1. Benutzerverwaltung
- **Story:** Als Administrator möchte ich Benutzer hinzufügen, bearbeiten und löschen können, um die Plattform effektiv zu verwalten.
- **Akzeptanzkriterien:**
  - Benutzer hinzufügen, bearbeiten und löschen
  - Rollen zuweisen
  - Benutzerprofil-Ansicht
  - Passwort-Verschlüsselung und Authentifizierung

### 2. Kursmanagement
- **Story:** Als Kursleiter und Dozent möchte ich Kurse erstellen, bearbeiten und löschen können, um die Lerninhalte zu organisieren.
- **Akzeptanzkriterien:**
  - Kurs erstellen, bearbeiten und löschen
  - Teilnehmer hinzufügen und verwalten
  - Kursübersicht anzeigen

### 3. Materialmanagement
- **Story:** Als Dozent möchte ich Lernmaterialien hochladen und organisieren können, um die Inhalte für die Studenten bereitzustellen.
- **Akzeptanzkriterien:**
  - Materialien hochladen und löschen
  - Materialien zu Kursen zuweisen
  - Materialien anzeigen und herunterladen

### 4. Aufgabenmanagement
- **Story:** Als Dozent möchte ich Aufgaben erstellen und bewerten können, um den Lernfortschritt der Studenten zu überwachen.
- **Akzeptanzkriterien:**
  - Aufgaben erstellen, bearbeiten und löschen
  - Aufgaben zu Kursen zuweisen
  - Aufgaben einsehen und bewerten

### 5. Studentenverwaltung
- **Story:** Als Sekretärin möchte ich Studentenprofile verwalten und diese in Kurse einschreiben können, um die administrative Verwaltung zu unterstützen.
- **Akzeptanzkriterien:**
  - Studentenprofile hinzufügen, bearbeiten und löschen
  - Studenten in Kurse einschreiben
  - Studentenübersicht anzeigen

### 6. Authentifizierung und Autorisierung
- **Story:** Als Benutzer möchte ich mich sicher anmelden und abmelden können, um meine Daten zu schützen.
- **Akzeptanzkriterien:**
  - Registrierung und Login
  - Token-basierte Authentifizierung (JWT)
  - Rollenbasierte Zugriffskontrolle

### 7. Mehrsprachigkeit
- **Story:** Als Benutzer möchte ich die Plattform in verschiedenen Sprachen nutzen können, um die Barrierefreiheit zu verbessern.
- **Akzeptanzkriterien:**
  - Unterstützung für Deutsch und Englisch
  - Sprachumschaltung in der Benutzeroberfläche

### 8. Datenexport
- **Story:** Als Benutzer möchte ich Kurslisten und Teilnehmerdaten exportieren können, um die Daten extern zu nutzen.
- **Akzeptanzkriterien:**
  - Export als CSV oder PDF
  - Auswahl von Datenbereichen für den Export

## Stories

### Benutzerverwaltung
1. **Story:** Als Admin möchte ich neue Benutzer registrieren können.
   - **Akzeptanzkriterien:** Registrierung über Formular, Validierung der Eingaben
2. **Story:** Als Admin möchte ich bestehende Benutzer bearbeiten können.
   - **Akzeptanzkriterien:** Bearbeitung der Benutzerdaten, Speichern der Änderungen
3. **Story:** Als Admin möchte ich Benutzer löschen können.
   - **Akzeptanzkriterien:** Bestätigung vor dem Löschen, Benutzer dauerhaft entfernen

### Kursmanagement
1. **Story:** Als Kursleiter möchte ich einen neuen Kurs erstellen können.
   - **Akzeptanzkriterien:** Eingabe von Kursdetails, Speichern des Kurses
2. **Story:** Als Kursleiter möchte ich einen Kurs bearbeiten können.
   - **Akzeptanzkriterien:** Bearbeitung der Kursdetails, Speichern der Änderungen
3. **Story:** Als Kursleiter möchte ich einen Kurs löschen können.
   - **Akzeptanzkriterien:** Bestätigung vor dem Löschen, Kurs dauerhaft entfernen

### Materialmanagement
1. **Story:** Als Dozent möchte ich Lernmaterialien hochladen können.
   - **Akzeptanzkriterien:** Upload-Funktion, Zuordnung zu Kursen
2. **Story:** Als Dozent möchte ich Materialien organisieren können.
   - **Akzeptanzkriterien:** Strukturierung nach Modulen oder Themen
3. **Story:** Als Dozent möchte ich Materialien löschen können.
   - **Akzeptanzkriterien:** Bestätigung vor dem Löschen, Material dauerhaft entfernen

### Aufgabenmanagement
1. **Story:** Als Dozent möchte ich eine neue Aufgabe erstellen können.
   - **Akzeptanzkriterien:** Eingabe von Aufgabendetails, Festlegung einer Deadline
2. **Story:** Als Dozent möchte ich eingereichte Aufgaben bewerten können.
   - **Akzeptanzkriterien:** Einsicht der Einreichungen, Bewertung und Feedback

### Studentenverwaltung
1. **Story:** Als Admin möchte ich neue Studentenprofile erstellen können.
   - **Akzeptanzkriterien:** Eingabe von Studentendaten, Speichern des Profils
2. **Story:** Als Kursleiter möchte ich Studenten in Kurse einschreiben können.
   - **Akzeptanzkriterien:** Auswahl von Kursen, Zuweisung zu Studenten
3. **Story:** Als Kursleiter möchte ich Studentenprofile bearbeiten können.
   - **Akzeptanzkriterien:** Bearbeitung der Profildaten, Speichern der Änderungen

### Authentifizierung und Autorisierung
1. **Story:** Als Benutzer möchte ich mich registrieren können.
   - **Akzeptanzkriterien:** Eingabe von Benutzerdaten, Validierung und Speicherung
2. **Story:** Als Benutzer möchte ich mich sicher anmelden können.
   - **Akzeptanzkriterien:** Eingabe von E-Mail und Passwort, Token-Generierung
3. **Story:** Als Benutzer möchte ich mich abmelden können.
   - **Akzeptanzkriterien:** Token invalidieren, Benutzer abmelden

### Mehrsprachigkeit
1. **Story:** Als Benutzer möchte ich die Sprache der Plattform ändern können.
   - **Akzeptanzkriterien:** Sprachumschaltung, Übersetzung der Inhalte

### Datenexport
1. **Story:** Als Benutzer möchte ich Kursdaten exportieren können.
   - **Akzeptanzkriterien:** Auswahl von Kursen, Export als CSV/PDF
2. **Story:** Als Benutzer möchte ich Teilnehmerdaten exportieren können.
   - **Akzeptanzkriterien:** Auswahl von Teilnehmern, Export als CSV/PDF

## Technischer Entwurf
### Datenbankmodell (ER-Diagramm)
- Entitäten und deren Attribute:
  - **User:** ID, Name, Email, Password, Role, LastLogin
  - **Course:** ID, Name, Description, CreatedBy
  - **Material:** ID, Title, FileURL, CourseID
  - **Task:** ID, Title, Description, Deadline, CourseID, CreatedBy
  - **Submission:** ID, TaskID, SubmittedBy, Grade, Feedback, SubmissionDate

## API-Endpunkte
### /api/auth
- `POST /register`: Registrierung eines neuen Nutzers.
- `POST /login`: Authentifizierung und Token-Generierung.
- `POST /logout`: Token invalidieren.

### /api/courses
- `POST /`: Kurs erstellen (Admin, Kursleiter).
- `GET /`: Kurse anzeigen (rollenabhängig).
- `PUT /:id`: Kurs bearbeiten (Kursleiter).
- `DELETE /:id`: Kurs löschen (Admin, Kursleiter).

### /api/materials
- `POST /upload`: Hochladen von Materialien (Dozent, Kursleiter).
- `GET /course/:id`: Materialien eines Kurses abrufen.
- `DELETE /:id`: Material löschen (Dozent, Kursleiter).

### /api/tasks
- `POST /`: Aufgabe erstellen (Dozent, Kursleiter).
- `GET /course/:id`: Aufgaben eines Kurses abrufen.
- `PUT /grade/:id`: Aufgabe bewerten (Dozent, Kursleiter).

### /api/students
- `POST /enroll`: Student in einen Kurs einschreiben (Sekretärin, Admin).
- `GET /course/:id`: Teilnehmer eines Kurses anzeigen (Sekretärin, Kursleiter).
