import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../model/user';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [FormsModule, RouterModule],
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
    this.userService.register(this.user).subscribe(
      response => {
        console.log('Usuario registrado con éxito', response);
        alert('Usuario Registrado')
        // Redirigir a algún sitio
        this.router.navigate([`/profile/${response.idUser}`])
      },
      error => {
        console.error('Error al registrar nuevo usuario', error);
      }
    );
  }
}
