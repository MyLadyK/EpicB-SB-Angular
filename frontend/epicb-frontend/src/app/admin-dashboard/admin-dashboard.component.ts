import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { CharacterService } from '../services/character.service';
import { Character } from '../model/character';
import { CharacterManagementComponent } from '../character-management/character-management.component';
import { User } from '../model/user';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, CharacterManagementComponent, FormsModule],
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  providers: [UserService]
})
export class AdminDashboardComponent implements OnInit {
  users: User[] = [];
  isUserManagementVisible = false;
  isCharacterManagementVisible = false;

  // Gestión de personajes
  showAddCharacterForm = false;
  newCharacter: Partial<Character> = {};
  characters: Character[] = [];
  selectedFile: File | null = null;

  constructor(private userService: UserService, private router: Router, private characterService: CharacterService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (response: User[]) => {
        this.users = response;
      },
      (error: Error) => {
        console.error('Error al cargar usuarios', error);
      }
    );
  }

  banUser(userId: number, duration: string): void {
    this.userService.banUser(userId, duration).subscribe(
      (response: { success: boolean }) => {
        console.log('Usuario baneado', response);
        this.loadUsers();
      },
      (error: Error) => {
        console.error('Error al banear usuario', error);
      }
    );
  }

  navigateToCharacterManagement(): void {
    this.isUserManagementVisible = false;
    this.isCharacterManagementVisible = true;
    this.loadCharacters();
  }

  navigateToUserManagement(): void {
    this.isCharacterManagementVisible = false;
    this.isUserManagementVisible = true;
  }

  // NUEVO: Cambiar rol de usuario
  changeUserRole(user: User, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newRole = selectElement.value;
    
    this.userService.changeUserRole(user.idUser, newRole).subscribe(
      (response: { success: boolean }) => {
        this.loadUsers();
      },
      (error: Error) => {
        console.error('Error al cambiar el rol del usuario', error);
      }
    );
  }

  // --- Gestión de personajes ---
  loadCharacters(): void {
    this.characterService.getCharacters().subscribe(
      (response: Character[]) => {
        this.characters = response;
      },
      (error: Error) => {
        console.error('Error al cargar personajes', error);
      }
    );
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;
  }

  addCharacter(): void {
    if (!this.newCharacter.nameCharacter || !this.newCharacter.universeCharacter || !this.selectedFile) return;

    // 1. Subir imagen
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('nombrePersonaje', this.newCharacter.nameCharacter);
    formData.append('universo', this.newCharacter.universeCharacter);

    this.characterService.uploadImage(formData).subscribe({
      next: (res: any) => {
        // 2. Crear personaje con la ruta devuelta
        this.newCharacter.imageUrl = res.imageUrl;
        this.characterService.addCharacter(this.newCharacter as Character).subscribe({
          next: () => {
            this.loadCharacters();
            this.showAddCharacterForm = false;
            this.newCharacter = {};
            this.selectedFile = null;
          },
          error: (err) => {
            alert('Error al añadir personaje');
            console.error('Error al añadir personaje', err);
          }
        });
      },
      error: (err) => {
        alert('Error al subir imagen');
        console.error('Error al subir imagen', err);
      }
    });
  }
}


