import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BattleService } from '../services/battle.service';
import { BattleResult } from '../model/battle-result';

@Component({
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  selector: 'app-battle',
  templateUrl: './battle.component.html',
  styleUrls: ['./battle.component.css'],
  providers: [BattleService] // Correcto: Proveedor de servicio
})
export class BattleComponent {
  battleResult?: BattleResult;

  constructor(private battleService: BattleService) { }

  fight() {
    const battleData = {
      user1Id: 1,
      user2Id: 2,
      character1Id: 1,
      character2Id: 2
    };

    this.battleService.fight(battleData).subscribe(
      result => this.battleResult = result,
      error => console.error(error)
    );
  }
}
