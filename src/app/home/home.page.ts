import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { NetworkService } from '../services/network.service';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  username: string = '';  
  password: string = '';  
  showPassword: boolean = false;
  isOnline: boolean = true;

  constructor(
    private apiService: ApiService,
    private storage: Storage,
    private router: Router,
    private networkService: NetworkService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.initializeNetwork();
  }

  async initializeNetwork() {
    this.isOnline = await this.networkService.isOnline();

    this.networkService.onNetworkChange((isOnline: boolean) => {
      this.isOnline = isOnline;
      if (!isOnline) {
        this.presentToast('You are offline. Some functionalities may be unavailable.', 'danger');
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async presentToast(message: string, color: 'success' | 'danger' = 'danger', duration: number = 2000) {
    const toast = await this.toastController.create({
      message,
      color,
      duration,
      position: 'bottom'
    });
    toast.present();
  }

  async presentLoading(message: string = 'Please wait...', duration: number = 2000) {
    const loading = await this.loadingController.create({
      message,
      duration
    });
    await loading.present();
    return loading;
  }

  async presentAlert(header: string, message: string, buttons: string[] = ['OK']) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons
    });
    await alert.present();
  }

  async saveResponsibilities(res: any) {
    const loginResponse = res.data.map((item: any) => item);
    await this.storage.set('loginResponse', loginResponse);
    console.log(loginResponse);
  }

  async onLogin() {
    if (!this.isOnline) {
      await this.presentToast('You are offline. Please check your connection before logging in.', 'danger');
      return;
    }

    if (!this.username) {
      await this.presentAlert('Missing Field', 'Please enter your username.');
      return;
    }

    if (!this.password) {
      await this.presentAlert('Missing Field', 'Please enter your password.');
      return;
    }

    const loading = await this.presentLoading();

    this.apiService.login(this.username, this.password).pipe(
      tap(async response => {
        if (response && response.data) {
          
          await this.storage.set('username', this.username);
          await this.storage.set('loginResponse', response.data);

          if (response.data[0].STATUS == 1) {
            await this.saveResponsibilities(response);
            this.presentToast('Login Successful', 'success');
            this.router.navigate(['/organization']);
            this.username = '';
            this.password = '';
          } else {
          this.presentToast(response.data[0].ERROR);
          }
        } else {
        this.presentToast('Unexpected response format', 'danger');
        }
      }),
      catchError(async error => {
        console.error('API Error:', error);
        await this.presentToast('Login failed', 'danger');
        return of(null);
      }),
      finalize(async () => {
        await loading.dismiss();
      })
    ).subscribe(); 
  }
}
