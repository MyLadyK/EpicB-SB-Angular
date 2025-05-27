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
  characters: Character[] = [];
  showUserManagement: boolean = true;
  showCharacterManagement: boolean = false;

  // Gestión de personajes
  showAddCharacterForm = false;
  newCharacter: Partial<Character> = {};
  selectedCharacter: Character | null = null;
  isEditMode = false;
  selectedFile: File | null = null;

  constructor(private userService: UserService, private router: Router, private characterService: CharacterService) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadCharacters();
  }

  toggleUserManagement(): void {
    this.showUserManagement = true;
    this.showCharacterManagement = false;
  }

  toggleCharacterManagement(): void {
    this.showUserManagement = false;
    this.showCharacterManagement = true;
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
      },
      error: (error: Error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  loadCharacters(): void {
    this.characterService.getCharacters().subscribe({
      next: (data: Character[]) => {
        this.characters = data;
      },
      error: (error: Error) => {
        console.error('Error loading characters:', error);
      }
    });
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

  editUser(user: User): void {
    // Implementar lógica de edición de usuario
    console.log('Editing user:', user);
  }

  deleteUser(user: User): void {
    if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${user.nameUser}?`)) {
      this.userService.eliminateUser(user.idUser).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.idUser !== user.idUser);
        },
        error: (error: Error) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  editCharacter(character: Character): void {
    this.selectedCharacter = { ...character };
    this.isEditMode = true;
    this.showCharacterManagement = true;
  }

  updateCharacter(): void {
    if (this.selectedCharacter) {
      this.characterService.updateCharacter(this.selectedCharacter).subscribe({
        next: () => {
          alert('Personaje actualizado con éxito');
          this.resetForm();
          this.loadCharacters();
        },
        error: (error: Error) => {
          alert('Error al actualizar');
          console.error('Error al actualizar personaje:', error);
        }
      });
    }
  }

  resetForm(): void {
    this.selectedCharacter = null;
    this.isEditMode = false;
    this.showAddCharacterForm = false;
  }

  deleteCharacter(character: Character): void {
    if (confirm(`¿Estás seguro de que quieres eliminar al personaje ${character.nameCharacter}?`)) {
      this.characterService.deleteCharacter(character.idCharacter).subscribe({
        next: () => {
          this.characters = this.characters.filter(c => c.idCharacter !== character.idCharacter);
        },
        error: (error: Error) => {
          console.error('Error deleting character:', error);
        }
      });
    }
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


