import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Character } from '../model/character';
import { BattleEvent } from '../model/battle-event';
import { UserCharacter } from '../model/user-character';
import { User } from '../model/user';
import { BattleResult } from '../model/battle-result';
import { BattleService } from '../services/battle.service';
import { CharacterService } from '../services/character.service';
import { UserCharacterService } from '../services/user-character.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { Observable } from 'rxjs';
import { trigger, state, style, animate, transition } from '@angular/animations';



@Component({
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  selector: 'app-battle',
  templateUrl: './battle.component.html',
  styleUrls: ['./battle.component.css'],
  providers: [BattleService, CharacterService, UserCharacterService, AuthService, UserService],
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
  characters: UserCharacter[] = [];
  selectedCharacter1: UserCharacter | null = null;
  selectedCharacter2: UserCharacter | null = null;
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
  opponent: User | null = null;
  currentUser: User | null = null;
  attackingCharacter: UserCharacter | null = null;
  defendingCharacter: UserCharacter | null = null;
  autoStarted: boolean = false;

  constructor(
    private battleService: BattleService,
    private characterService: CharacterService,
    private userCharacterService: UserCharacterService,
    private authService: AuthService,
    private userService: UserService,
    private route: ActivatedRoute
  ) {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUser = currentUser;
      this.loadCharacters();
    }
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const opponentName = params['opponentName'] as string | null;
      const opponentId = params['opponentId'] as string | null;
      
      if (opponentName && opponentId) {
        this.opponentName = opponentName;
        this.opponentId = parseInt(opponentId);
        this.userService.getUserById(this.opponentId).subscribe(
          (user) => {
            this.opponent = user;
            this.autoStarted = true;
            if (this.selectedCharacter1) {
              this.fight();
            }
          },
          (error) => {
            console.error('Error al obtener el oponente:', error);
            this.error = 'Error al cargar el oponente';
          }
        );
      }
    });
  }

  private handleError(message: string): void {
    this.error = message;
    this.loading = false;
    this.battleInProgress = false;
  }

  private loadCharacters(): void {
    if (!this.currentUser) {
      this.handleError('Error: Usuario no válido');
      return;
    }

    try {
      this.userCharacterService.getUserCharacters(this.currentUser.idUser).subscribe({
        next: (userCharacters: UserCharacter[]) => {
          if (!userCharacters) {
            this.handleError('Error: No se recibieron personajes');
            return;
          }

          this.characters = userCharacters;
          if (userCharacters.length > 0) {
            const randomIndex = Math.floor(Math.random() * userCharacters.length);
            this.selectedCharacter1 = userCharacters[randomIndex];
          }
        },
        error: (error: unknown) => {
          this.handleError('Error al cargar personajes del usuario: ' + (error instanceof Error ? error.message : 'Error desconocido'));
        }
      });
    } catch (error) {
      this.handleError('Error al cargar personajes: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  private isUserCharacter(obj: any): obj is UserCharacter {
    return 'idUser' in obj;
  }

  private getCharacterHealth(character: UserCharacter): number {
    if (!character) {
      return 100;
    }
    return character.healthUserCharacter || 100;
  }

  private getCharacterAttack(character: UserCharacter): number {
    if (!character) {
      return 0;
    }
    return character.attackUserCharacter || 0;
  }

  private getCharacterDefense(character: UserCharacter): number {
    if (!character) {
      return 0;
    }
    return character.defenseUserCharacter || 0;
  }

  private getCharacterSpeed(character: UserCharacter): number {
    if (!character) {
      return 0;
    }
    return character.speedUserCharacter || 0;
  }

  private getCharacterMaxHealth(character: UserCharacter): number {
    if (!character) {
      return 100;
    }
    return character.healthUserCharacter || 100;
  }

  private calculateNormalDamage(attacker: UserCharacter, defender: UserCharacter): number {
    const attack = this.getCharacterAttack(attacker);
    const defense = this.getCharacterDefense(defender);
    return Math.max(0, attack - defense);
  }

  private getCharacterImageUrl(character: UserCharacter): string | undefined {
    if (!character.baseCharacter) return undefined;
    return character.baseCharacter.imageUrl;
  }

  private getCharacterName(character: UserCharacter): string {
    if (!character.baseCharacter) return 'Desconocido';
    return character.baseCharacter.nameCharacter || 'Desconocido';
  }

  private handleEvent(event: BattleEvent): void {
    if (!event || !event.attacker || !event.defender) {
      this.handleError('Error: Evento inválido');
      return;
    }

    // Actualizar salud basado en el evento
    if (event.target === 'character1') {
      this.currentHealth1 = Math.max(0, this.currentHealth1 - event.damage);
    } else if (event.target === 'character2') {
      this.currentHealth2 = Math.max(0, this.currentHealth2 - event.damage);
    }

    this.attackingCharacter = event.attacker;
    this.defendingCharacter = event.defender;

    // Actualizar la barra de salud correspondiente
    this.updateHealthBar(event.target);
  }

  private updateHealthBar(target: 'character1' | 'character2'): void {
    if (target === 'character1') {
      this.eventAnimations[this.currentEventIndex] = true;
    } else {
      this.eventAnimations[this.currentEventIndex] = true;
    }
  }

  selectCharacter(character: UserCharacter): void {
    if (!this.selectedCharacter1) {
      this.selectedCharacter1 = character;
    } else if (!this.selectedCharacter2 && character !== this.selectedCharacter1) {
      this.selectedCharacter2 = character;
    }
  }

  deselectCharacter(character: UserCharacter): void {
    if (this.selectedCharacter1 === character) {
      this.selectedCharacter1 = null;
    } else if (this.selectedCharacter2 === character) {
      this.selectedCharacter2 = null;
    }
  }

  getHealthBarWidth(character: UserCharacter): string {
    if (!character) {
      return '100%';
    }

    if (character === this.selectedCharacter1) {
      return `${this.currentHealth1}%`;
    } else if (character === this.selectedCharacter2) {
      return `${this.currentHealth2}%`;
    }
    return '100%';
  }

  fight(): void {
    this.loading = true;
    this.battleInProgress = true;
    this.error = null;

    // Validar personajes seleccionados
    if (!this.selectedCharacter1 || !this.selectedCharacter2) {
      this.handleError('Error: Deben participar exactamente dos personajes en la batalla');
      return;
    }

    // Validar oponente
    if (!this.opponent || !this.opponent.idUser) {
      this.handleError('Error: Oponente no válido');
      return;
    }

    // Validar que los personajes no sean null y tengan baseCharacter
    if (!this.selectedCharacter1?.baseCharacter || !this.selectedCharacter2?.baseCharacter) {
      this.handleError('Error: Personajes inválidos');
      return;
    }

    // Crear objetos UserCharacter no nulos para el servicio
    const character1 = { ...this.selectedCharacter1! };
    const character2 = { ...this.selectedCharacter2! };

    try {
      this.battleService.fight(character1, character2, this.opponent.idUser).subscribe({
        next: (result: BattleResult) => {
          if (!result?.events) {
            this.handleError('Error en el resultado de la batalla');
            return;
          }

          // Inicializar salud actual con la máxima salud de los personajes
          this.currentHealth1 = this.getCharacterMaxHealth(character1);
          this.currentHealth2 = this.getCharacterMaxHealth(character2);

          this.battleResult = result;
          this.currentEventIndex = 0;
          this.eventAnimations = Array(result.events.length).fill(false);
          this.showBattleEventsStepByStep();
        },
        error: (error: unknown) => {
          this.handleError('Error al iniciar la batalla: ' + (error instanceof Error ? error.message : 'Error desconocido'));
        }
      });
    } catch (error) {
      this.handleError('Error al iniciar la batalla: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  private showBattleEventsStepByStep(): void {
    if (!this.battleResult?.events) {
      this.handleError('Error: No hay eventos de batalla');
      return;
    }

    const totalEvents = this.battleResult.events.length;
    const showNextEvent = () => {
      if (this.currentEventIndex >= totalEvents) {
        this.battleInProgress = false;
        return;
      }

      const event = this.battleResult.events[this.currentEventIndex];
      if (!event) {
        this.handleError('Error: Evento no válido');
        return;
      }

      // Manejar el evento
      try {
        this.handleEvent(event);
      } catch (error) {
        this.handleError('Error al manejar el evento: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      }

      this.currentEventIndex++;
      setTimeout(showNextEvent, 1000);
    };

    showNextEvent();
  }
}
