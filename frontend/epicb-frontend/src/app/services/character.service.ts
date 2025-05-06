import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Character } from '../model/character';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private baseUrl = 'http://localhost:8081/api/characters';

  constructor(private http: HttpClient) {}

  getCharacters(): Observable<Character[]> {
    return this.http.get<Character[]>(this.baseUrl).pipe(catchError(this.handleError));
  }

  updateCharacter(character: Character): Observable<Character> {
    return this.http.put<Character>(`${this.baseUrl}/${character.idCharacter}`, character).pipe(catchError(this.handleError));
  }

  deleteCharacter(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError));
  }

  addCharacter(character: Character): Observable<Character> {
    return this.http.post<Character>(this.baseUrl, character).pipe(catchError(this.handleError));
  }

  uploadImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ imageUrl: string }>(`${this.baseUrl}/upload`, formData, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
    }).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMsg = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMsg = `Error de red: ${error.error.message}`;
    } else if (error.status === 404) {
      errorMsg = error.error || 'Recurso no encontrado';
    } else if (error.status === 400) {
      errorMsg = error.error || 'Datos inválidos';
    } else if (error.status === 0) {
      errorMsg = 'No se pudo conectar con el servidor';
    } else {
      errorMsg = error.error || 'Error inesperado en el servidor';
    }
    return throwError(() => errorMsg);
  }
}
