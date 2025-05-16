import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { BattleService } from '../services/battle.service';
import { CharacterService } from '../services/character.service';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { BattleResult } from '../model/battle-result';
import { BattleSummary } from '../model/battle-summary';
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
  battleSummary?: BattleSummary;
  loading = false;
  error: string | null = null;
  autoStarted = false; // Flag to indicate if battle was auto-started from route
  opponentName: string = ''; // Name of the opponent

  users: User[] = [
    { idUser: 1, nameUser: 'Usuario 1', mailUser: '' },
    { idUser: 2, nameUser: 'Usuario 2', mailUser: '' }
  ];
  characters: Character[] = [];
  selectedUser1 = this.users[0].idUser;
  selectedUser2 = this.users[1].idUser;
  selectedCharacter1?: number;
  selectedCharacter2?: number;

  // Animación de eventos
  eventAnimations: boolean[] = [];
  eventInterval: any;

  // Variables para la animación de la batalla en tiempo real
  currentHealth1: number = 100;
  currentHealth2: number = 100;
  battleInProgress: boolean = false;
  currentEventIndex: number = 0;
  attackingCharacter: number | null = null;
  defendingCharacter: number | null = null;

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
        // Get current user and opponent information
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          this.selectedUser1 = currentUser.idUser;

          this.userService.getUserById(opponentId).subscribe(opponent => {
            if (opponent) {
              this.selectedUser2 = opponent.idUser;
              this.opponentName = opponent.nameUser;

              // Wait for characters to load before starting battle
              setTimeout(() => {
                this.autoStarted = true;
                this.fightSummary();
              }, 500);
            }
          });
        }
      }
    });
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

    const battleData = {
      user1Id: this.selectedUser1,
      user2Id: this.selectedUser2,
      character1Id: this.selectedCharacter1,
      character2Id: this.selectedCharacter2,
      userCharacter1Id: this.selectedCharacter1,
      userCharacter2Id: this.selectedCharacter2
    };
    this.error = null;
    this.loading = true;
    this.battleService.fight(battleData).subscribe(
      result => {
        this.battleResult = result;
        this.loading = false;
      },
      error => {
        this.error = error;
        this.loading = false;
      }
    );
  }

  showBattleEventsStepByStep() {
    if (!this.battleSummary) return;

    // Inicializar variables para la animación
    this.eventAnimations = new Array(this.battleSummary.events.length).fill(false);
    this.currentHealth1 = 100;
    this.currentHealth2 = 100;
    this.battleInProgress = true;
    this.currentEventIndex = 0;

    // Mostrar los eventos uno por uno
    let idx = 0;
    this.eventInterval = setInterval(() => {
      if (idx < this.eventAnimations.length) {
        // Mostrar el evento actual
        this.eventAnimations[idx] = true;

        // Actualizar la salud basado en el evento
        this.updateHealthFromEvent(this.battleSummary!.events[idx]);

        idx++;
        this.currentEventIndex = idx;
      } else {
        // Finalizar la animación
        clearInterval(this.eventInterval);
        this.battleInProgress = false;

        // Establecer la salud final
        if (this.battleSummary) {
          this.currentHealth1 = this.battleSummary.finalHealth1;
          this.currentHealth2 = this.battleSummary.finalHealth2;
        }
      }
    }, 700);
  }

  /**
   * Actualiza la salud de los personajes basado en el evento de batalla
   */
  updateHealthFromEvent(event: string) {
    // Resetear los personajes atacante y defensor
    this.attackingCharacter = null;
    this.defendingCharacter = null;

    const character1 = this.getCharacter1();
    const character2 = this.getCharacter2();

    if (!character1 || !character2) return;

    // Buscar patrones como "Usuario1 ataca a Usuario2 por 20 de daño"
    const damageRegex = /(.+) ataca a (.+) por (\d+(\.\d+)?) de daño/;
    const match = event.match(damageRegex);

    if (match) {
      const attacker = match[1];
      const defender = match[2];
      const damage = parseFloat(match[3]);

      // En el modo demo, asumimos que el primer usuario mencionado en los eventos es el usuario1
      // y el segundo usuario mencionado es el usuario2
      // Determinar quién ataca y quién defiende basado en el orden de los eventos
      if (this.battleSummary && this.battleSummary.events && this.battleSummary.events.length > 0) {
        // Obtener el primer evento para determinar quién es el usuario1 y quién es el usuario2
        const firstEvent = this.battleSummary.events[0];
        const firstMatch = firstEvent.match(/(.+) ataca a (.+) por/);

        if (firstMatch) {
          const user1 = firstMatch[1];
          const user2 = firstMatch[2];

          // Si el atacante en este evento es el mismo que el usuario1 del primer evento
          if (attacker === user1) {
            this.attackingCharacter = this.selectedCharacter1!;
            this.defendingCharacter = this.selectedCharacter2!;
            // Reducir la salud del defensor
            this.currentHealth2 = Math.max(0, this.currentHealth2 - damage);
          } else if (attacker === user2) {
            this.attackingCharacter = this.selectedCharacter2!;
            this.defendingCharacter = this.selectedCharacter1!;
            // Reducir la salud del defensor
            this.currentHealth1 = Math.max(0, this.currentHealth1 - damage);
          }
        } else {
          // Si no podemos determinar por el primer evento, usar la lógica anterior
          if (attacker.includes('Usuario' + this.selectedUser1) || attacker === 'Usuario1') {
            this.attackingCharacter = this.selectedCharacter1!;
            this.defendingCharacter = this.selectedCharacter2!;
            // Reducir la salud del defensor
            this.currentHealth2 = Math.max(0, this.currentHealth2 - damage);
          } else if (attacker.includes('Usuario' + this.selectedUser2) || attacker === 'Usuario2') {
            this.attackingCharacter = this.selectedCharacter2!;
            this.defendingCharacter = this.selectedCharacter1!;
            // Reducir la salud del defensor
            this.currentHealth1 = Math.max(0, this.currentHealth1 - damage);
          }
        }
      }
      return;
    }

    // Buscar patrones como "Usuario1 realiza un golpe crítico"
    const criticoRegex = /(.+) realiza un golpe crítico/;
    const criticoMatch = event.match(criticoRegex);

    if (criticoMatch) {
      const attacker = criticoMatch[1];

      // Determinar quién realiza el golpe crítico
      if (this.battleSummary && this.battleSummary.events && this.battleSummary.events.length > 0) {
        // Obtener el primer evento para determinar quién es el usuario1 y quién es el usuario2
        const firstEvent = this.battleSummary.events[0];
        const firstMatch = firstEvent.match(/(.+) ataca a (.+) por/);

        if (firstMatch) {
          const user1 = firstMatch[1];
          const user2 = firstMatch[2];

          // Si el atacante en este evento es el mismo que el usuario1 del primer evento
          if (attacker === user1) {
            this.attackingCharacter = this.selectedCharacter1!;
            this.defendingCharacter = this.selectedCharacter2!;
            // Reducir la salud del defensor (golpe crítico hace más daño)
            this.currentHealth2 = Math.max(0, this.currentHealth2 - 25);
          } else if (attacker === user2) {
            this.attackingCharacter = this.selectedCharacter2!;
            this.defendingCharacter = this.selectedCharacter1!;
            // Reducir la salud del defensor (golpe crítico hace más daño)
            this.currentHealth1 = Math.max(0, this.currentHealth1 - 25);
          }
        } else {
          // Si no podemos determinar por el primer evento, usar la lógica anterior
          if (attacker.includes('Usuario' + this.selectedUser1) || attacker === 'Usuario1') {
            this.attackingCharacter = this.selectedCharacter1!;
            this.defendingCharacter = this.selectedCharacter2!;
            // Reducir la salud del defensor (golpe crítico hace más daño)
            this.currentHealth2 = Math.max(0, this.currentHealth2 - 25);
          } else if (attacker.includes('Usuario' + this.selectedUser2) || attacker === 'Usuario2') {
            this.attackingCharacter = this.selectedCharacter2!;
            this.defendingCharacter = this.selectedCharacter1!;
            // Reducir la salud del defensor (golpe crítico hace más daño)
            this.currentHealth1 = Math.max(0, this.currentHealth1 - 25);
          }
        }
      }
      return;
    }

    // Buscar patrones como "Usuario1 usa habilidad especial"
    const especialRegex = /(.+) usa habilidad especial/;
    const especialMatch = event.match(especialRegex);

    if (especialMatch) {
      const attacker = especialMatch[1];

      // Determinar quién usa la habilidad especial
      if (this.battleSummary && this.battleSummary.events && this.battleSummary.events.length > 0) {
        // Obtener el primer evento para determinar quién es el usuario1 y quién es el usuario2
        const firstEvent = this.battleSummary.events[0];
        const firstMatch = firstEvent.match(/(.+) ataca a (.+) por/);

        if (firstMatch) {
          const user1 = firstMatch[1];
          const user2 = firstMatch[2];

          // Si el atacante en este evento es el mismo que el usuario1 del primer evento
          if (attacker === user1) {
            this.attackingCharacter = this.selectedCharacter1!;
            this.defendingCharacter = this.selectedCharacter2!;
            // Reducir la salud del defensor (habilidad especial hace más daño)
            this.currentHealth2 = Math.max(0, this.currentHealth2 - 30);
          } else if (attacker === user2) {
            this.attackingCharacter = this.selectedCharacter2!;
            this.defendingCharacter = this.selectedCharacter1!;
            // Reducir la salud del defensor (habilidad especial hace más daño)
            this.currentHealth1 = Math.max(0, this.currentHealth1 - 30);
          }
        } else {
          // Si no podemos determinar por el primer evento, usar la lógica anterior
          if (attacker.includes('Usuario' + this.selectedUser1) || attacker === 'Usuario1') {
            this.attackingCharacter = this.selectedCharacter1!;
            this.defendingCharacter = this.selectedCharacter2!;
            // Reducir la salud del defensor (habilidad especial hace más daño)
            this.currentHealth2 = Math.max(0, this.currentHealth2 - 30);
          } else if (attacker.includes('Usuario' + this.selectedUser2) || attacker === 'Usuario2') {
            this.attackingCharacter = this.selectedCharacter2!;
            this.defendingCharacter = this.selectedCharacter1!;
            // Reducir la salud del defensor (habilidad especial hace más daño)
            this.currentHealth1 = Math.max(0, this.currentHealth1 - 30);
          }
        }
      }
      return;
    }

    // Buscar patrones como "Usuario1 gana la batalla"
    const victoriaRegex = /(.+) gana la batalla/;
    const victoriaMatch = event.match(victoriaRegex);

    if (victoriaMatch) {
      const winner = victoriaMatch[1];

      // Determinar quién ganó la batalla
      if (this.battleSummary && this.battleSummary.events && this.battleSummary.events.length > 0) {
        // Obtener el primer evento para determinar quién es el usuario1 y quién es el usuario2
        const firstEvent = this.battleSummary.events[0];
        const firstMatch = firstEvent.match(/(.+) ataca a (.+) por/);

        if (firstMatch) {
          const user1 = firstMatch[1];
          const user2 = firstMatch[2];

          // Si el ganador es el mismo que el usuario1 del primer evento
          if (winner === user1) {
            // Usuario1 ganó, establecer la salud final
            this.currentHealth1 = 34;
            this.currentHealth2 = 0;
          } else if (winner === user2) {
            // Usuario2 ganó, establecer la salud final
            this.currentHealth1 = 0;
            this.currentHealth2 = 34;
          }
        } else {
          // Si no podemos determinar por el primer evento, usar la lógica anterior
          if (winner.includes('Usuario' + this.selectedUser1) || winner === 'Usuario1') {
            // Usuario1 ganó, establecer la salud final
            this.currentHealth1 = 34;
            this.currentHealth2 = 0;
          } else if (winner.includes('Usuario' + this.selectedUser2) || winner === 'Usuario2') {
            // Usuario2 ganó, establecer la salud final
            this.currentHealth1 = 0;
            this.currentHealth2 = 34;
          }
        }
      }
      return;
    }
  }

  fightSummary() {
    if (!this.selectedCharacter1 || !this.selectedCharacter2) {
      this.error = 'Debes seleccionar dos personajes para la batalla';
      return;
    }

    this.loading = true;
    this.error = null;
    const battleData = {
      user1Id: this.selectedUser1,
      user2Id: this.selectedUser2,
      character1Id: this.selectedCharacter1,
      character2Id: this.selectedCharacter2,
      userCharacter1Id: this.selectedCharacter1,
      userCharacter2Id: this.selectedCharacter2
    };
    this.battleService.fightSummary(battleData).subscribe(
      result => {
        this.battleSummary = result;
        this.loading = false;
        window.dispatchEvent(new Event('ranking-updated'));
        this.showBattleEventsStepByStep();
      },
      error => {
        this.error = error;
        this.loading = false;
      }
    );
  }
}
