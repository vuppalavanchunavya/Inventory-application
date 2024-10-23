
import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Subject, Subscription } from 'rxjs';
import { SyncApiDataService } from 'src/app/services/syncdata.service';
import { ACTIVITY_CARDS } from 'src/app/constants/activity-cards';
import { DataService } from 'src/app/services/data.service';
import { SQLiteService } from 'src/app/services/sqlite.service';

interface CountUpdate {
  length: number;
  countName: string;
}

@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
})
export class ActivityPage implements OnInit {
  @ViewChild(IonContent) contentArea?: IonContent;

  selectedOrg: string | null = null;
  responsibility: string[] = [];
  loadingQueue = false;
  queueLoaded = false;
  activityCards = JSON.parse(JSON.stringify(ACTIVITY_CARDS));
  errorArray: any[] = [];
  refreshApis = new Subject();
  refreshApis$ = this.refreshApis.asObservable();
  loadingShowofflinedata = false;
  showOfflineData = false;
  finishedSync = false;

  private countUpdateSubscription: Subscription;

  constructor(
    private storage: Storage,
    private syncApiDataService: SyncApiDataService,
    private router: Router,
    private dataservice: DataService,
    private sqliteService:SQLiteService
  ) {
    this.countUpdateSubscription = this.dataservice.updateCount.subscribe(({ length, name }) => {
      this.setCount(name, length);
      console.log(name, length);
    });
  }

  
   ngOnInit() {
    this.initialize();
   this.sqliteService.createTransactionHistory("TransactionHistoryTable")
  }

  private async initialize(): Promise<void> {
    const storedOrg = await this.storage.get('selectedOrganization');
    if (storedOrg) {
      this.selectedOrg = storedOrg;
      console.log('Selected Organization:', storedOrg);
    }
    const res = await this.getResponsibility();
    const syncResp = await this.syncData(res,false);
    this.checkIfErrorExist(syncResp);
  }

  private async getResponsibility(): Promise<any> {
    const storageResponsibilities = await this.storage.get('responsibility');
    
    if (storageResponsibilities) {
      this.responsibility = storageResponsibilities;
      console.log('Stored Responsibilities:', this.responsibility);
    } else {
      console.warn('No responsibilities found');
    }
    
    return this.responsibility;
  }

  private setCount(resp: string, count: number): void {
    const indx = this.findIndexByResp(resp);
    if (indx > -1) this.activityCards[indx].count = count;
  }

  private checkIfErrorExist(syncData:any): void {
    if (this.errorArray.length === 0 ) {
      this.loadingShowofflinedata = true;
      this.showOfflineData = true;
      this.refreshApis.next(true);
      
      this.router.navigateByUrl('/dashboard');
    } else {
      this.finishedSync = true;
      syncData.status = false;
    }
}


 
  async syncData(retriveArray: string[],isDeltaSync:boolean): Promise<void> {
    const tasks = await this.syncApiDataService.syncStrategiesFunc();
    console.log('tasks', tasks);
  
    let index = 0;
    this.getCurrentLoading(retriveArray, index);
  
    await Promise.all(tasks.map(async (apiRequest: any) => {
      try {
        const apiResponse = await apiRequest;
        this.updateUiSuccess(retriveArray, index, apiResponse);
      } catch (error) {
        console.error(error);
        this.errorArray.push(error); 
        this.updateUiSuccess(retriveArray, index, error);
      } finally {
        index++;
      }
    }));
  }
  

  getCurrentLoading(retriveArray: string[], index: number): void {
    if (retriveArray[index]) {
      this.checkIsLoading(retriveArray[index]);
    }
  }

  checkIsLoading(responsibility: string): void {
    const indx = this.findIndexByResp(responsibility);
    if (indx > -1) this.activityCards[indx].isLoading = true;
  }

  findIndexByResp(resp: string): number {
    return this.activityCards.findIndex((card: any) => card.responsibility === resp);
  }

  updateUiSuccess(retriveArray: string[], index: number, currentResult: any): void {
    this.checkStatus(currentResult, retriveArray, index, currentResult?.responsibility);
  }

  checkStatus(currentResult: any, retriveArray: string[], index: number, responsibility: string): void {
    const indx = this.findIndexByResp(responsibility);
    if (indx === -1) return;

    if (currentResult.status === true) {
      console.log("navya",this.activityCards[indx].status)
      this.activityCards[indx].status = true;
    } else {
      this.activityCards[indx].status = false;
      this.errorArray.push(currentResult);
    }
    this.activityCards[indx].isLoading = false;
    this.getNextLoading(retriveArray, index);
    this.scrollToBottom();
  }

  getNextLoading(retriveArray: string[], index: number): void {
    this.checkIsLoading(retriveArray[index + 1]);
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.contentArea) {
        this.contentArea.scrollToBottom();
      }
    });
  }
  async syncAgain(): Promise<void> {
    console.log('Going for sync again error array:', JSON.stringify(this.errorArray));
    const retriveArray = this.errorArray.map(error => error.responsibility);
    this.errorArray = [];
    try {
      const syncResp = await this.syncData(retriveArray, false);
      this.checkIfErrorExist(syncResp);
    } catch (err) {
      console.error(err);
    }
  }
}
