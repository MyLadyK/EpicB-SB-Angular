import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { User } from '../model/user';
import { UserProfileBattlesComponent } from './user-profile-battles.component';
import { UserCharacterService } from '../services/user-character.service';
import { CharacterService } from '../services/character.service';
import { Character } from '../model/character';
import { UserCharacter } from '../model/user-character';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [RouterModule, UserProfileBattlesComponent, CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: any = {
    idUser: 0,
    nameUser: '',
    mailUser: '',
    passwordHash: '',
    role: '',
    energy: 0,
    lastEnergyRefill: '',
    pointsUser: 0
  };

  userCollection: UserCharacter[] = [];
  allCharacters: Character[] = [];
  feedbackMsg = '';
  loadingCollection = false;
  selectedCharacterId: number | null = null;

  get userId(): number {
    return this.user.idUser;
  }

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private userCharacterService: UserCharacterService,
    private characterService: CharacterService
  ) { }

  ngOnInit(): void {
    const userId = Number(this.route.snapshot.paramMap.get('id'));
    this.userService.getUserById(userId).subscribe(
      user => this.user = user,
      error => console.error('Error al cargar el perfil del usuario', error)
    );
    this.loadUserCollection();
    this.loadAllCharacters();
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

  loadAllCharacters() {
    this.characterService.getCharacters().subscribe(
      chars => this.allCharacters = chars,
      err => console.error('Error al cargar personajes', err)
    );
  }

  canAddToCollection(): boolean {
    return this.userCollection.length < 8;
  }

  isInCollection(character: Character): boolean {
    return this.userCollection.some(uc => uc.baseCharacter.idCharacter === character.idCharacter);
  }

  getCharacterImageUrl(character: Character | null): string {
    if (!character?.imageUrl) {
      return '';
    }
    // Add the backend URL prefix if it's not already included
    if (character.imageUrl.startsWith('http')) {
      return character.imageUrl;
    }
    return 'http://localhost:8081' + character.imageUrl;
  }

  addToCollection(character: Character) {
    if (!this.canAddToCollection()) {
      this.feedbackMsg = 'No puedes tener más de 8 personajes en tu colección.';
      return;
    }
    this.userCharacterService.addCharacterToCollection(character.idCharacter).subscribe({
      next: (response) => {
        this.feedbackMsg = response.message || 'Personaje añadido a tu colección.';
        this.loadUserCollection();
        this.selectedCharacterId = null;
      },
      error: (err) => {
        this.feedbackMsg = err.error?.message || err.error || 'No se pudo añadir el personaje.';
      }
    });
  }

  addToCollectionById() {
    if (!this.selectedCharacterId) return;
    const char = this.allCharacters.find(c => c.idCharacter === this.selectedCharacterId);
    if (char) {
      this.addToCollection(char);
    }
  }

  removeFromCollection(character: Character) {
    this.userCharacterService.removeCharacterFromCollection(character.idCharacter).subscribe({
      next: (response) => {
        this.feedbackMsg = response.message || 'Personaje eliminado de tu colección.';
        this.loadUserCollection();
      },
      error: (err) => {
        this.feedbackMsg = err.error?.message || err.error || 'No se pudo eliminar el personaje.';
      }
    });
  }
}
