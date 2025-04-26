import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterFormComponent } from '../character-form/character-form.component';
import { CharacterService } from '../services/character.service';
import { Character } from '../model/character';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CharacterFormComponent],
  selector: 'app-character-management',
  templateUrl: './character-management.component.html',
  styleUrls: ['./character-management.component.css'],
  providers: [CharacterService]
})
export class CharacterManagementComponent implements OnInit {
  characters: Character[] = [];
  selectedCharacter: Character | null = null;
  isEditMode: boolean = false;

  constructor(private characterService: CharacterService) { }

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters() {
    this.characterService.getCharacters().subscribe(
      response => {
        this.characters = response;
      },
      error => {
        console.error('Error al cargar personajes', error);
      }
    );
  }

  selectCharacter(character: Character) {
    this.selectedCharacter = { ...character };
    this.isEditMode = true;
  }

  deleteCharacter(characterId: number) {
    if (characterId !== undefined) {
      this.characterService.deleteCharacter(characterId).subscribe(
        response => {
          alert('Personaje eliminado con éxito');
          this.loadCharacters();
        },
        error => {
          alert('Error al eliminar')
          console.error('Error al eliminar personaje', error);
        }
      );
    }
  }

  resetForm() {
    this.selectedCharacter = null;
    this.isEditMode = false;
  }

  updateCharacter() {
    if (this.selectedCharacter) {
      this.characterService.updateCharacter(this.selectedCharacter).subscribe(
        response => {
          alert('Personaje actualizado con éxito');
          this.resetForm();
          this.loadCharacters();
        },
        error => {
          alert('Error al actualizar')
          console.error('Error al actualizar personaje', error);
        }
      );
    }
  }
}
