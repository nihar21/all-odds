import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { LeagueDetailsComponent } from './league-details.component';

@NgModule({
  declarations: [
    LeagueDetailsComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    RouterModule,
  ],
  exports: [LeagueDetailsComponent] // Export the component if it will be used in other modules
})
export class LeagueDetailsModule { }
