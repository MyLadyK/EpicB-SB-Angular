import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { FormsModule } from '@angular/forms';
import { DemoModeService } from './demo-mode.service';
import { ErrorToastComponent } from './components/error-toast/error-toast.component';
import { CharacterListComponent } from './character-list/character-list.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, ErrorToastComponent, CharacterListComponent], // Asegúrate de incluir todos los componentes necesarios
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AuthService]
})
export class AppComponent {
  title = 'epicb-frontend';
  mailUser = '';
  passwordHash = '';
  showCharacterList = false;
  demoMode = false;
  user: any = null;
  showUserMenu = false;
  feedbackMsg = '';
  feedbackType: 'success' | 'error' | '' = '';

  constructor(public authService: AuthService, private router: Router, private demoModeService: DemoModeService) {
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
        // this.showFeedback('¡Bienvenido, ' + response.nameUser + '!', 'success');
        // if (this.authService.isAdmin && this.authService.isAdmin(response)) {
        //   this.router.navigate(['/admin-dashboard']);
        // } else {
        //   this.router.navigate(['/']);
        // }
      },
      error => {
        this.feedbackMsg = 'Error de autenticación';
        this.feedbackType = 'error';
        // this.showFeedback('Error de autenticación', 'error');
      }
    );
  }

  logout() {
    this.authService.logout();
    this.user = null;
    this.router.navigate(['/login']);
    // this.showFeedback('Sesión cerrada correctamente', 'success');
  }
}
