import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { DemoModeService } from '../demo-mode.service';

@Injectable()
export class MockInterceptor implements HttpInterceptor {
  constructor(private demoModeService: DemoModeService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si interceptamos, activamos demo mode
        this.demoModeService.setDemoMode(true);
        // Simular datos mock para el ranking
        if (req.url.endsWith('/api/ranking')) {
          const mockRanking = [
            { userName: 'DemoUser1', points: 120 },
            { userName: 'DemoUser2', points: 90 },
            { userName: 'DemoUser3', points: 60 }
          ];
          return of(new HttpResponse({ status: 200, body: mockRanking })).pipe(delay(800));
        }
        // Simular datos mock para login
        if (req.url.endsWith('/api/auth/login')) {
          const { mailUser, passwordHash } = req.body;
          // Simple lógica demo: si el mail es admin@demo.com, es ADMIN
          if (mailUser === 'admin@demo.com') {
            return of(new HttpResponse({ status: 200, body: {
              id: 99,
              name: 'Admin Demo',
              mailUser,
              passwordHash,
              role: 'ADMIN',
              energy: 99,
              lastEnergyRefill: new Date().toISOString(),
              pointsUser: 999
            }})).pipe(delay(600));
          } else {
            return of(new HttpResponse({ status: 200, body: {
              id: 1,
              name: 'Usuario Demo',
              mailUser,
              passwordHash,
              role: 'USER',
              energy: 8,
              lastEnergyRefill: new Date().toISOString(),
              pointsUser: 42
            }})).pipe(delay(600));
          }
        }
        // Simular datos mock para el resumen de batalla
        if (req.url.endsWith('/api/battles/fight/summary')) {
          const mockSummary = {
            winnerName: 'DemoUser1',
            finalHealth1: 34,
            finalHealth2: 0,
            events: [
              'DemoUser1 ataca a DemoUser2 por 20 de daño',
              'DemoUser2 realiza un golpe crítico',
              'DemoUser1 usa habilidad especial',
              'DemoUser1 gana la batalla y obtiene un paquete sorpresa'
            ]
          };
          return of(new HttpResponse({ status: 200, body: mockSummary })).pipe(delay(1000));
        }
        // Si no es un endpoint mockeado, devolver el error original
        return throwError(() => error);
      })
    );
  }
}
