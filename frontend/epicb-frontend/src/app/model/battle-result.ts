import { User } from './user';
import { BattleEvent } from './battle-event';

export interface BattleResult {
  idBattle: number;
  user1: User;
  user2: User;
  winner: User;
  events: BattleEvent[];
  finalHealth1: number;
  finalHealth2: number;
  battleDate: Date;
  date?: string;
  opponentName?: string;
  result?: string;
}
