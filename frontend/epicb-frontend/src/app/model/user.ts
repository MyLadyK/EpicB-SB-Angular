export interface User {
  id: number;
  name: string;
  mailUser: string;
  passwordHash: string;
  role?: string;
  energy?: number;
  lastEnergyRefill?: string;
  pointsUser?: number;
}
