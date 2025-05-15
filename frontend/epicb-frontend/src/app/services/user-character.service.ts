import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserCharacterService {
  private apiUrl = environment.apiURL + '/user-characters';

  constructor(private http: HttpClient) {}

  getMyCollection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mine`);
  }

  addCharacterToCollection(characterId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/add/${characterId}`, {});
  }

  removeCharacterFromCollection(characterId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove/${characterId}`);
  }
}
