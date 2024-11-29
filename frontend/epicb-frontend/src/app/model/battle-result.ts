export interface BattleResult {
  idBattleResult: number;
  user1: any; // Puedes crear modelos específicos para User y Character
  user2: any;
  winner: any;
  battleDate: Date;
}
