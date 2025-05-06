import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../services/user.service';
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

  constructor(private userService: UserService, private router: Router) { }

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
}
