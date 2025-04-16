# Lernmanagementsystem (LMS) für Bildungseinrichtungen

## Beschreibung
Das Lernmanagementsystem (LMS) ermöglicht:
- **Dozenten**, Kursmaterialien hochzuladen und Aufgaben zu erstellen.
- **Studenten**, Inhalte und Aufgaben einzusehen sowie ihre Leistungen zu verwalten.
- **Kursleiter**, die Verwaltung von Studenten und Kursen durchzuführen.

Das System unterstützt mehrere Benutzerrollen, Mehrsprachigkeit und Datenexport.

---

## Benutzerrollen und Berechtigungen
### **1. Administrator (Admin)**
- Verwaltung der Plattform, Benutzer und Berechtigungen.
- Hinzufügen/Löschen von Kursen, Dozenten und Studierenden.
- Export von Systemdaten und Berichten.

### **2. Kursleiter**
- Erstellung und Verwaltung von Kursen.
- Einsicht und Verwaltung der Teilnehmerlisten.
- Verteilung von Aufgaben und Bewertung der Ergebnisse.

### **3. Dozent**
- Hochladen und Organisieren von Lernmaterialien.
- Erstellung und Veröffentlichung von Aufgaben.
- Verwaltung der Kursstruktur.

### **4. Student**
- Zugriff auf zugewiesene Kurse und Inhalte.
- Abgabe von Aufgaben.
- Einsehen von Bewertungen und Kommentaren.

---

## Kernfunktionen des LMS
### **Für Dozenten und Kursleiter**
- **Kursmanagement:**
  - Erstellen, Bearbeiten und Löschen von Kursen.
  - Hinzufügen und Verwalten von Teilnehmern.
  - Übersicht der Kursaktivitäten.
- **Materialmanagement:**
  - Hochladen und Organisieren von Lernmaterialien (PDFs).
  - Zuweisung von Materialien zu spezifischen Modulen oder Themen.
- **Aufgabenmanagement:**
  - Erstellung von Aufgaben mit Deadlines.
  - Einsicht und Bewertung eingereichter Aufgaben.
  - Kommentierung von Studentenarbeiten.

### **Für Studenten**
- **Kurszugriff:**
  - Anzeigen von Kursinhalten und Aufgaben.
  - Herunterladen von Materialien.
  - Abgabe von Aufgaben.
- **Fortschrittsübersicht:**
  - Einsehen von Bewertungen und Feedback zu abgegebenen Aufgaben.
  - Übersicht der eigenen Leistungen.

### **Für Admins**
- **Benutzer- und Rollenverwaltung:**
  - Hinzufügen, Bearbeiten und Löschen von Benutzern und deren Rollen.
- **Systemkonfiguration:**
  - Einstellungen zu Sprache, Exportformaten und anderen systemweiten Funktionen.

---

## Technischer Entwurf
### **Datenbankmodell (ER-Diagramm)**

#### Entitäten:
- **User**
  - `ID` (Primary Key)
  - `Name`
  - `Email`
  - `Password` (verschlüsselt)
  - `Role` (enum: 'Admin', 'Kursleiter', 'Dozent', 'Sekretärin', 'Student')
  - `LastLogin` (DateTime)
- **Course**
  - `ID` (Primary Key)
  - `Name`
  - `Description`
  - `CreatedBy` (Foreign Key: User)
- **Material**
  - `ID` (Primary Key)
  - `Title`
  - `FileURL`
  - `CourseID` (Foreign Key)
- **Task**
  - `ID` (Primary Key)
  - `Title`
  - `Description`
  - `Deadline`
  - `CourseID` (Foreign Key)
  - `CreatedBy` (Foreign Key: User)
- **Submission**
  - `ID` (Primary Key)
  - `TaskID` (Foreign Key)
  - `SubmittedBy` (Foreign Key: User)
  - `Grade` (optional)
  - `Feedback` (optional)
  - `SubmissionDate` (DateTime)

---

## API-Endpunkte

### **/api/auth**
- `POST /register`: Registrierung eines neuen Nutzers.
- `POST /login`: Authentifizierung und Token-Generierung.
- `POST /logout`: Token invalidieren.

### **/api/courses**
- `POST /`: Kurs erstellen (Admin, Kursleiter).
- `GET /`: Kurse anzeigen (rollenabhängig).
- `PUT /:id`: Kurs bearbeiten (Kursleiter).
- `DELETE /:id`: Kurs löschen (Admin, Kursleiter).

### **/api/materials**
- `POST /upload`: Hochladen von Materialien (Dozent, Kursleiter).
- `GET /course/:id`: Materialien eines Kurses abrufen.
- `DELETE /:id`: Material löschen (Dozent, Kursleiter).

### **/api/tasks**
- `POST /`: Aufgabe erstellen (Dozent, Kursleiter).
- `GET /course/:id`: Aufgaben eines Kurses abrufen.
- `PUT /grade/:id`: Aufgabe bewerten (Dozent, Kursleiter).

### **/api/students**
- `POST /enroll`: Student in einen Kurs einschreiben (Sekretärin, Admin).
- `GET /course/:id`: Teilnehmer eines Kurses anzeigen (Sekretärin, Kursleiter).

---

## Wie die Anforderungen umgesetzt werden
- **Vier Hauptrollen:**  
  Klare Trennung der Verantwortlichkeiten.
- **Mehrsprachigkeit:**  
  Unterstützung von Deutsch und Englisch.
- **Datenexport:**  
  Export von Kurslisten und Teilnehmerdaten in CSV/PDF.
- **Sicherheitskonzept:**  
  Rollenbasierte Zugriffskontrolle, JWT-Authentifizierung, automatische Abmeldung nach 7 Tagen.

---

## Vorteile des Projekts
- **Relevanz:**  
  LMS-Systeme sind zentrale Werkzeuge in Bildungseinrichtungen.
- **Modularität:**  
  Klare Aufgabenbereiche erleichtern die Entwicklung.
- **Erweiterbarkeit:**  
  Funktionen wie Chats, Foren oder Kalender können ergänzt werden.
- **Komplexität:**  
  Eine gute Balance zwischen Herausforderung und Umsetzbarkeit.

Dieses Projekt bildet eine solide Grundlage für zukünftige Weiterentwicklungen und zeigt die praktische Relevanz der erlernten Fähigkeiten.
