import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { BattleService } from '../services/battle.service';
import { CharacterService } from '../services/character.service';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { BattleResult } from '../model/battle-result';
import { Character } from '../model/character';
import { User } from '../model/user';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  selector: 'app-battle',
  templateUrl: './battle.component.html',
  styleUrls: ['./battle.component.css'],
  providers: [BattleService, CharacterService, UserService, AuthService],
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
  battleResult?: BattleResult;
  loading = false;
  error: string | null = null;
  autoStarted = false;
  opponentName: string = '';
  opponentId?: number;

  users: User[] = [
    { idUser: 1, nameUser: 'Usuario 1', mailUser: '' },
    { idUser: 2, nameUser: 'Usuario 2', mailUser: '' }
  ];
  characters: Character[] = [];
  selectedUser1 = this.users[0].idUser;
  selectedUser2 = this.users[1].idUser;
  selectedCharacter1?: number;
  selectedCharacter2?: number;

  currentUser?: User;
  opponent?: User;

  // Animación de eventos
  eventAnimations: boolean[] = [];
  currentHealth1: number = 100;
  currentHealth2: number = 100;
  battleInProgress: boolean = false;
  currentEventIndex: number = 0;
  attackingCharacter: number | null = null;
  defendingCharacter: number | null = null;

  // Expresiones regulares para eventos de batalla
  private criticoRegex = /(.+) realiza un golpe crítico/;
  private especialRegex = /(.+) usa habilidad especial/;
  private victoriaRegex = /(.+) gana la batalla/;

  constructor(
    private battleService: BattleService,
    private characterService: CharacterService,
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadCharacters();

    // Get opponent ID from route parameters
    this.route.paramMap.subscribe(params => {
      const opponentId = Number(params.get('opponentId'));
      if (opponentId) {
        this.opponentId = opponentId;
        this.autoStarted = true;
        this.fight();
      }
    });

    // Get current user
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUser = currentUser;
    } else {
      this.currentUser = undefined;
    }

    // Iniciar la animación si la batalla se inició automáticamente
    if (this.autoStarted && this.opponentId) {
      this.battleService.startBattle(this.opponentId).subscribe(
        (result: any) => {
          this.battleResult = result;
          this.loading = false;
          window.dispatchEvent(new Event('ranking-updated'));
          this.showBattleEventsStepByStep();
        },
        (error: any) => {
          this.loading = false;
          this.error = error.error?.message || 'Error al iniciar la batalla';
          console.error('Error en la batalla:', error);
        }
      );
    }
  }

  loadCharacters() {
    this.loading = true;
    this.characterService.getCharacters().subscribe(
      (characters) => {
        this.characters = characters;
        if (this.characters.length >= 2) {
          this.selectedCharacter1 = this.characters[0].idCharacter;
          this.selectedCharacter2 = this.characters[1].idCharacter;
        }
        this.loading = false;
      },
      (error) => {
        this.error = 'Error al cargar los personajes: ' + error;
        this.loading = false;
      }
    );
  }

  getCharacter1(): Character | undefined {
    return this.characters.find(c => c.idCharacter === this.selectedCharacter1);
  }

  getCharacter2(): Character | undefined {
    return this.characters.find(c => c.idCharacter === this.selectedCharacter2);
  }

  getHealthBarWidth(character?: Character): string {
    if (!character) return '0%';

    // Si la batalla está en progreso, usar la salud actual
    if (this.battleInProgress) {
      if (character.idCharacter === this.selectedCharacter1) {
        return `${this.currentHealth1}%`;
      } else if (character.idCharacter === this.selectedCharacter2) {
        return `${this.currentHealth2}%`;
      }
    }

    // Si no, usar la salud inicial del personaje
    return `${(character.healthCharacter / 100) * 100}%`;
  }

  fight() {
    if (!this.selectedCharacter1 || !this.selectedCharacter2) {
      this.error = 'Debes seleccionar dos personajes para la batalla';
      return;
    }

    this.error = null;
    this.loading = true;
    this.battleService.startBattle(this.opponentId!).subscribe(
      result => {
        this.battleResult = result;
        this.loading = false;
        window.dispatchEvent(new Event('ranking-updated'));
        this.showBattleEventsStepByStep();
      },
      error => {
        this.error = error.error?.message || 'Error al iniciar la batalla';
        this.loading = false;
        console.error('Error en la batalla:', error);
      }
    );
  }

  showBattleEventsStepByStep() {
    if (!this.battleResult || !this.battleResult.events || !this.battleResult.events.length) {
      return;
    }

    const events = this.battleResult.events;
    this.currentEventIndex = 1;
    this.eventAnimations = new Array(events.length).fill(false);
    this.battleInProgress = true;

    const interval = setInterval(() => {
      if (this.currentEventIndex <= events.length) {
        const currentEventIndex = this.currentEventIndex - 1;
        if (currentEventIndex >= 0 && currentEventIndex < events.length) {
          const event = events[currentEventIndex];
          if (event) {
            this.eventAnimations[currentEventIndex] = true;
            this.updateHealthFromEvent(event);
            this.currentEventIndex++;
          }
        }
      } else {
        clearInterval(interval);
        this.battleInProgress = false;

        // Establecer la salud final
        if (this.battleResult) {
          this.currentHealth1 = this.battleResult.finalHealth1;
          this.currentHealth2 = this.battleResult.finalHealth2;
        }
      }
    }, 700);
  }

  updateHealthFromEvent(event: string) {
    // Buscar patrones como "Usuario1 realiza un golpe crítico"
    const criticoMatch = event.match(this.criticoRegex);
    if (criticoMatch) {
      const attacker = criticoMatch[1];
      this.updateHealthFromAttack(attacker, 25);
      return;
    }

    // Buscar patrones como "Usuario1 usa habilidad especial"
    const especialMatch = event.match(this.especialRegex);
    if (especialMatch) {
      const attacker = especialMatch[1];
      this.updateHealthFromAttack(attacker, 30);
      return;
    }

    // Buscar patrones como "Usuario1 gana la batalla"
    const victoriaMatch = event.match(this.victoriaRegex);
    if (victoriaMatch) {
      const winner = victoriaMatch[1];
      this.updateHealthFromVictory(winner);
    }
  }

  private updateHealthFromAttack(attacker: string, damage: number) {
    if (!this.battleResult?.events) return;

    const firstEvent = this.battleResult.events[0];
    const firstMatch = firstEvent.match(/(.+) ataca a (.+) por/);
    if (!firstMatch) return;

    const user1 = firstMatch[1];
    const user2 = firstMatch[2];

    if (attacker === user1) {
      this.attackingCharacter = this.selectedCharacter1!;
      this.defendingCharacter = this.selectedCharacter2!;
      this.currentHealth2 = Math.max(0, this.currentHealth2 - damage);
    } else if (attacker === user2) {
      this.attackingCharacter = this.selectedCharacter2!;
      this.defendingCharacter = this.selectedCharacter1!;
      this.currentHealth1 = Math.max(0, this.currentHealth1 - damage);
    }
  }

  private updateHealthFromVictory(winner: string) {
    if (!this.battleResult?.events) return;

    const firstEvent = this.battleResult.events[0];
    const firstMatch = firstEvent.match(/(.+) ataca a (.+) por/);
    if (!firstMatch) return;

    const user1 = firstMatch[1];
    const user2 = firstMatch[2];

    if (winner === user1) {
      this.currentHealth1 = 34;
      this.currentHealth2 = 0;
    } else if (winner === user2) {
      this.currentHealth1 = 0;
      this.currentHealth2 = 34;
    }
  }
}
