import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SportsSelectionComponent } from './modules/sports-selection/sports-selection.component'
import { SportDetailComponent } from './modules/sport-details/sport-detail.component';
import { LeagueDetailsComponent } from './modules/league-details/league-details.component';

const routes: Routes = [
  { path: '', component: SportsSelectionComponent },
  { path: 'sport/:sportTitle', component: SportDetailComponent },
  { path: 'sport/:sportTitle/league/:leagueKey', component: LeagueDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
