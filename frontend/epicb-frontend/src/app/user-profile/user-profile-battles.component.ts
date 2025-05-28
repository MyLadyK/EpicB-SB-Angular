import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattleResult } from '../model/battle-result';
import { BattleService } from '../services/battle.service';

@Component({
  standalone: true,
  selector: 'app-user-profile-battles',
  templateUrl: './user-profile-battles.component.html',
  styleUrls: ['./user-profile-battles.component.css'],
  imports: [CommonModule]
})
export class UserProfileBattlesComponent implements OnInit {
  @Input() userId!: number;
  battles: BattleResult[] = [];
  error: string | null = null;
  loading: boolean = false;

  constructor(private battleService: BattleService) {}

  ngOnInit(): void {
    console.log('UserProfileBattlesComponent initialized with userId:', this.userId);
    if (this.userId) {
      this.loadBattles();
    } else {
      console.error('No userId provided to UserProfileBattlesComponent');
    }
  }

  private isValidBattle(battle: any): boolean {
    return !!(
      battle &&
      battle.idBattleResult &&
      (battle.user1?.idUser || typeof battle.user1 === 'number') &&
      (battle.user2?.idUser || typeof battle.user2 === 'number') &&
      (battle.winner?.idUser || typeof battle.winner === 'number')
    );
  }

  private loadBattles(): void {
    console.log('Loading battles for userId:', this.userId);
    this.loading = true;
    this.error = null;

    this.battleService.getBattlesByUser(this.userId).subscribe({
      next: (battles: any[]) => {
        console.log('Received battles:', battles);
        if (battles && Array.isArray(battles)) {
          this.battles = battles
            .filter(battle => this.isValidBattle(battle))
            .map(battle => {
              try {
                const parsedDate = battle.battleDate ? new Date(battle.battleDate) : new Date();
                
                // Determinar si el usuario actual es el ganador
                const winnerId = typeof battle.winner === 'number' ? battle.winner : battle.winner?.idUser;
                const isCurrentUserWinner = winnerId === this.userId;
                
                // Determinar si el usuario actual es user1
                const user1Id = typeof battle.user1 === 'number' ? battle.user1 : battle.user1?.idUser;
                const user2Id = typeof battle.user2 === 'number' ? battle.user2 : battle.user2?.idUser;
                const isUser1 = user1Id === this.userId;

                // Calcular el nombre del oponente
                let opponentName = battle.opponentName;
                if (!opponentName) {
                  if (isUser1 && battle.user2?.nameUser) {
                    opponentName = battle.user2.nameUser;
                  } else if (!isUser1 && battle.user1?.nameUser) {
                    opponentName = battle.user1.nameUser;
                  } else {
                    opponentName = 'Oponente desconocido';
                  }
                }

                // Determinar el resultado y los puntos
                const result = isCurrentUserWinner ? 'WIN' : 'LOSE';
                const battlePoints = isCurrentUserWinner ? 20 : -8;

                return {
                  ...battle,
                  battleDate: parsedDate,
                  opponentName,
                  result,
                  battlePoints,
                  user1: typeof battle.user1 === 'number' ? { idUser: battle.user1 } : battle.user1,
                  user2: typeof battle.user2 === 'number' ? { idUser: battle.user2 } : battle.user2,
                  winner: typeof battle.winner === 'number' ? { idUser: battle.winner } : battle.winner
                } as BattleResult;
              } catch (error) {
                console.error('Error processing battle:', error, battle);
                return null;
              }
            })
            .filter((battle): battle is BattleResult => battle !== null)
            .sort((a, b) => {
              const dateA = a.battleDate ? a.battleDate.getTime() : 0;
              const dateB = b.battleDate ? b.battleDate.getTime() : 0;
              return dateB - dateA;
            });

          console.log('Processed battles:', this.battles);
          
          if (this.battles.length === 0) {
            this.error = 'No se encontraron batallas válidas';
          }
        } else {
          console.error('Received invalid battles data:', battles);
          this.error = 'Formato de datos inválido';
          this.battles = [];
        }
      },
      error: (error) => {
        console.error('Error al cargar las batallas:', error);
        this.error = 'No se pudieron cargar las batallas';
        this.battles = [];
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // Método para recargar las batallas
  reloadBattles(): void {
    this.loadBattles();
  }

  // Método para formatear la fecha
  formatBattleDate(battle: BattleResult): string {
    if (!battle.battleDate) {
      return 'Fecha no disponible';
    }

    try {
      return battle.battleDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha no disponible';
    }
  }
}
