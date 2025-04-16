import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FileUrlService {
  private readonly backendUrl = 'http://localhost:3000';

  constructor(private sanitizer: DomSanitizer,
            private http: HttpClient,
            private route: ActivatedRoute) {}

  getFileUrl(relativePath: string | SafeResourceUrl): SafeResourceUrl {
    // Wenn es bereits ein SafeResourceUrl ist, direkt zurückgeben
    if (typeof relativePath !== 'string') {
      return relativePath;
    }

    if (!relativePath) return this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');

    if (relativePath.startsWith('http')) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(relativePath);
    }

    // Bereinigung des Pfades
    let cleanPath = relativePath;
    
    // Entferne führende Slashes
    while (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    
    // Identifiziere UUID-basierte Dateinamen (z.B. 40de5b57-e5ba-4a43-8d74-6803771723f1-neuer_kurs_Teilnehmerliste.pdf)
    const uuidPattern = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:-.+)?\.pdf$/;
    const uuidMatch = cleanPath.match(uuidPattern);
    
    // Bei PDF-Dateien, die mit einer UUID beginnen, direkt auf die Datei im Root-Upload-Verzeichnis zugreifen
    if (cleanPath.endsWith('.pdf') && uuidMatch) {
      const fullUrl = `${this.backendUrl}/${cleanPath}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
    }
    
    // Bei nur einer UUID ohne Dateiendung, suchen wir nach UUID-basierten PDFs
    const uuidOnlyPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    if (uuidOnlyPattern.test(cleanPath)) {
      // Da kein direkter Zugriff auf UUID möglich ist, nehmen wir an, dass es eine PDF mit dieser UUID ist
      const fullUrl = `${this.backendUrl}/${cleanPath}.pdf`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
    }
    
    // Verarbeite Dateien in Unterverzeichnissen (courseDocuments, taskDocuments, usw.)
    if (cleanPath.includes('/')) {
      const parts = cleanPath.split('/');
      const directory = parts[0];
      const filename = parts.slice(1).join('/');
      
      if (directory === 'courseDocuments' || directory === 'taskDocuments' || directory === 'submissions') {
        const apiUrl = `${this.backendUrl}/api/files/${directory}/${filename}`;
        return this.sanitizer.bypassSecurityTrustResourceUrl(apiUrl);
      }
    }
    
    // Fallback: Datei direkt im uploads-Verzeichnis
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${this.backendUrl}/${cleanPath}`);
  }
}
