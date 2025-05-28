import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const user = this.authService.getCurrentUser();
    // Refuerzo: busca el token en varias posibles propiedades
    // Cast a any para evitar errores TS2339 y mantener compatibilidad
    const token = user?.token || (user as any)?.accessToken || (user as any)?.jwt || null;

    let jwtReq = req;
    if (token) {
      jwtReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(jwtReq);
  }
}
