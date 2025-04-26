import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RankingEntry } from '../ranking.component';

@Injectable({
  providedIn: 'root'
})
export class RankingService {
  private apiUrl = 'http://localhost:8081/api/ranking';

  constructor(private http: HttpClient) { }

  getRanking(): Observable<RankingEntry[]> {
    return this.http.get<RankingEntry[]>(this.apiUrl)
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
