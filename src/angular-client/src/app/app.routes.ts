import { Routes } from '@angular/router';

export const routes: Routes = [
  {path: '', redirectTo: 'lobby', pathMatch: 'full'},
  {path: 'lobby', loadComponent: () =>
      import('./pages/lobby/lobby.component').then(m => m.LobbyComponent)},
  {path: 'game', loadComponent: () =>
      import('./pages/game/game.component').then(m => m.GameComponent)}

];
