import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BattleResult } from '../model/battle-result';

@Injectable({
  providedIn: 'root'
})
export class BattleService {

  private apiUrl = 'http://localhost:8081/api/battles'; // URL de tu API backend

  constructor(private http: HttpClient) { }

  fight(battleData: any): Observable<BattleResult> {
    return this.http.post<BattleResult>(`${this.apiUrl}/fight`, battleData);
  }
}
