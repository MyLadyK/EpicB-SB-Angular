import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserCharacterService {
  private apiUrl = environment.apiURL + '/user-characters';

  constructor(private http: HttpClient) {}

  // El token JWT se añade automáticamente por el interceptor JwtInterceptor
  getMyCollection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mine`);
  }

  // El token JWT se añade automáticamente por el interceptor JwtInterceptor
  addCharacterToCollection(characterId: number): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${this.apiUrl}/add/${characterId}`, {});
  }

  // El token JWT se añade automáticamente por el interceptor JwtInterceptor
  removeCharacterFromCollection(characterId: number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.apiUrl}/remove/${characterId}`);
  }
}
