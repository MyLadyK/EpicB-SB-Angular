import { User } from './user';
import { BattleEvent } from './battle-event';

export interface BattleResult {
  idBattleResult: number;
  user1: User;
  user2: User;
  winner: User;
  battleDate: Date | null;
  battlePoints: number;
  events: BattleEvent[];
  finalHealth1: number;
  finalHealth2: number;
  opponentName: string;
  result: string;
  pointsGained: number;
  pointsLost: number;
  surprisePackageDescription?: string;
  date?: string;
  isUser1Winner?: boolean;
  surpriseDescription?: string;
}
