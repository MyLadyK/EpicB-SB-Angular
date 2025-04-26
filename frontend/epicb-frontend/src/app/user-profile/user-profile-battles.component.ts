import { Component, Input, OnInit } from '@angular/core';
import { BattleResult } from '../model/battle-result';
import { BattleService } from '../services/battle.service';

@Component({
  selector: 'app-user-profile-battles',
  templateUrl: './user-profile-battles.component.html',
  styleUrls: ['./user-profile-battles.component.css']
})
export class UserProfileBattlesComponent implements OnInit {
  @Input() userId!: number;
  battles: BattleResult[] = [];

  constructor(private battleService: BattleService) {}

  ngOnInit(): void {
    if (this.userId) {
      this.battleService.getBattlesByUser(this.userId).subscribe(
        (battles: BattleResult[]) => this.battles = battles,
        (error: any) => this.battles = []
      );
    }
  }
}
