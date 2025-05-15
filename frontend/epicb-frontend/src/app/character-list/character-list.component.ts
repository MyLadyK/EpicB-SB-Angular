import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../services/character.service';
import { UserCharacterService } from '../services/user-character.service';
import { Character } from '../model/character';
import { UserCharacter } from '../model/user-character';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-character-list',
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.css']
})
export class CharacterListComponent implements OnInit {
  characters: Character[] = [];
  flippedIndexes: boolean[] = [];
  backendUrl: string = 'http://localhost:8081';

  userCollection: UserCharacter[] = [];
  loadingCollection = false;
  feedbackMsg = '';

  constructor(private characterService: CharacterService, private userCharacterService: UserCharacterService) { }

  ngOnInit(): void {
    this.loadCharacters();
    this.loadUserCollection();
  }

  loadCharacters() {
    this.characterService.getCharacters().subscribe(
      characters => {
        this.characters = characters;
        this.flippedIndexes = new Array(characters.length).fill(false);
      },
      error => console.error('Error al cargar personajes', error)
    );
  }

  loadUserCollection() {
    this.loadingCollection = true;
    this.userCharacterService.getMyCollection().subscribe({
      next: (collection) => {
        this.userCollection = collection;
        this.loadingCollection = false;
      },
      error: () => {
        this.feedbackMsg = 'No se pudo cargar tu colección';
        this.loadingCollection = false;
      }
    });
  }

  isInCollection(character: Character): boolean {
    return this.userCollection.some(uc => uc.baseCharacter.idCharacter === character.idCharacter);
  }

  canAddToCollection(): boolean {
    return this.userCollection.length < 8;
  }

  addToCollection(character: Character) {
    if (!this.canAddToCollection()) {
      this.feedbackMsg = 'No puedes tener más de 8 personajes en tu colección.';
      return;
    }
    this.userCharacterService.addCharacterToCollection(character.idCharacter).subscribe({
      next: () => {
        this.feedbackMsg = 'Personaje añadido a tu colección.';
        this.loadUserCollection();
      },
      error: (err) => {
        this.feedbackMsg = err.error || 'No se pudo añadir el personaje.';
      }
    });
  }

  removeFromCollection(character: Character) {
    this.userCharacterService.removeCharacterFromCollection(character.idCharacter).subscribe({
      next: () => {
        this.feedbackMsg = 'Personaje eliminado de tu colección.';
        this.loadUserCollection();
      },
      error: (err) => {
        this.feedbackMsg = err.error || 'No se pudo eliminar el personaje.';
      }
    });
  }

  toggleFlip(index: number) {
    this.flippedIndexes[index] = !this.flippedIndexes[index];
  }

  getImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return this.backendUrl + url;
  }
}


