import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Character } from '../model/character';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private baseUrl = 'http://localhost:3000/api/characters';

  constructor(private http: HttpClient) {}

  getCharacters(): Observable<Character[]> {
    return this.http.get<Character[]>(this.baseUrl);
  }

  updateCharacter(character: Character): Observable<Character> {
    return this.http.put<Character>(`${this.baseUrl}/${character.idCharacter}`, character);
  }

  deleteCharacter(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ imageUrl: string }>(`${this.baseUrl}/upload`, formData, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    });
  }
}
