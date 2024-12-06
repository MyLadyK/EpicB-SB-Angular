import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { CharacterManagementComponent } from '../character-management/character-management.component';
import { User } from '../model/user';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, CharacterManagementComponent], // Asegúrate de que CharacterManagementComponent está incluido
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  providers: [UserService]
})
export class AdminDashboardComponent implements OnInit {
  users: User[] = [];

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(
      response => {
        this.users = response;
      },
      error => {
        console.error('Error al cargar usuarios', error);
      }
    );
  }

  banUser(userId: number, duration: string) {
    this.userService.banUser(userId, duration).subscribe(
      response => {
        console.log('Usuario baneado', response);
        this.loadUsers();
      },
      error => {
        console.error('Error al banear usuario', error);
      }
    );
  }

  navigateToCharacterManagement() {
    this.router.navigate(['/character-management']);
  }

  navigateToUserManagement() {
    this.router.navigate(['/user-management']);
  }
}
