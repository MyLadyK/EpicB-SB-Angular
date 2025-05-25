export interface User {
  idUser: number;
  nameUser: string;
  mailUser: string;
  passwordHash?: string;
  roleUser?: string;
  energy?: number;
  lastEnergyRefill?: string;
  pointsUser?: number;
  token?: string; // JWT
  role?: string;
}
