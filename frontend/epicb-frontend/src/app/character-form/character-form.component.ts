import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CharacterService } from '../services/character.service';
import { Character } from '../model/character';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  selector: 'app-character-form',
  templateUrl: './character-form.component.html',
  styleUrls: ['./character-form.component.css'],
  providers: [CharacterService]
})
export class CharacterFormComponent {
  @Output() characterAdded = new EventEmitter<void>();

  character: Character = {
    idCharacter: 0, // Añadir un valor inicial para idCharacter
    nameCharacter: '',
    healthCharacter: 0,
    attackCharacter: 0,
    defenseCharacter: 0,
    speedCharacter: 0,
    staminaCharacter: 0,
    intelligenceCharacter: 0,
    specialCharacter: 0,
    categoryCharacter: '',
    universeCharacter: '',
    imageUrl: ''
  };

  constructor(private characterService: CharacterService) { }

  addCharacter() {
    this.characterService.addCharacter(this.character).subscribe(
      (response: any) => {
        console.log('Personaje añadido', response);
        this.characterAdded.emit();
        // Puedes añadir una lógica para resetear el formulario o mostrar un mensaje de éxito
      },
      (error: any) => {
        console.error('Error al añadir personaje', error);
      }
    );
  }
}
