import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth'; // URL de tu API backend

  constructor(private http: HttpClient) { }

  authenticate(mailUser: string, passwordHash: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { mailUser, passwordHash });
  }
}
