import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BattleService } from '../services/battle.service';
import { UserService } from '../services/user.service';
import { UserCharacterService } from '../services/user-character.service';
import { AuthService } from '../services/auth.service';
import { User } from '../model/user';
import { UserCharacter } from '../model/user-character';
import { BattleResult } from '../model/battle-result';
import { BattleEvent } from '../model/battle-event';
import { CharacterService } from '../services/character.service';
import { Observable } from 'rxjs';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-battle',
  templateUrl: './battle.component.html',
  styleUrls: ['./battle.component.css'],
  standalone: true,
  imports: [CommonModule],
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
  selectedCharacter1: UserCharacter | null = null;
  selectedCharacter2: UserCharacter | null = null;
  currentHealth1: number = 100;
  currentHealth2: number = 100;
  battleResult: BattleResult | null = null;
  currentEventIndex: number = 0;
  eventAnimations: boolean[] = [];
  autoStarted: boolean = false;
  loading: boolean = false;
  battleInProgress: boolean = false;
  error: string | null = null;
  currentUser: User | null = null;
  opponent: User | null = null;
  opponentId: number | null = null;
  opponentName: string | null = null;
  criticoRegex: RegExp = /¡Golpe crítico!/;
  especialRegex: RegExp = /¡Habilidad especial!/;
  victoriaRegex: RegExp = /¡Victoria!/;
  attackingCharacter: UserCharacter | null = null;
  defendingCharacter: UserCharacter | null = null;

  constructor(
    private battleService: BattleService,
    private userService: UserService,
    private userCharacterService: UserCharacterService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUser = currentUser;
    }
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const opponentId = params['id'];

      if (opponentId) {
        this.opponentId = parseInt(opponentId);
        this.userService.getUserById(this.opponentId!).subscribe(
          (user) => {
            this.opponent = user;
            this.opponentName = user.nameUser;
            this.autoStarted = true;
            this.loadRandomCharacters();
          },
          (error) => {
            console.error('Error al obtener el oponente:', error);
            this.error = 'Error al cargar el oponente';
          }
        );
      }
    });
  }

  private loadRandomCharacters(): void {
    if (!this.currentUser?.idUser || !this.opponent?.idUser) {
      this.handleError('Error: Usuarios no válidos');
      return;
    }

    // Cargar personaje aleatorio para el usuario actual
    this.userCharacterService.getUserCharacters(this.currentUser.idUser!).subscribe(
      (userCharacters) => {
        if (userCharacters && userCharacters.length > 0) {
          const randomIndex1 = Math.floor(Math.random() * userCharacters.length);
          this.selectedCharacter1 = userCharacters[randomIndex1];
        }
      }
    );

    // Cargar personaje aleatorio para el oponente
    this.userCharacterService.getUserCharacters(this.opponent.idUser!).subscribe(
      (opponentCharacters) => {
        if (opponentCharacters && opponentCharacters.length > 0) {
          const randomIndex2 = Math.floor(Math.random() * opponentCharacters.length);
          this.selectedCharacter2 = opponentCharacters[randomIndex2];
        }
      }
    );
  }

  private handleError(message: string): void {
    this.error = message;
    this.loading = false;
    this.battleInProgress = false;
    console.error(message);
  }

  private handleBattleResult(result: BattleResult): void {
    if (!result) {
      this.handleError('Error: Resultado de batalla no válido');
      return;
    }

    // Actualizar el ranking del usuario actual
    if (this.currentUser?.idUser) {
      const userId = this.currentUser.idUser;
      const currentPoints = this.currentUser.pointsUser || 0;
      const points = result.winner.idUser === userId ? result.pointsGained : result.pointsLost;

      this.userService.updateUserPoints(userId, points).subscribe(
        () => {
          this.currentUser!.pointsUser = currentPoints + points;
        },
        (error: unknown) => {
          console.error('Error al actualizar puntos:', error);
        }
      );
    }

    // Inicializar salud actual con la máxima salud de los personajes
    this.currentHealth1 = this.selectedCharacter1 ? this.getCharacterMaxHealth(this.selectedCharacter1) : 0;
    this.currentHealth2 = this.selectedCharacter2 ? this.getCharacterMaxHealth(this.selectedCharacter2) : 0;

    this.battleResult = result;
    this.currentEventIndex = 0;
    this.eventAnimations = Array(result.events.length).fill(false);
    this.showBattleEventsStepByStep();
  }

  private loadCharacters(): void {
    if (!this.currentUser?.idUser) {
      this.handleError('Error: Usuario no válido');
      return;
    }

    try {
      this.userCharacterService.getUserCharacters(this.currentUser.idUser!).subscribe({
        next: (userCharacters: UserCharacter[]) => {
          if (!userCharacters || userCharacters.length === 0) {
            this.handleError('Error: No se encontraron personajes');
            return;
          }

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
      this.handleError('Error al cargar personajes del usuario: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  public isUserCharacter(character: any): character is UserCharacter {
    return character && typeof character === 'object' && 'baseCharacter' in character;
  }

  public getCharacterProperty(character: UserCharacter | null, property: string): number {
    if (!character) {
      return 0;
    }
    switch (property) {
      case 'healthUserCharacter': return character.healthUserCharacter;
      case 'attackUserCharacter': return character.attackUserCharacter;
      case 'defenseUserCharacter': return character.defenseUserCharacter;
      case 'speedUserCharacter': return character.speedUserCharacter;
      case 'staminaUserCharacter': return character.staminaUserCharacter;
      case 'intelligenceUserCharacter': return character.intelligenceUserCharacter;
      default: return 0;
    }
  }

  public getCharacterHealth(character: UserCharacter | null): number {
    if (!character) {
      return 0;
    }
    return character.healthUserCharacter || 100;
  }

  public getCharacterAttack(character: UserCharacter | null): number {
    return this.getCharacterProperty(character, 'attackUserCharacter');
  }

  public getCharacterDefense(character: UserCharacter | null): number {
    return this.getCharacterProperty(character, 'defenseUserCharacter');
  }

  public getCharacterSpeed(character: UserCharacter | null): number {
    return this.getCharacterProperty(character, 'speedUserCharacter');
  }

  private getCharacterMaxHealth(character: UserCharacter | null): number {
    if (!character?.baseCharacter) {
      return 100;
    }
    return character.baseCharacter.healthCharacter || 100;
  }

  public calculateNormalDamage(attacker: UserCharacter, defender: UserCharacter): number {
    const attack = this.getCharacterAttack(attacker);
    const defense = this.getCharacterDefense(defender);
    return Math.max(0, attack - defense);
  }

  public getCharacterImageUrl(character: UserCharacter | null): string {
    if (!character?.baseCharacter) {
      return '/assets/images/default-character.png';
    }
    return character.baseCharacter.imageUrl || '/assets/images/default-character.png';
  }

  public getCharacterName(character: UserCharacter | null): string {
    if (!character?.baseCharacter) {
      return 'Desconocido';
    }
    return character.baseCharacter.nameCharacter || 'Desconocido';
  }

  public getCharacter1(): UserCharacter | null {
    return this.selectedCharacter1;
  }

  public getCharacter2(): UserCharacter | null {
    return this.selectedCharacter2;
  }

  public getHealthBarWidth(character: UserCharacter): string {
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

  private handleEvent(event: BattleEvent): void {
    if (!event || !this.battleResult?.events || this.currentEventIndex >= this.battleResult?.events?.length) {
      return;
    }

    const attacker = event.attacker;
    const defender = event.defender;
    const damage = event.damage;
    const description = event.description || '';

    if (attacker === this.selectedCharacter1 && defender === this.selectedCharacter2) {
      this.currentHealth2 = Math.max(0, this.currentHealth2 - damage);
      this.attackingCharacter = this.selectedCharacter1;
      this.defendingCharacter = this.selectedCharacter2;
    } else if (attacker === this.selectedCharacter2 && defender === this.selectedCharacter1) {
      this.currentHealth1 = Math.max(0, this.currentHealth1 - damage);
      this.attackingCharacter = this.selectedCharacter2;
      this.defendingCharacter = this.selectedCharacter1;
    }

    // Animar el evento
    if (this.currentEventIndex < this.eventAnimations.length) {
      this.eventAnimations[this.currentEventIndex] = true;
    }
  }

  public formatBattleEvent(event: BattleEvent): string {
    const attackerName = this.getCharacterName(event.attacker);
    const defenderName = this.getCharacterName(event.defender);
    const damage = event.damage || 0;
    const damageStr = damage > 0 ? ` (${damage} daño)` : '';

    if (event.description) {
      if (this.especialRegex.test(event.description)) {
        return `${attackerName} usa habilidad especial contra ${defenderName}${damageStr}`;
      } else if (this.criticoRegex.test(event.description)) {
        return `${attackerName} inflige golpe crítico a ${defenderName}${damageStr}`;
      }
    }
    return `${attackerName} ataca a ${defenderName}${damageStr}`;
  }

  selectCharacter(character: UserCharacter): void {
    if (!this.selectedCharacter1) {
      this.selectedCharacter1 = character;
    } else if (!this.selectedCharacter2) {
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

    try {
      this.battleService.startBattle(this.opponent.idUser).subscribe({
        next: (result: BattleResult) => {
          if (!result?.events) {
            this.handleError('Error en el resultado de la batalla');
            return;
          }
          this.handleBattleResult(result);
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

    const totalEvents = this.battleResult?.events?.length || 0;
    const showNextEvent = () => {
      if (this.currentEventIndex >= totalEvents) {
        this.battleInProgress = false;
        return;
      }

      const event = this.battleResult?.events[this.currentEventIndex];
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
