import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GoodsReceiptFunctionalityPage } from './goods-receipt-functionality.page';

const routes: Routes = [
  {
    path: '',
    component: GoodsReceiptFunctionalityPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GoodsReceiptFunctionalityPageRoutingModule {}
