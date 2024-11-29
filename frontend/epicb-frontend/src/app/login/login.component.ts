import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { RouterModule } from '@angular/router'

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [AuthService]
})
export class LoginComponent {
  mailUser: string = '';
  passwordHash: string = '';

  constructor(private authService: AuthService) { }

  login() {
    this.authService.authenticate(this.mailUser, this.passwordHash).subscribe(
      response => {
        if (response.role === 'ADMIN') {
          // Redirigir a la página de administración
          console.log('Admin login successful');
        } else {
          // Redirigir a la página de usuario regular
          console.log('User login successful');
        }
      },
      error => {
        console.error('Error al iniciar sesión', error);
      }
    );
  }
}
