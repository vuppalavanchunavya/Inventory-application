import { Injectable } from '@angular/core';
import { MasterApisService } from './master-api.service';
import { ConfigApiService } from './config-api.service';
import { TransactionApiService } from './transaction-api.service';
import { Subject } from 'rxjs';


interface CountUpdate {
  length: number;
  countName: string;
}

interface RESPONSE_DATA {
  status: boolean;
  responsibility: string;
}

@Injectable({
  providedIn: 'root'
})
export class SyncApiDataService {

  countUpdate = new Subject<CountUpdate>();

  constructor(
    private masterApiService: MasterApisService,
    private configApiService: ConfigApiService,
    private transactionApiService: TransactionApiService,
  ) {

  }



  public async syncStrategiesFunc():Promise<any[]> {
    let promiseArray = [];
    
    promiseArray.push(...this.masterApiService.syncMasterDataAPIs());
    promiseArray.push(...this.configApiService.syncConfigDataAPIs());
    promiseArray.push(...this.transactionApiService.syncTransactionAPIs());
    
    return promiseArray
  }
  
}
