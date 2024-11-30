import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { CharacterManagementComponent } from './character-management/character-management.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

export const routes: Routes = [
  { path: '', component: LoginComponent }, // Página de inicio para el logueo
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'character-management', component: CharacterManagementComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'profile/:id', component: UserProfileComponent }
];
