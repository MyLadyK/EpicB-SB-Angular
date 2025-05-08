import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { RouterModule, Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  mailUser = '';
  passwordHash = '';

  constructor(private authService: AuthService, private router: Router) { }

  login() {
  this.authService.authenticate(this.mailUser, this.passwordHash).subscribe(
    response => {
      if (response.roleUser && response.roleUser.toUpperCase() === 'ADMIN') {
        this.router.navigate(['/admin-dashboard']);
      } else {
        this.router.navigate([`/profile/${response.idUser}`]);
      }
    },
    error => {
      console.error('Error al iniciar sesión', error);
    }
  );
}
}
