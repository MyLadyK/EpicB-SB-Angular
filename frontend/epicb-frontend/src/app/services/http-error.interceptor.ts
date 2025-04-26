import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from './notification.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private notificationService: NotificationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
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
        this.notificationService.showError(errorMsg);
        return throwError(() => errorMsg);
      })
    );
  }
}
