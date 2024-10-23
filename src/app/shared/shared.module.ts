// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular'; 
import { SearchComponent } from '../component/search/search.component';
import { HeaderComponent } from '../component/header/header.component';
import { ActivityCardComponent } from '../component/activity-card/activity-card.component';

@NgModule({
  declarations: [
    SearchComponent, 
    HeaderComponent,
    ActivityCardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule 
  ],
  exports: [
    SearchComponent, 
    CommonModule,
    FormsModule,
    IonicModule ,
    HeaderComponent,
    ActivityCardComponent
  ]
})
export class SharedModule { }
