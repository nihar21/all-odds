import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SportDetailComponent } from './sport-detail.component';

import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    SportDetailComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    RouterModule,
  ],
  exports: [SportDetailComponent] // Export the component if it will be used in other modules
})
export class SportDetailModule { }
