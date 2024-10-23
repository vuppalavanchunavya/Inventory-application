import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemsPagePageRoutingModule } from './items-page-routing.module';

import { ItemsPage } from './items-page.page';
import { SharedModule } from "../../shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemsPagePageRoutingModule,
    SharedModule
],
  declarations: [ItemsPage]
})
export class ItemsPagePageModule {}
