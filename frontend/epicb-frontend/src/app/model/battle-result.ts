import { User } from './user';

export interface BattleResult {
  idBattleResult: number;
  user1: User; // Puedes crear modelos específicos para User y Character
  user2: User;
  winner: User;
  battleDate: Date;
}
