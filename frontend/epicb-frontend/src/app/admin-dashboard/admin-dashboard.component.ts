import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service'; // Asegúrate de tener el servicio de usuario
import { CharacterManagementComponent } from '../character-management/character-management.component';
import { User } from '../model/user';

@Component({
  standalone: true,
  imports: [CommonModule, CharacterManagementComponent],
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  providers: [UserService]
})
export class AdminDashboardComponent implements OnInit {
  users: User[] = [];

  constructor(private userService: UserService) { }

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
}
