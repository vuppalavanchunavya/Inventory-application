import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GoodsReceiptFunctionalityPageRoutingModule } from './goods-receipt-functionality-routing.module';
import { GoodsReceiptFunctionalityPage } from './goods-receipt-functionality.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GoodsReceiptFunctionalityPageRoutingModule,SharedModule
  ],
  declarations: [GoodsReceiptFunctionalityPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]  
})
export class GoodsReceiptFunctionalityPageModule {}
