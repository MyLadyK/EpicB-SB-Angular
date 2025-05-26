import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UserCharacterService } from '../services/user-character.service';
import { AuthService } from '../services/auth.service';
import { BattleService } from '../services/battle.service';
import { UserService } from '../services/user.service';
import { UserCharacter } from '../model/user-character';
import { User } from '../model/user';
import { Observable } from 'rxjs';

// Usar las interfaces del modelo existente
import { BattleEvent } from '../model/battle-event';
import { BattleResult } from '../model/battle-result';

@Component({
  selector: 'app-battle',
  templateUrl: './battle.component.html',
  styleUrls: ['./battle.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class BattleComponent implements OnInit {
  // Personajes de la batalla
  selectedCharacter1: UserCharacter | null = null;  // Personaje del usuario actual
  selectedCharacter2: UserCharacter | null = null;  // Personaje del oponente
  
  // Estados de la batalla
  currentHealth1: number = 100;
  currentHealth2: number = 100;
  battleInProgress: boolean = false;
  loading: boolean = false;
  error: string | null = null;
  
  // Usuarios
  currentUser: User | null = null;
  opponent: User | null = null;
  
  // Resultado y eventos de batalla
  battleResult: BattleResult | null = null;
  currentEventIndex: number = 0;
  eventAnimations: boolean[] = [];
  
  // Variables para animación
  attackingCharacter: UserCharacter | null = null;
  defendingCharacter: UserCharacter | null = null;

  constructor(
    private route: ActivatedRoute,
    private userCharacterService: UserCharacterService,
    private authService: AuthService,
    private userService: UserService,
    private battleService: BattleService
  ) {}

  ngOnInit(): void {
    // Obtener el ID del oponente de los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
      console.log('Parámetros de ruta:', params);
      const opponentId = params.get('id'); // Cambiado de 'opponentId' a 'id'
      console.log('ID del oponente:', opponentId);
      
      if (opponentId) {
        this.loadBattleSetup(Number(opponentId));
      } else {
        this.handleError('Error: No se ha seleccionado un oponente');
      }
    });
  }

  private loadBattleSetup(opponentId: number): void {
    console.log('Iniciando loadBattleSetup con opponentId:', opponentId);
    this.loading = true;
    this.error = null;

    // 1. Obtener el usuario actual
    this.currentUser = this.authService.getCurrentUser();
    console.log('Usuario actual:', this.currentUser);
    
    if (!this.currentUser) {
      this.handleError('Error: No hay usuario autenticado');
      return;
    }

    // 2. Obtener el oponente
    console.log('Obteniendo oponente con ID:', opponentId);
    this.userService.getUserById(opponentId).subscribe({
      next: (opponent: User) => {
        console.log('Oponente obtenido:', opponent);
        this.opponent = opponent;
        this.selectRandomCharacters();
      },
      error: (error: Error) => {
        console.error('Error al obtener oponente:', error);
        this.handleError('Error al cargar el oponente: ' + error.message);
      }
    });
  }

  private selectRandomCharacters(): void {
    console.log('Iniciando selección de personajes aleatorios');
    console.log('Usuario actual:', this.currentUser);
    console.log('Oponente:', this.opponent);
    
    if (!this.currentUser?.idUser || !this.opponent?.idUser) {
      this.handleError('Error: Usuario u oponente no válido');
      return;
    }

    // Cargar personajes del usuario actual
    console.log('Cargando personajes del usuario actual...');
    this.userCharacterService.getUserCharacters(this.currentUser.idUser).subscribe({
      next: (userCharacters: UserCharacter[]) => {
        console.log('Personajes del usuario actual:', userCharacters);
        if (!userCharacters || userCharacters.length === 0) {
          this.handleError('No tienes personajes para batallar');
          return;
        }
        // Seleccionar personaje aleatorio del usuario actual
        this.selectedCharacter1 = userCharacters[Math.floor(Math.random() * userCharacters.length)];
        console.log('Personaje 1 seleccionado:', this.selectedCharacter1);
        
        // Cargar personajes del oponente
        console.log('Cargando personajes del oponente...');
        this.userCharacterService.getUserCharacters(this.opponent!.idUser).subscribe({
          next: (opponentCharacters: UserCharacter[]) => {
            console.log('Personajes del oponente:', opponentCharacters);
            if (!opponentCharacters || opponentCharacters.length === 0) {
              this.handleError('El oponente no tiene personajes para batallar');
              return;
            }
            // Seleccionar personaje aleatorio del oponente
            this.selectedCharacter2 = opponentCharacters[Math.floor(Math.random() * opponentCharacters.length)];
            console.log('Personaje 2 seleccionado:', this.selectedCharacter2);
            this.loading = false;
          },
          error: (error: Error) => {
            console.error('Error al cargar personajes del oponente:', error);
            this.handleError('Error al cargar los personajes del oponente: ' + error.message);
          }
        });
      },
      error: (error: Error) => {
        console.error('Error al cargar personajes del usuario:', error);
        this.handleError('Error al cargar tus personajes: ' + error.message);
      }
    });
  }

  fight(): void {
    if (!this.selectedCharacter1 || !this.selectedCharacter2 || !this.opponent?.idUser) {
      this.handleError('Error: No se han seleccionado los personajes para la batalla');
      return;
    }

    this.battleInProgress = true;
    this.loading = true;
    this.error = null;

    this.battleService.fight(
      this.selectedCharacter1,
      this.selectedCharacter2,
      this.opponent.idUser
    ).subscribe({
      next: (result: BattleResult) => {
        this.battleResult = result;
        this.animateBattle();
        this.loading = false;
      },
      error: (error: Error) => {
        let errorMessage = 'Error durante la batalla: ';
        if (error.message.includes('No hay paquetes sorpresa')) {
          errorMessage = 'La batalla no puede continuar porque el sistema de recompensas está temporalmente deshabilitado. Por favor, contacta con el administrador.';
        } else {
          errorMessage += error.message;
        }
        this.handleError(errorMessage);
        this.battleInProgress = false;
      }
    });
  }

  private animateBattle(): void {
    if (!this.battleResult?.events) return;
    
    this.eventAnimations = new Array(this.battleResult.events.length).fill(false);
    this.currentEventIndex = 0;
    
    const animateEvent = () => {
      if (this.currentEventIndex < this.battleResult!.events.length) {
        this.eventAnimations[this.currentEventIndex] = true;
        
        // Determinar quién ataca y quién defiende basado en la descripción del evento
        const event = this.battleResult!.events[this.currentEventIndex];
        const description = event.description || '';
        
        if (description.includes(this.getCharacterName(this.selectedCharacter1))) {
          this.attackingCharacter = this.selectedCharacter1;
          this.defendingCharacter = this.selectedCharacter2;
        } else {
          this.attackingCharacter = this.selectedCharacter2;
          this.defendingCharacter = this.selectedCharacter1;
        }
        
        this.currentEventIndex++;
        setTimeout(animateEvent, 1500);
      } else {
        this.battleInProgress = false;
        this.attackingCharacter = null;
        this.defendingCharacter = null;
      }
    };
    
    animateEvent();
  }

  // Métodos auxiliares para el template
  getCharacter1(): UserCharacter | null {
    return this.selectedCharacter1;
  }

  getCharacter2(): UserCharacter | null {
    return this.selectedCharacter2;
  }

  getCharacterName(character: UserCharacter | null): string {
    if (!character?.baseCharacter) return 'Desconocido';
    return character.baseCharacter.nameCharacter;
  }

  getCharacterStats(character: UserCharacter | null): string {
    if (!character) return '';
    return `Salud: ${character.healthUserCharacter} | Ataque: ${character.attackUserCharacter} | Defensa: ${character.defenseUserCharacter} | Velocidad: ${character.speedUserCharacter}`;
  }

  getCharacterImageUrl(character: UserCharacter | null): string {
    if (!character?.imageUrlUserCharacter) {
      return '';
    }
    // Add the backend URL prefix if it's not already included
    if (character.imageUrlUserCharacter.startsWith('http')) {
      return character.imageUrlUserCharacter;
    }
    return 'http://localhost:8081' + character.imageUrlUserCharacter;
  }

  private handleError(message: string): void {
    this.error = message;
    this.loading = false;
    this.battleInProgress = false;
    console.error(message);
  }
}
