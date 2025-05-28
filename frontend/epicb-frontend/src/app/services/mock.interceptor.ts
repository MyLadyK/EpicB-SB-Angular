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
        // Solo activamos demo mode si hay un error de conexión o el servidor no está disponible
        if (error.status === 0 || error.status === 503 || error.status === 504) {
          this.demoModeService.setDemoMode(true);
        }
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
          // Extraer los datos de la batalla del cuerpo de la solicitud
          const battleData = req.body;

          // Obtener los nombres de usuario de la solicitud o usar valores predeterminados
          let user1Name = 'Usuario1';
          let user2Name = 'Usuario2';

          // Si hay datos de batalla, intentar obtener los nombres de usuario reales
          if (battleData && battleData.user1Id && battleData.user2Id) {
            // Usar nombres más descriptivos basados en los IDs
            const realNames = [
              'Carlos', 'Ana', 'Miguel', 'Laura', 'Javier', 'Sofía',
              'David', 'Elena', 'Pablo', 'Lucía', 'Alejandro', 'Marta'
            ];

            // Usar un nombre real basado en el ID (para que sea consistente)
            const index1 = battleData.user1Id % realNames.length;
            const index2 = battleData.user2Id % realNames.length;

            user1Name = realNames[index1];
            user2Name = realNames[index2];
          }

          // Determinar aleatoriamente quién gana la batalla
          const randomWinner = Math.random() < 0.5;
          const winnerName = randomWinner ? user1Name : user2Name;
          const loserName = randomWinner ? user2Name : user1Name;

          // Establecer la salud final según el ganador
          const finalHealth1 = randomWinner ? 34 : 0;
          const finalHealth2 = randomWinner ? 0 : 34;

          // Crear eventos de batalla más variados
          const events = [];

          // Primer ataque
          events.push(user1Name + ' ataca a ' + user2Name + ' por 20 de daño');

          // Segundo ataque con probabilidad de crítico
          if (Math.random() < 0.7) {
            events.push(user2Name + ' realiza un golpe crítico');
          } else {
            events.push(user2Name + ' ataca a ' + user1Name + ' por 15 de daño');
          }

          // Tercer ataque con probabilidad de habilidad especial
          if (Math.random() < 0.6) {
            events.push(user1Name + ' usa habilidad especial');
          } else {
            events.push(user1Name + ' ataca a ' + user2Name + ' por 18 de daño');
          }

          // Evento final de victoria
          events.push(winnerName + ' gana la batalla y obtiene un paquete sorpresa');

          const mockSummary = {
            winnerName: winnerName,
            finalHealth1: finalHealth1,
            finalHealth2: finalHealth2,
            events: events,
            pointsAwarded: 20 // Puntos otorgados al ganador (20 puntos)
          };
          return of(new HttpResponse({ status: 200, body: mockSummary })).pipe(delay(1000));
        }
        // Si no es un endpoint mockeado, devolver el error original
        return throwError(() => error);
      })
    );
  }
}
