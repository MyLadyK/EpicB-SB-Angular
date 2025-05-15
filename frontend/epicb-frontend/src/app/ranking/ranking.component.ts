import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RankingService } from '../services/ranking.service';
import { BattleService } from '../services/battle.service';
import { User } from '../model/user';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})
export class RankingComponent implements OnInit {
  users: User[] = [];
  currentUser: User | null = null;
  battleResult: any = null;
  loading = false;
  error = '';

  constructor(
    private rankingService: RankingService,
    private battleService: BattleService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadRanking();
    this.currentUser = this.authService.getCurrentUser();
  }

  loadRanking(): void {
    this.loading = true;
    this.rankingService.getUserRanking().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el ranking';
        this.loading = false;
        console.error(err);
      }
    });
  }

  startBattle(opponentId: number): void {
    if (!this.currentUser) {
      this.error = 'Debes iniciar sesión para batallar';
      return;
    }

    this.loading = true;
    this.battleResult = null;
    this.error = '';

    this.battleService.startBattle(opponentId).subscribe({
      next: (result) => {
        this.battleResult = result;
        this.loading = false;
        // Recargar el ranking para mostrar los puntos actualizados
        this.loadRanking();
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al iniciar la batalla';
        this.loading = false;
        console.error(err);
      }
    });
  }

  canBattle(user: User): boolean {
    return this.currentUser !== null && this.currentUser.idUser !== user.idUser;
  }
}
