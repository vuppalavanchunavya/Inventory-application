import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { SQLiteService } from 'src/app/services/sqlite.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  goodsReceiptResp: boolean = true;
  selectedOrganization: string = '';

  constructor(
    private router: Router,
    private menu: MenuController,
    private storage: Storage,
    private alertController: AlertController,
    private sqliteService:SQLiteService
  ) {}

  ngOnInit() {
    this.initializeData();
  }

  private async initializeData() {
    try {
      const value = await this.storage.get('selectedorg');
      this.selectedOrganization = value?.InventoryOrgCode || '';
      await this.menu.enable(true, 'start');
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }

  goToGoodsReceipt() {
    this.router.navigate(['/goods-receipt-functionality']);
  }

  goToTransactionHistory() {
    this.router.navigate(['/transactionhistory']);
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Logout canceled');
          }
        },
        {
          text: 'OK',
          handler: async () => {
            console.log('Logging out...');
            await this.performLogout();
            this.router.navigate(['/home']);
          }
        }
      ]
    });

    await alert.present();
  }

  // async logoutAndClearData() {
    
  //             await this.storage.clear();
  //             await this.sqliteService.clearDb();
  //             await this.router.navigate(['/home']);

  //   const alert = await this.alertController.create({
  //     header: 'Confirm Logout and Clear Data',
  //     message: 'Are you sure you want to logout and clear all data?',
  //     buttons: [
  //       {
  //         text: 'Cancel',
  //         role: 'cancel',
  //         cssClass: 'secondary',
  //         handler: () => {
  //           console.log('Logout and clear data canceled');
  //         }
  //       },
  //       {
  //         text: 'OK',
          
  //       }
  //     ]
  //   });

  //   await alert.present();
  // }
  async logoutAndClearData() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout and Clear Data',
      message: 'Are you sure you want to logout and clear all data?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Logout and clear data canceled');
          }
        },
        {
          text: 'OK',
          handler: async () => {
            // Proceed with logout and clear data after confirmation
            await this.storage.clear();
            await this.sqliteService.clearDb();
            await this.router.navigate(['/home']);
            console.log('User logged out and data cleared');
          }
        }
      ]
    });

    // Present the confirmation alert
    await alert.present();
}

  private async performLogout(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          console.log('Logout operation completed.');
          resolve();
        }, 1000);
      } catch (error) {
        reject(error);
      }
    });
  }
}
