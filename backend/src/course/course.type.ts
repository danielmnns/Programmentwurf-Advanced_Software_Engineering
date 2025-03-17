export interface Course {
  title: string;
  description: string;
  dozent: string; // Referenz auf den Dozenten
  enrolled?: string[]; // Liste der eingeschriebenen Benutzer
  tasks?: string[]; // Liste der Aufgaben
  isVisible?: boolean; // Sichtbarkeit des Kurses
  createdAt?: Date; // Erstellungsdatum
  updatedAt?: Date; // Aktualisierungsdatum
}

export interface Document {
  name: string;
  url: string;
}