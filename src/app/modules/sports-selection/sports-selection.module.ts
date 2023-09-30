import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SportsSelectionComponent } from './sports-selection.component';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    SportsSelectionComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    RouterModule
  ],
  exports: [SportsSelectionComponent] // Export the component if it will be used in other modules
})
export class SportsSelectionModule { }
