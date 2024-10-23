import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransactionhistoryPageRoutingModule } from './transactionhistory-routing.module';

import { TransactionhistoryPage } from './transactionhistory.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransactionhistoryPageRoutingModule
  ],
  declarations: [TransactionhistoryPage]
})
export class TransactionhistoryPageModule {}
