import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BattleResult } from '../model/battle-result';
import { BattleSummary } from '../model/battle-summary';

@Injectable({
  providedIn: 'root'
})
export class BattleService {
  private apiUrl = 'http://localhost:8081/api/battles'; // URL de tu API backend

  constructor(private http: HttpClient) { }

  fight(battleData: BattleResult): Observable<BattleResult> {
    return this.http.post<BattleResult>(`${this.apiUrl}/fight`, battleData)
      .pipe(catchError(this.handleError));
  }

  fightSummary(battleData: any): Observable<BattleSummary> {
    return this.http.post<BattleSummary>(`${this.apiUrl}/fight/summary`, battleData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene el historial de batallas de un usuario por su id (participa como user1 o user2).
   */
  getBattlesByUser(userId: number): Observable<BattleResult[]> {
    return this.http.get<BattleResult[]>(`${this.apiUrl}/user/${userId}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMsg = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error de cliente o red
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
