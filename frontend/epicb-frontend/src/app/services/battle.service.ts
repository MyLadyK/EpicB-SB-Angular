import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { BattleResult } from '../model/battle-result';
import { BattleSummary } from '../model/battle-summary';
import { UserCharacter } from '../model/user-character';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BattleService {
  private apiUrl = environment.apiURL + '/battles';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Inicia una batalla contra otro usuario
   * @param opponentId ID del usuario oponente
   */
  startBattle(opponentId: number): Observable<BattleResult> {
    return this.http.post<BattleResult>(`${this.apiUrl}/start/${opponentId}`, {}).pipe(
      map(response => {
        // Asegurarse de que los datos estén en el formato correcto
        const result: BattleResult = {
          idBattleResult: response.idBattleResult,
          user1: response.user1,
          user2: response.user2,
          winner: response.winner,
          events: response.events || [],
          finalHealth1: response.finalHealth1 || 100,
          finalHealth2: response.finalHealth2 || 100,
          battleDate: response.battleDate,
          date: response.date,
          opponentName: response.opponentName,
          result: response.result,
          pointsGained: response.winner.idUser === response.user1.idUser ? 20 : -8,
          pointsLost: response.winner.idUser === response.user1.idUser ? -8 : 20,
          surprisePackageDescription: response.surprisePackageDescription
        };
        return result;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error al iniciar la batalla:', error);
        throw error;
      })
    );
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
  fight(character1: UserCharacter, character2: UserCharacter, opponentId: number): Observable<BattleResult> {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !currentUser.idUser) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    // Validar que no se está intentando luchar contra uno mismo
    if (currentUser.idUser === opponentId) {
      return throwError(() => new Error('No puedes luchar contra ti mismo'));
    }

    console.log('BattleService - fight - currentUser:', currentUser);
    console.log('BattleService - fight - opponentId:', opponentId);
    
    const battleData = {
      user1Id: currentUser.idUser,
      user2Id: opponentId,
      userCharacter1Id: character1.idUserCharacter,
      userCharacter2Id: character2.idUserCharacter
    };

    console.log('BattleService - fight - battleData:', battleData);

    return this.http.post<BattleResult>(`${this.apiUrl}/fight`, battleData)
      .pipe(
        map(response => {
          if (!response || !response.events) {
            throw new Error('Respuesta de batalla inválida');
          }
          return response;
        }),
        catchError(this.handleError)
      );
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
    return throwError(() => new Error(errorMsg));
  }
}
