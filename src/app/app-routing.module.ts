import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'organization',
    loadChildren: () => import('./pages/organization/organization.module').then( m => m.OrganizationPageModule)
  },
  {
    path: 'activity',
    loadChildren: () => import('./pages/activity/activity.module').then( m => m.ActivityPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'item-details',
    loadChildren: () => import('./pages/item-details/item-details.module').then( m => m.ItemDetailsPageModule)
  },
  {
    path: 'goods-receipt-functionality',
    loadChildren: () => import('./pages/goods-receipt-functionality/goods-receipt-functionality.module').then( m => m.GoodsReceiptFunctionalityPageModule)
  },
  {
    path: 'items-page/:poNumber',
    loadChildren: () => import('./pages/items-page/items-page.module').then( m => m.ItemsPagePageModule)
  },
  {
    path: 'transactionhistory',
    loadChildren: () => import('./pages/transactionhistory/transactionhistory.module').then( m => m.TransactionhistoryPageModule)
  },
  
  
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
