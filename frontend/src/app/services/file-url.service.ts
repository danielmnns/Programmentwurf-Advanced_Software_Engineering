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

  getFileUrl(relativePath: string): SafeResourceUrl {
    if (!relativePath) return '';

    if (relativePath.startsWith('http')) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(relativePath);
    }

    // Bereinigung des Pfades
    let cleanPath = relativePath;
    
    // Entferne führende Slashes
    while (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    
    // Entferne 'uploads/' Prefix, falls vorhanden
    if (cleanPath.startsWith('uploads/')) {
      cleanPath = cleanPath.substring(8);
    }
    
    // Erstelle den korrekten API-Pfad
    const apiUrl = `${this.backendUrl}/uploads/${cleanPath}`;
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(apiUrl);
  }
}
