import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Character } from '../model/character';
import { User } from '../model/user';
import { UserCharacter } from '../model/user-character';
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
  characters: (Character | UserCharacter)[] = [];
  selectedCharacter1: Character | UserCharacter | null = null;
  selectedCharacter2: Character | UserCharacter | null = null;
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
  autoStarted: boolean = false;
  attackingCharacter: Character | UserCharacter | null = null;
  defendingCharacter: Character | UserCharacter | null = null;

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
        this.autoStarted = true;

        // Buscar los personajes del oponente
        this.userCharacterService.getUserCharacters(opponentId).subscribe(
          (characters: (Character | UserCharacter)[]) => {
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
    if (!this.currentUser) {
      this.error = 'No hay usuario autenticado';
      return;
    }

    // Cargar los personajes de la colección del usuario
    this.userCharacterService.getUserCharacters(this.currentUser.idUser).subscribe(
      (characters: UserCharacter[]) => {
        this.characters = characters;
        if (this.characters.length > 0) {
          this.selectedCharacter1 = this.characters[0];
        }
      },
      (error: any) => {
        this.error = 'Error al cargar los personajes de tu colección';
      }
    );
  }

  getHealthBarWidth(character: Character | UserCharacter | undefined): string {
    if (!character) return '100%';

    const character1 = this.getCharacter1();
    const character2 = this.getCharacter2();

    if (!character1 || !character2) return '100%';

    // If this is character 1, use currentHealth1
    if (this.isUserCharacter(character1) && this.isUserCharacter(character)) {
      if (character.idUserCharacter === character1.idUserCharacter) {
        return `${this.currentHealth1}%`;
      }
    } else if (!this.isUserCharacter(character1) && !this.isUserCharacter(character)) {
      if (character.idCharacter === character1.idCharacter) {
        return `${this.currentHealth1}%`;
      }
    }

    // If this is character 2, use currentHealth2
    if (this.isUserCharacter(character2) && this.isUserCharacter(character)) {
      if (character.idUserCharacter === character2.idUserCharacter) {
        return `${this.currentHealth2}%`;
      }
    } else if (!this.isUserCharacter(character2) && !this.isUserCharacter(character)) {
      if (character.idCharacter === character2.idCharacter) {
        return `${this.currentHealth2}%`;
      }
    }

    // Fallback to initial health if character not found
    return `${this.isUserCharacter(character) ? character.healthUserCharacter : character.healthCharacter}%`;
  }

  public getCharacter1(): Character | UserCharacter | undefined {
    if (this.isUserCharacter(this.selectedCharacter1)) {
      return this.selectedCharacter1;
    }
    // Use type guard to safely access idCharacter
    if (this.selectedCharacter1 && 'idCharacter' in this.selectedCharacter1) {
      const idChar = this.selectedCharacter1.idCharacter;
      return this.characters.find(c =>
        !this.isUserCharacter(c) && 'idCharacter' in c && c.idCharacter === idChar
      );
    }
    return undefined;
  }

  public getCharacter2(): Character | UserCharacter | undefined {
    if (this.isUserCharacter(this.selectedCharacter2)) {
      return this.selectedCharacter2;
    }
    // Use type guard to safely access idCharacter
    if (this.selectedCharacter2 && 'idCharacter' in this.selectedCharacter2) {
      const idChar = this.selectedCharacter2.idCharacter;
      return this.characters.find(c =>
        !this.isUserCharacter(c) && 'idCharacter' in c && c.idCharacter === idChar
      );
    }
    return undefined;
  }

  // Helper methods to safely access properties
  public getCharacterImageUrl(character: Character | UserCharacter | undefined): string | undefined {
    if (!character) return undefined;

    if (this.isUserCharacter(character)) {
      // For UserCharacter, try to get from baseCharacter first
      if (character.baseCharacter && character.baseCharacter.imageUrl) {
        return character.baseCharacter.imageUrl;
      }
      // UserCharacter might have its own imageUrl property
      return (character as any).imageUrlUserCharacter;
    } else {
      // For Character
      return character.imageUrl;
    }
  }

  public getCharacterName(character: Character | UserCharacter | undefined): string | undefined {
    if (!character) return undefined;

    if (this.isUserCharacter(character)) {
      // For UserCharacter, get from baseCharacter
      if (character.baseCharacter && character.baseCharacter.nameCharacter) {
        return character.baseCharacter.nameCharacter;
      }
      // Fallback to any name property the UserCharacter might have
      return (character as any).nameUserCharacter;
    } else {
      // For Character
      return character.nameCharacter;
    }
  }

  public getCharacterHealth(character: Character | UserCharacter | undefined): number | undefined {
    if (!character) return undefined;

    if (this.isUserCharacter(character)) {
      // For UserCharacter, try to get from baseCharacter first
      if (character.baseCharacter && character.baseCharacter.healthCharacter) {
        return character.baseCharacter.healthCharacter;
      }
      // UserCharacter has its own health property
      return character.healthUserCharacter;
    } else {
      // For Character
      return character.healthCharacter;
    }
  }

  // Type guard para UserCharacter
  // Type guard for UserCharacter
  public isUserCharacter(obj: any): obj is UserCharacter {
    return obj && 'idUserCharacter' in obj;
  }

  fight(): void {
    this.loading = true;
    this.battleInProgress = true;
    this.error = null;

    if (!this.selectedCharacter1 || !this.selectedCharacter2) {
      this.error = 'Por favor, seleccione dos personajes';
      this.loading = false;
      this.battleInProgress = false;
      return;
    }

    // Safely get character IDs using type guards
    let character1Id: number | undefined;
    let character2Id: number | undefined;

    if (this.isUserCharacter(this.selectedCharacter1) && this.selectedCharacter1.baseCharacter) {
      character1Id = this.selectedCharacter1.baseCharacter.idCharacter;
    } else if (!this.isUserCharacter(this.selectedCharacter1) && 'idCharacter' in this.selectedCharacter1) {
      character1Id = this.selectedCharacter1.idCharacter;
    }

    if (this.isUserCharacter(this.selectedCharacter2) && this.selectedCharacter2.baseCharacter) {
      character2Id = this.selectedCharacter2.baseCharacter.idCharacter;
    } else if (!this.isUserCharacter(this.selectedCharacter2) && 'idCharacter' in this.selectedCharacter2) {
      character2Id = this.selectedCharacter2.idCharacter;
    }

    if (!character1Id || !character2Id) {
      this.error = 'Error al obtener los IDs de los personajes';
      this.loading = false;
      this.battleInProgress = false;
      return;
    }

    this.battleService.fight({
      user1Id: this.currentUser?.idUser,
      user2Id: this.opponent?.idUser,
      character1Id: character1Id,
      character2Id: character2Id,
      userCharacter1Id: this.isUserCharacter(this.selectedCharacter1) && 'idUserCharacter' in this.selectedCharacter1
        ? this.selectedCharacter1.idUserCharacter
        : undefined,
      userCharacter2Id: this.isUserCharacter(this.selectedCharacter2) && 'idUserCharacter' in this.selectedCharacter2
        ? this.selectedCharacter2.idUserCharacter
        : undefined
    }).subscribe({
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

  private showBattleSummary(): void {
    if (!this.battleResult?.events) {
      this.error = 'Error en el resultado de la batalla';
      return;
    }

    this.eventAnimations = new Array(this.battleResult.events.length).fill(false);
    this.currentEventIndex = 0;
    this.showBattleEventsStepByStep();
  }

  private showBattleEventsStepByStep(): void {
    if (!this.battleResult?.events) return;

    const events = this.battleResult.events;
    const totalEvents = events.length;

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

  private updateHealthFromEvent(event: string): void {
    if (!event) return;

    const attackerName = event.split(' ')[0];
    const character1 = this.selectedCharacter1;
    const character2 = this.selectedCharacter2;

    if (!character1 || !character2) return;

    const attacker = this.isUserCharacter(character1)
      ? character1.baseCharacter.nameCharacter === attackerName
        ? character1
        : character2
      : character1.nameCharacter === attackerName
        ? character1
        : character2;

    const defender = attacker === character1 ? character2 : character1;

    this.attackingCharacter = attacker;
    this.defendingCharacter = defender;

    const damage = this.calculateNormalDamage(attacker, defender);

    if (attacker === character1) {
      this.currentHealth2 = Math.max(0, this.currentHealth2 - damage);
    } else {
      this.currentHealth1 = Math.max(0, this.currentHealth1 - damage);
    }
  }

  private calculateNormalDamage(attacker: Character | UserCharacter, defender: Character | UserCharacter): number {
    const attack = this.isUserCharacter(attacker) ? attacker.attackUserCharacter : attacker.attackCharacter;
    const defense = this.isUserCharacter(defender) ? defender.defenseUserCharacter : defender.defenseCharacter;
    return Math.max(0, attack - defense);
  }
}
