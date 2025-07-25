import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { RouterModule, Router } from '@angular/router';
import { DemoModeService } from '../demo-mode.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  mailUser = '';
  password = '';

  constructor(private authService: AuthService, private router: Router, private demoModeService: DemoModeService) { }

  login() {
  this.authService.authenticate(this.mailUser, this.password).subscribe(
    response => {
      console.log('Respuesta de login:', response);
      // Desactivar modo demo cuando el login es exitoso
      this.demoModeService.setDemoMode(false);
      this.authService.setSession(response);
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
