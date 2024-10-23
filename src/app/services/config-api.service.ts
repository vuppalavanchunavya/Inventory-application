import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { SQLiteService } from './sqlite.service';
import { DataService } from './data.service';
import { Storage } from '@ionic/storage';
import { catchError, firstValueFrom, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigApiService {
  orgId: string | null = null;

  constructor(
    private http: HttpClient,
    private sqliteService: SQLiteService,
    private dataService: DataService,
    private storage: Storage
  ) {
    
  }
  

  syncConfigDataAPIs(): Promise<any>[] {
    const promiseArray: Promise<any>[] = [
      this.getQualityCodes(),
      this.getReasons(),
      this.getInventoryPeriods(),
      this.getSerials(),
    ];

    return promiseArray;
  }

  private getQualityCodes(): Promise<any> {
    const metadataUrl = `https://testnode.propelapps.com/EBS/20D/getQualityCodes/metadata`;
    const listUrl = `https://testnode.propelapps.com/EBS/20D/getQualityCodes`;
    const tableName = 'qualityCodes';

    return this.dataService.fetchAndStoreData(listUrl, metadataUrl, tableName, 'qualityCodes',true);
  }

  private getReasons(): Promise<any> {
    const metadataUrl = `https://testnode.propelapps.com/EBS/20D/getreasons/metadata`;
    const listUrl = `https://testnode.propelapps.com/EBS/20D/getreasons`;
    const tableName = 'reasons';

    return this.dataService.fetchAndStoreData(listUrl, metadataUrl, tableName, 'reasons',true);
  }

  private getInventoryPeriods(): Promise<any> {
    const metadataUrl = `https://testnode.propelapps.com/EBS/20D/getInventoryPeriods/metadata`;
    const listUrl = `https://testnode.propelapps.com/EBS/20D/getInventoryPeriods/7923/7925`;
    const tableName = 'inventoryPeriods';

    return this.dataService.fetchAndStoreData(listUrl, metadataUrl, tableName, 'inventoryPeriods',true);
  }

  private getSerials(): Promise<any> {
    const metadataUrl = `https://testnode.propelapps.com/EBS/20D/getSerials/metadata`;
    const listUrl = `https://testnode.propelapps.com/EBS/20D/getSerials/7925/""/""`;
    const tableName = 'Serials';
    return this.dataService.fetchAndStoreData(listUrl, metadataUrl, tableName, 'Serials',true);
  }

  private fetchAndInsertDataWithErrorHandling(
    listUrl: string,
    metadataUrl: string | null,
    tableName: string,
    isDeltaSync: boolean
  ): Promise<void> {
    return firstValueFrom(this.http.get<any>(listUrl, { observe: 'response' }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Error fetching data from ${listUrl}:`, error.message);
        
        return throwError(() => new Error('Data fetch failed.'));
      }),
      switchMap((response: { status: number; body: any; }) => {
        console.log('Full response:', response);

        
        const responseData = response.body;

        if (responseData && Array.isArray(responseData)) {
          return this.sqliteService.insertToTable(tableName, responseData).then(() => {});
        } else {
          console.warn(`Response body is not an array or is empty at ${listUrl}`);
          return Promise.resolve();  
        }
      })
    ));
  }
}
