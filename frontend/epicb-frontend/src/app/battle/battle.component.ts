import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BattleService } from '../services/battle.service';
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
  providers: [BattleService],
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
export class BattleComponent {
  battleResult?: BattleResult;
  battleSummary?: BattleSummary;
  loading = false;
  error: string | null = null;

  users: User[] = [
    { id: 1, name: 'Usuario 1' },
    { id: 2, name: 'Usuario 2' }
  ];
  characters: Character[] = [
    { id: 1, name: 'Batman', imageUrl: 'assets/batman.png' },
    { id: 2, name: 'Spider-Man', imageUrl: 'assets/spiderman.png' }
  ];
  selectedUser1 = this.users[0].id;
  selectedUser2 = this.users[1].id;
  selectedCharacter1 = this.characters[0].id;
  selectedCharacter2 = this.characters[1].id;

  // Animación de eventos
  eventAnimations: boolean[] = [];
  eventInterval: any;

  constructor(private battleService: BattleService) { }

  fight() {
    const battleData = {
      user1Id: 1,
      user2Id: 2,
      character1Id: 1,
      character2Id: 2
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
    this.loading = true;
    this.error = null;
    const battleData = {
      user1Id: this.selectedUser1?.id,
      user2Id: this.selectedUser2?.id,
      character1Id: this.selectedCharacter1?.id,
      character2Id: this.selectedCharacter2?.id
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
