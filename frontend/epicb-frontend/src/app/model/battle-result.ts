import { User } from './user';

export interface BattleResult {
  idBattleResult: number;
  user1: any;
  user2: any;
  winner: any;
  battleDate: Date;
  date?: string; // Para compatibilidad con el template
  opponentName?: string;
  result?: string;
}
