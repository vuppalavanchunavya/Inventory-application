import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransactionhistoryPage } from './transactionhistory.page';

const routes: Routes = [
  {
    path: '',
    component: TransactionhistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionhistoryPageRoutingModule {}
