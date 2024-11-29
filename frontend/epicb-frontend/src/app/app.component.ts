import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // Importar RouterModule aquí
import { AuthService } from './services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [RouterModule, FormsModule], // Asegúrate de incluir RouterModule aquí
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AuthService]
})
export class AppComponent {
  title = 'epicb-frontend';
  mailUser: string = '';
  passwordHash: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.authenticate(this.mailUser, this.passwordHash).subscribe(
      response => {
        if (response.role === 'ADMIN') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/user-dashboard']);
        }
      },
      error => {
        console.error('Error al iniciar sesión', error);
      }
    );
  }
}
