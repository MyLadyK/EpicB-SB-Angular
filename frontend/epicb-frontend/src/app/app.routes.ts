import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { CharacterManagementComponent } from './character-management/character-management.component';

export const routes: Routes = [
  { path: '', component: LoginComponent }, // Página de inicio para el logueo
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'character-management', component: CharacterManagementComponent }
];
