export interface SurprisePackage {
  idSurprisePackage: number;
  description: string;
  modificationType: 'attack' | 'defense' | 'speed' | 'stamina' | 'intelligence' | 'special' | 'health';
  modificationValue: number;
} 