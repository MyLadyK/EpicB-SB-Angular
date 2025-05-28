import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../model/user';

/**
 * Servicio de autenticación que maneja el login, registro y gestión de sesión de usuarios
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth'; // URL de tu API backend

  constructor(private http: HttpClient) { }

  /**
   * Autentica al usuario con el servidor
   * @param mailUser - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Observable con los datos del usuario y token JWT
   */
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

  /**
   * Guarda los datos del usuario en el localStorage
   * @param user - Datos del usuario a guardar
   */
  setSession(user: User) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  /**
   * Obtiene el usuario actual desde el localStorage
   * @returns User | null - Usuario actual o null si no hay sesión
   */
  getCurrentUser(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Cierra la sesión del usuario eliminando sus datos del localStorage
   */
  logout() {
    localStorage.removeItem('currentUser');
  }

  /**
   * Verifica si el usuario tiene rol de administrador
   * @param user - Usuario a verificar
   * @returns boolean - true si es admin, false si no
   */
  isAdmin(user: User): boolean {
    return !!(user && user.roleUser && typeof user.roleUser === 'string' && user.roleUser.toUpperCase() === 'ADMIN');
  }

  /**
   * Verifica si el usuario tiene rol de usuario normal
   * @param user - Usuario a verificar
   * @returns boolean - true si es usuario normal, false si no
   */
  isUser(user: User): boolean {
    return !!(user && user.roleUser && typeof user.roleUser === 'string' && user.roleUser.toUpperCase() === 'USER');
  }

  /**
   * Maneja los errores de las peticiones HTTP
   * @param error - Error HTTP recibido
   * @returns Observable con el mensaje de error
   * @private
   */
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
