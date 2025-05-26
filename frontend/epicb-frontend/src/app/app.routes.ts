import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { CharacterManagementComponent } from './character-management/character-management.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { CharacterListComponent } from './character-list/character-list.component';
import { RankingComponent } from './ranking/ranking.component';
import { BattleComponent } from './battle/battle.component';
import { HelpComponent } from './help.component';
import { TermsComponent } from './terms/terms.component';
import { AboutComponent } from './about/about.component';
import { AdminGuard } from './guards/admin.guard';
import { UserGuard } from './guards/user.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent }, // Página de inicio para el logueo
  { path: 'login', redirectTo: '', pathMatch: 'full' }, // Redirige /login a la raíz
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'character-management',
    component: CharacterManagementComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'sign-up',
    component: SignUpComponent
  },
  {
    path: 'profile/:id',
    component: UserProfileComponent,
    canActivate: [UserGuard]
  },
  {
    path: 'characters',
    component: CharacterListComponent,
    canActivate: [UserGuard]
  },
  {
    path: 'ranking',
    component: RankingComponent,
    canActivate: [UserGuard]
  },
  {
    path: 'battle/:id',
    component: BattleComponent,
    canActivate: [UserGuard]
  },
  {
    path: 'help',
    component: HelpComponent
  },
  {
    path: 'terms',
    component: TermsComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
