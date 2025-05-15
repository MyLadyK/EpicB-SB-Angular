import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { BattleResult } from '../model/battle-result';
import { BattleSummary } from '../model/battle-summary';

@Injectable({
  providedIn: 'root'
})
export class BattleService {
  private apiUrl = environment.apiURL + '/battles';

  constructor(private http: HttpClient) { }

  /**
   * Inicia una batalla contra otro usuario
   * @param opponentId ID del usuario oponente
   */
  startBattle(opponentId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/start/${opponentId}`, {});
  }

  /**
   * Obtiene los resultados de las batallas del usuario autenticado
   */
  getBattleResults(): Observable<any> {
    return this.http.get(`${this.apiUrl}/results`);
  }

  /**
   * Obtiene las batallas de un usuario específico
   * @param userId ID del usuario
   */
  getBattlesByUser(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Inicia una batalla entre dos personajes
   * @param battleData Datos de la batalla
   */
  fight(battleData: any): Observable<BattleResult> {
    return this.http.post<BattleResult>(`${this.apiUrl}/fight`, battleData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene un resumen de la batalla
   * @param battleData Datos de la batalla
   */
  fightSummary(battleData: any): Observable<BattleSummary> {
    return this.http.post<BattleSummary>(`${this.apiUrl}/fight/summary`, battleData)
      .pipe(catchError(this.handleError));
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
