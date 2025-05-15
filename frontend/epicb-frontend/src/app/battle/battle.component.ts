import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BattleService } from '../services/battle.service';
import { CharacterService } from '../services/character.service';
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
  providers: [BattleService, CharacterService],
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

  users: User[] = [
    { id: 1, name: 'Usuario 1' },
    { id: 2, name: 'Usuario 2' }
  ];
  characters: Character[] = [];
  selectedUser1 = this.users[0].id;
  selectedUser2 = this.users[1].id;
  selectedCharacter1?: number;
  selectedCharacter2?: number;

  // Animación de eventos
  eventAnimations: boolean[] = [];
  eventInterval: any;

  constructor(
    private battleService: BattleService,
    private characterService: CharacterService
  ) { }

  ngOnInit(): void {
    this.loadCharacters();
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
      character2Id: this.selectedCharacter2
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
    this.eventAnimations = new Array(this.battleSummary.events.length).fill(false);
    let idx = 0;
    this.eventInterval = setInterval(() => {
      if (idx < this.eventAnimations.length) {
        this.eventAnimations[idx] = true;
        idx++;
      } else {
        clearInterval(this.eventInterval);
      }
    }, 700);
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
      character2Id: this.selectedCharacter2
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
