import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../model/user';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  user = {
    idUser: 0,
    nameUser: '',
    mailUser: '',
    passwordHash: '',
    role: 'USER',
    energy: 8,
    LastEnergyRefill: '',
    pointUser: 0
  };

  constructor(private userService: UserService, private router: Router) { }

  register() {
    if (!this.user.nameUser || !this.user.mailUser || !this.user.passwordHash) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    this.userService.register(this.user).subscribe(
      (response) => {
        alert('¡Registro exitoso!');
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Error en el registro:', error);
        alert('Error en el registro. Por favor, intenta de nuevo.');
      }
    );
  }
}
