import { UserCharacter } from './user-character';

export interface BattleEvent {
  target: 'character1' | 'character2';
  damage: number;
  attacker: UserCharacter;
  defender: UserCharacter;
  description?: string;
}
