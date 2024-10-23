import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { DatabaseService } from './services/database.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private storage: Storage,
    private databaseService: DatabaseService
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    try {
      await this.storage.create(); 
      console.log('Storage initialized');
    } catch (error) {
      console.error('Failed to initialize storage:', error);
    }
  }
}
