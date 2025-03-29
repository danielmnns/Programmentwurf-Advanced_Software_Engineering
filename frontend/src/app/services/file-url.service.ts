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

    const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

    const apiUrl = `${this.backendUrl}/uploads${path}`;

    console.log(`Created file URL: ${apiUrl}`);
    return this.sanitizer.bypassSecurityTrustResourceUrl(apiUrl);
  }
}
