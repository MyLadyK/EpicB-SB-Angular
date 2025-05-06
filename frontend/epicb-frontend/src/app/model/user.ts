export interface User {
  idUser: number;
  nameUser: string;
  mailUser: string;
  passwordHash: string;
  roleUser?: string;
  energyUser?: number;
  lastEnergyRefill?: string;
  pointsUser?: number;
}
