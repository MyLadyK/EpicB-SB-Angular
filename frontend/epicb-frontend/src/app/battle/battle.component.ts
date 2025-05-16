import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Character } from '../model/character';
import { User } from '../model/user';
import { CharacterService } from '../services/character.service';
import { UserCharacterService } from '../services/user-character.service';
import { AuthService } from '../services/auth.service';
import { BattleService } from '../services/battle.service';
import { BattleResult } from '../model/battle-result';
import { Observable } from 'rxjs';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  selector: 'app-battle',
  templateUrl: './battle.component.html',
  styleUrls: ['./battle.component.css'],
  providers: [BattleService, CharacterService, UserCharacterService, AuthService],
  animations: [
    trigger('fadeInEvent', [
      state('hidden', style({ opacity: 0, transform: 'translateY(30px) scale(0.95)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      transition('hidden => visible', [
        animate('480ms cubic-bezier(0.23, 1, 0.32, 1)')
      ])
    ])
  ]
})
export class BattleComponent implements OnInit {
  battleResult: BattleResult | null = null;
  loading: boolean = false;
  error: string | null = null;
  characters: Character[] = [];
  selectedCharacter1: Character | null = null;
  selectedCharacter2: Character | null = null;
  currentHealth1: number = 100;
  currentHealth2: number = 100;
  currentEventIndex: number = 0;
  eventAnimations: boolean[] = [];
  battleInProgress: boolean = false;
  criticoRegex: RegExp = /¡Golpe crítico!/;
  especialRegex: RegExp = /¡Habilidad especial!/;
  victoriaRegex: RegExp = /¡Victoria!/;
  opponentName: string = '';
  opponentId: number = 0;
  currentUser: User | null = null;
  opponent: User | undefined;

