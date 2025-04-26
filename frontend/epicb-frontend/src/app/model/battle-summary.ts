export interface BattleSummary {
  winnerName: string;
  finalHealth1: number;
  finalHealth2: number;
  events: string[];
  surprisePackage?: string; // Nuevo: descripción del paquete sorpresa
  pointsAwarded?: number;   // Nuevo: puntos ganados para el ranking
}
