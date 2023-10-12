import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
    FormsModule
  ],
  exports: [LeagueDetailsComponent] // Export the component if it will be used in other modules
})
export class LeagueDetailsModule { }
