import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth'; // URL de tu API backend

  constructor(private http: HttpClient) { }

  authenticate(mailUser: string, password: string): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/login`, { mailUser, password })
      .pipe(
        map((resp: any) => ({
          ...resp,
          roleUser: resp.role || resp.roleUser, // asegúrate de que roleUser siempre esté presente
          token: resp.token // <-- añade el JWT si viene del backend
        })),
        catchError(this.handleError)
      );
  }

  isAdmin(user: User): boolean {
    return !!(user && user.roleUser && typeof user.roleUser === 'string' && user.roleUser.toUpperCase() === 'ADMIN');
  }

  isUser(user: User): boolean {
    return !!(user && user.roleUser && typeof user.roleUser === 'string' && user.roleUser.toUpperCase() === 'USER');
  }

  // Manejo de sesión en localStorage
  setSession(user: User) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  logout() {
    localStorage.removeItem('currentUser');
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
