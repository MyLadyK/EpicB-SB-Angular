import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // Importar RouterModule aquí
import { AuthService } from './services/auth.service';
import { FormsModule } from '@angular/forms';
import { DemoModeService } from './demo-mode.service';

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
  mailUser = '';
  passwordHash = '';
  demoMode = false;
  user: any = null;
  showUserMenu = false;
  feedbackMsg = '';
  feedbackType: 'success' | 'error' | '' = '';

  constructor(private authService: AuthService, private router: Router, private demoModeService: DemoModeService) {
    // Suscribirse a demoMode
    setInterval(() => {
      this.demoMode = this.demoModeService.demoMode;
      this.user = this.authService.getCurrentUser();
    }, 1000);
  }

  login() {
    this.authService.authenticate(this.mailUser, this.passwordHash).subscribe(
      response => {
        this.authService.setSession(response);
        this.user = response;
        this.showFeedback('¡Bienvenido, ' + response.name + '!', 'success');
        if (this.authService.isAdmin(response)) {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/user-dashboard']);
        }
      },
      error => {
        this.showFeedback('Error al iniciar sesión', 'error');
      }
    );
  }

  logout() {
    this.authService.logout();
    this.user = null;
    this.router.navigate(['/']);
    this.showFeedback('Sesión cerrada correctamente', 'success');
  }

  showFeedback(msg: string, type: 'success' | 'error') {
    this.feedbackMsg = msg;
    this.feedbackType = type;
    setTimeout(() => {
      this.feedbackMsg = '';
      this.feedbackType = '';
    }, 3500);
  }
}
