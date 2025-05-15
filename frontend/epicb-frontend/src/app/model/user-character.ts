import { Character } from './character';

export interface UserCharacter {
  idUserCharacter: number;
  owner: any; // Puedes definir un modelo User si lo necesitas
  baseCharacter: Character;
  healthUserCharacter: number;
  attackUserCharacter: number;
  defenseUserCharacter: number;
  speedUserCharacter: number;
  staminaUserCharacter: number;
  intelligenceUserCharacter: number;
}
