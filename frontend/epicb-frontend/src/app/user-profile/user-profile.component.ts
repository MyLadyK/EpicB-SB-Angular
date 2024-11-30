import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../model/user';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
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