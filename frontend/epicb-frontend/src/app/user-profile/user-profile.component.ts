import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router'; // Asegúrate de importar RouterModule
import { UserService } from '../services/user.service';
import { User } from '../model/user';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [RouterModule], // Importa RouterModule para las rutas
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'] // Corrige el nombre de la propiedad
})
export class UserProfileComponent implements OnInit {
  user: User = {
    idUser: 0,
    nameUser: '',
    mailUser: '',
    passwordHash: '',
    role: '',
    energy: 0,
    lastEnergyRefill: '',
    pointsUser: 0
  };

  constructor(private route: ActivatedRoute, private userService: UserService) { }

  ngOnInit(): void {
    const userId = Number(this.route.snapshot.paramMap.get('id'));
    this.userService.getUserById(userId).subscribe(
      user => this.user = user,
      error => console.error('Error al cargar el perfil del usuario', error)
    );
  }
}