  constructor(
    private battleService: BattleService,
    private characterService: CharacterService,
    private userCharacterService: UserCharacterService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUser = currentUser;
    }
  }

  ngOnInit(): void {
    this.loadCharacters();

    // Get opponent ID from route parameters
    this.route.paramMap.subscribe(params => {
      const opponentId = Number(params.get('opponentId'));
      if (opponentId) {
        this.opponentId = opponentId;
        this.opponentName = params.get('opponentName') || 'Oponente';
        
        // Buscar los personajes del oponente
        this.userCharacterService.getUserCharacters(opponentId).subscribe(
          (characters: Character[]) => {
            if (characters.length > 0) {
              this.selectedCharacter2 = characters[0];
              this.fight();
            }
          },
          (error: any) => {
            this.error = 'Error al obtener los personajes del oponente';
          }
        );
      }
    });
  }

  private loadCharacters(): void {
    this.characterService.getCharacters().subscribe(
      (characters: Character[]) => {
        this.characters = characters;
        if (this.characters.length >= 2) {
          this.selectedCharacter1 = this.characters[0];
          this.selectedCharacter2 = this.characters[1];
        }
      },
      (error: any) => {
        this.error = 'Error al cargar los personajes: ' + error;
      }
    );
  }

  getHealthBarWidth(character: Character): string {
    const character1 = this.getCharacter1();
    const character2 = this.getCharacter2();
    
    if (!character1 || !character2) return '100%';
    
    // If this is character 1, use currentHealth1
    if (character.idCharacter === character1.idCharacter) {
      return `${this.currentHealth1}%`;
    }
    // If this is character 2, use currentHealth2
    if (character.idCharacter === character2.idCharacter) {
      return `${this.currentHealth2}%`;
    }
    
    // Fallback to initial health if character not found
    return `${character.healthCharacter}%`;
  }

  private getCharacter1(): Character | undefined {
    return this.characters.find(c => c.idCharacter === this.selectedCharacter1?.idCharacter);
  }

  private getCharacter2(): Character | undefined {
    return this.characters.find(c => c.idCharacter === this.selectedCharacter2?.idCharacter);
  }

  fight(): void {
    if (!this.selectedCharacter1 || !this.selectedCharacter2) {
      this.error = 'Por favor, seleccione dos personajes';
      return;
    }

    this.error = null;
    this.loading = true;
    this.battleInProgress = true;
    this.currentEventIndex = 0;
    this.eventAnimations = [];
    this.currentHealth1 = 100;
    this.currentHealth2 = 100;

    if (!this.selectedCharacter1 || !this.selectedCharacter2) {
      this.error = 'Por favor, seleccione dos personajes';
      this.loading = false;
      this.battleInProgress = false;
      return;
    }

    this.battleService.fight(this.selectedCharacter1.idCharacter, this.selectedCharacter2.idCharacter).subscribe({
      next: (result) => {
        if (!result?.events) {
          this.error = 'Error en el resultado de la batalla';
          this.loading = false;
          this.battleInProgress = false;
          return;
        }

        this.battleResult = result;
        this.loading = false;
        this.showBattleEventsStepByStep();
      },
      error: (error) => {
        this.error = error.message || 'Error al iniciar la batalla';
        this.loading = false;
        this.battleInProgress = false;
      }
    });
  }

  private showBattleEventsStepByStep(): void {
    if (!this.battleResult?.events) return;

    const events = this.battleResult.events;
    const totalEvents = events.length;
    this.eventAnimations = new Array(totalEvents).fill(false);
    this.battleInProgress = true;

    const showNextEvent = () => {
      if (this.currentEventIndex >= totalEvents) {
        this.showBattleSummary();
        return;
      }

      const event = events[this.currentEventIndex];
      this.eventAnimations[this.currentEventIndex] = true;
      
      // Actualizar salud basado en el evento
      this.updateHealthFromEvent(event);
      
      // Incrementar índice y esperar antes de mostrar el siguiente evento
      setTimeout(() => {
        this.currentEventIndex++;
        showNextEvent();
      }, 1000);
    };

    showNextEvent();
  }

  private showBattleSummary(): void {
    if (!this.battleResult) return;

    // Mostrar el ganador
    const winner = this.battleResult.winner ? this.battleResult.winner.nameUser : 'Empate';
    
    // Calcular puntos ganados
    const pointsWon = this.battleResult.winner?.idUser === this.currentUser?.idUser
      ? Math.abs(this.battleResult.finalHealth1 - this.battleResult.finalHealth2)
      : -Math.abs(this.battleResult.finalHealth1 - this.battleResult.finalHealth2);

    // Mostrar la fecha
    const battleDate = this.battleResult.battleDate 
      ? new Date(this.battleResult.battleDate).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Fecha no disponible';

    // Mostrar el resumen
    this.error = `Ganador: ${winner}\nPuntos ganados: ${pointsWon}\nFecha: ${battleDate}`;
  }

  private updateHealthFromEvent(event: string): void {
    if (!event) return;
    const character1 = this.getCharacter1();
    const character2 = this.getCharacter2();
    if (!character1 || !character2) return;

    const criticoMatch = event.match(this.criticoRegex);
    const especialMatch = event.match(this.especialRegex);
    const victoriaMatch = event.match(this.victoriaRegex);

    // Actualizar salud basado en el tipo de evento
    if (criticoMatch) {
      // Reducir salud del oponente con daño crítico
      const damage = this.calculateCriticalDamage(character1, character2);
      if (event.includes(character1.nameCharacter)) {
        this.currentHealth2 = Math.max(0, this.currentHealth2 - damage);
      } else {
        this.currentHealth1 = Math.max(0, this.currentHealth1 - damage);
      }
    } else if (especialMatch) {
      // Reducir salud del oponente con habilidad especial
      const damage = this.calculateSpecialDamage(character1, character2);
      if (event.includes(character1.nameCharacter)) {
        this.currentHealth2 = Math.max(0, this.currentHealth2 - damage);
      } else {
        this.currentHealth1 = Math.max(0, this.currentHealth1 - damage);
      }
    } else if (victoriaMatch) {
      // No hay cambios de salud en eventos de victoria
      return;
    } else {
      // Ataque normal
      const attackerName = event.split(' ')[0];
      const attacker = character1.nameCharacter === attackerName ? character1 : character2;
      const defender = attacker === character1 ? character2 : character1;
      
      // Ataque normal causa daño normal
      const damage = this.calculateNormalDamage(attacker, defender);
      if (attacker === character1) {
        this.currentHealth2 = Math.max(0, this.currentHealth2 - damage);
      } else {
        this.currentHealth1 = Math.max(0, this.currentHealth1 - damage);
      }
    }
  }

  private calculateNormalDamage(attacker: Character, defender: Character): number {
    return Math.floor((attacker.attackCharacter * 1.5) - (defender.defenseCharacter * 0.5));
  }

  private calculateCriticalDamage(attacker: Character, defender: Character): number {
    return Math.floor((attacker.attackCharacter * 2) - (defender.defenseCharacter * 0.5));
  }

  private calculateSpecialDamage(attacker: Character, defender: Character): number {
    return Math.floor((attacker.attackCharacter * 2.5) - (defender.defenseCharacter * 0.5));
  }
}
