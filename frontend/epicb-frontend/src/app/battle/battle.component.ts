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
  loading: boolean = false;
  battleInProgress: boolean = false;
  error: string | null = null;
  currentUser: User | null = null;
  opponent: User | null = null;
  opponentId: number | null = null;
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
      if (!opponentId) {
        this.handleError('Error: No se ha seleccionado un oponente');
        return;
      }

      this.opponentId = parseInt(opponentId);
      this.userService.getUserById(this.opponentId).subscribe(
        (user) => {
          this.opponent = user;
          this.loadBattleCharacters();
        },
        (error) => {
          console.error('Error al obtener el oponente:', error);
          this.handleError('Error al cargar el oponente');
        }
      );
    });
  }

  private loadBattleCharacters(): void {
    if (!this.currentUser?.idUser || !this.opponent?.idUser) {
      this.handleError('Error: Usuario u oponente no válido');
      return;
    }

    this.loading = true;
    this.error = null;

    // Cargar personajes del usuario actual
    this.userCharacterService.getUserCharacters(this.currentUser.idUser).subscribe({
      next: (userCharacters: UserCharacter[]) => {
        if (!userCharacters || userCharacters.length === 0) {
          this.loading = false;
          this.handleError('Error: No tienes personajes para batallar');
          return;
        }

        // Filtrar personajes válidos del usuario
        const validUserCharacters = userCharacters.filter((char: UserCharacter) => this.validateCharacter(char));
        if (validUserCharacters.length === 0) {
          this.loading = false;
          this.handleError('Error: No tienes personajes válidos para batallar');
          return;
        }

        // Seleccionar personaje aleatorio para el usuario
        const randomIndex1 = Math.floor(Math.random() * validUserCharacters.length);
        this.selectedCharacter1 = validUserCharacters[randomIndex1];

        // Cargar personajes del oponente
        this.userCharacterService.getUserCharacters(this.opponent!.idUser!).subscribe({
          next: (opponentCharacters: UserCharacter[]) => {
            if (!opponentCharacters || opponentCharacters.length === 0) {
              this.loading = false;
              this.handleError('Error: El oponente no tiene personajes para batallar');
              return;
            }

            // Filtrar personajes válidos del oponente
            const validOpponentCharacters = opponentCharacters.filter((char: UserCharacter) => this.validateCharacter(char));
            if (validOpponentCharacters.length === 0) {
              this.loading = false;
              this.handleError('Error: El oponente no tiene personajes válidos para batallar');
              return;
            }

            // Seleccionar personaje aleatorio para el oponente
            const randomIndex2 = Math.floor(Math.random() * validOpponentCharacters.length);
            this.selectedCharacter2 = validOpponentCharacters[randomIndex2];

            this.loading = false;
            this.initializeBattle();
          },
          error: (error) => {
            this.loading = false;
            this.handleError('Error al cargar los personajes del oponente: ' + 
              (error instanceof Error ? error.message : 'Error desconocido'));
          }
        });
      },
      error: (error) => {
        this.loading = false;
        this.handleError('Error al cargar tus personajes: ' + 
          (error instanceof Error ? error.message : 'Error desconocido'));
      }
    });
  }

  private initializeBattle(): void {
    if (!this.selectedCharacter1 || !this.selectedCharacter2) {
      this.handleError('Error: No se han podido seleccionar los personajes para la batalla');
      return;
    }

    if (!this.validateBattleSetup(this.selectedCharacter1, this.selectedCharacter2)) {
      return;
    }

    this.currentHealth1 = this.getCharacterMaxHealth(this.selectedCharacter1);
    this.currentHealth2 = this.getCharacterMaxHealth(this.selectedCharacter2);
    this.battleInProgress = true;
    this.error = null;
  }

  fight(): void {
    if (!this.selectedCharacter1 || !this.selectedCharacter2 || !this.opponent?.idUser) {
      this.handleError('Error: No se han seleccionado los personajes para la batalla');
      return;
    }

    this.loading = true;
    this.battleInProgress = true;
    this.error = null;
    this.battleResult = null;

    try {
      // Crear copias de los personajes para la batalla
      const character1Copy = JSON.parse(JSON.stringify(this.selectedCharacter1));
      const character2Copy = JSON.parse(JSON.stringify(this.selectedCharacter2));

      this.battleService.fight(character1Copy, character2Copy, this.opponent.idUser).subscribe({
        next: (result: BattleResult) => {
          if (!result?.events) {
            this.handleError('Error: Resultado de batalla inválido');
            return;
          }
          this.handleBattleResult(result);
        },
        error: (error) => {
          this.handleError('Error durante la batalla: ' + 
            (error instanceof Error ? error.message : 'Error desconocido'));
        }
      });
    } catch (error) {
      this.handleError('Error al iniciar la batalla: ' + 
        (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  private handleBattleResult(result: BattleResult): void {
    if (!result) {
      this.handleError('Error: Resultado de batalla no válido');
      return;
    }

    // Ensure result properties are not null or undefined
    result.result = result.result || 'Resultado desconocido';
    result.opponentName = result.opponentName || 'Oponente desconocido';
    result.date = result.date || 'Fecha desconocida';

    // Actualizar el ranking del usuario actual
    if (this.currentUser?.idUser) {
      const userId = this.currentUser.idUser;
      const currentPoints = this.currentUser.pointsUser || 0;
      // El ganador recibe 20 puntos, el perdedor pierde 8 puntos
      const points = result.winner.idUser === userId ? 20 : -8;

      this.userService.updateUserPoints(userId, points).subscribe(
        () => {
          this.currentUser!.pointsUser = currentPoints + points;
        },
        (error: unknown) => {
          console.error('Error al actualizar puntos:', error);
        }
      );
    }

    // También actualizar los puntos del oponente
    if (this.opponent?.idUser) {
      const opponentId = this.opponent.idUser;
      // El ganador recibe 20 puntos, el perdedor pierde 8 puntos
      const opponentPoints = result.winner.idUser === opponentId ? 20 : -8;

      this.userService.updateUserPoints(opponentId, opponentPoints).subscribe(
        () => {
          // Actualizar los puntos del oponente en la interfaz si es necesario
          if (this.opponent) {
            this.opponent.pointsUser = (this.opponent.pointsUser || 0) + opponentPoints;
          }
        },
        (error: unknown) => {
          console.error('Error al actualizar puntos del oponente:', error);
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

  private validateBattleSetup(char1: UserCharacter | null, char2: UserCharacter | null): boolean {
    // Validar personajes seleccionados
    if (!char1 || !char2) {
      this.handleError('Error: Deben participar exactamente dos personajes en la batalla');
      console.error('validateBattleSetup - Error: Personajes no seleccionados');
      return false;
    }

    // Validar que los personajes tengan IDs válidos
    if (!char1.idUserCharacter || !char2.idUserCharacter) {
      this.handleError('Error: Los personajes no tienen IDs válidos');
      console.error('validateBattleSetup - Error: IDs de personajes no válidos');
      return false;
    }

    // Validar que los personajes tengan todas las propiedades necesarias
    if (!char1.baseCharacter || !char2.baseCharacter) {
      this.handleError('Error: Los personajes seleccionados no son válidos (falta baseCharacter)');
      console.error('validateBattleSetup - Error: Personajes sin baseCharacter');
      return false;
    }

    // Validar que los personajes tengan todas las propiedades necesarias para la batalla
    const character1Valid = this.validateCharacter(char1);
    const character2Valid = this.validateCharacter(char2);

    if (!character1Valid || !character2Valid) {
      this.handleError('Error: Los personajes no tienen todas las propiedades necesarias para la batalla');
      console.error('validateBattleSetup - Error: Personajes inválidos');
      return false;
    }

    // Validar que tengamos el usuario actual y el oponente
    if (!this.currentUser?.idUser || !this.opponent?.idUser) {
      this.handleError('Error: No se pudo obtener el ID del usuario actual o del oponente');
      console.error('validateBattleSetup - Error: IDs de usuarios no válidos');
      return false;
    }

    return true;
  }

  // Método para validar que un personaje tenga todas las propiedades necesarias
  private validateCharacter(character: UserCharacter | null): boolean {
    if (!character || !character.baseCharacter) {
      return false;
    }

    // Verificar que el personaje tenga todas las propiedades necesarias
    if (character.healthUserCharacter === undefined || character.healthUserCharacter === null) {
      console.error(`validateCharacter - Falta propiedad healthUserCharacter en el personaje:`, character);
      return false;
    }
    if (character.attackUserCharacter === undefined || character.attackUserCharacter === null) {
      console.error(`validateCharacter - Falta propiedad attackUserCharacter en el personaje:`, character);
      return false;
    }
    if (character.defenseUserCharacter === undefined || character.defenseUserCharacter === null) {
      console.error(`validateCharacter - Falta propiedad defenseUserCharacter en el personaje:`, character);
      return false;
    }
    if (character.speedUserCharacter === undefined || character.speedUserCharacter === null) {
      console.error(`validateCharacter - Falta propiedad speedUserCharacter en el personaje:`, character);
      return false;
    }

    // Verificar que el personaje base tenga todas las propiedades necesarias
    if (character.baseCharacter.idCharacter === undefined || character.baseCharacter.idCharacter === null) {
      console.error(`validateCharacter - Falta propiedad idCharacter en el personaje base:`, character.baseCharacter);
      return false;
    }
    if (character.baseCharacter.nameCharacter === undefined || character.baseCharacter.nameCharacter === null) {
      console.error(`validateCharacter - Falta propiedad nameCharacter en el personaje base:`, character.baseCharacter);
      return false;
    }
    if (character.baseCharacter.healthCharacter === undefined || character.baseCharacter.healthCharacter === null) {
      console.error(`validateCharacter - Falta propiedad healthCharacter en el personaje base:`, character.baseCharacter);
      return false;
    }

    return true;
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
    if (!character?.baseCharacter?.imageUrl) {
      return 'assets/images/default-character.png';
    }
    
    // Use the imageUrl directly from the baseCharacter
    const imageUrl = character.baseCharacter.imageUrl;
    
    // If it's already a full URL, return it as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it's a relative path, ensure it starts with assets/
    if (!imageUrl.startsWith('assets/')) {
      return `assets/${imageUrl}`;
    }
    
    return imageUrl;
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

  private handleError(message: string): void {
    this.error = message;
    this.loading = false;
    this.battleInProgress = false;
    console.error(message);
  }
}
