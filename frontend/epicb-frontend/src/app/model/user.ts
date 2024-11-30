export interface User {
  idUser?: number;
  nameUser: string;
  mailUser: string;
  passwordHash: string;
  role?: string;
  energy?: number;
  lastEnergyRefill?: string;
  pointsUser?: number;
}
