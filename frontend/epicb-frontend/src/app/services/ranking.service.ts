import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class RankingService {
  private apiUrl = environment.apiURL + '/users';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene el ranking de usuarios ordenados por puntos
   */
  getUserRanking(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/ranking`);
  }

  /**
   * Alias para getUserRanking para mantener compatibilidad con componentes existentes
   */
  getRanking(): Observable<any> {
    return this.getUserRanking();
  }
}
