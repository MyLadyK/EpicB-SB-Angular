import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // Importar RouterModule aquí
import { AuthService } from './services/auth.service';
import { FormsModule } from '@angular/forms';
import { DemoModeService } from './demo-mode.service';
import { CommonModule } from '@angular/common';
import { ErrorToastComponent } from './components/error-toast/error-toast.component';

@Component({
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, ErrorToastComponent], // Asegúrate de incluir RouterModule aquí
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

  // Cambia acceso a authService a public para acceso desde template
  constructor(public authService: AuthService, private router: Router, private demoModeService: DemoModeService) {
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
        this.showFeedback('¡Bienvenido, ' + response.nameUser + '!', 'success');
        if (this.authService.isAdmin(response)) {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error => {
        this.showFeedback('Error de autenticación', 'error');
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
