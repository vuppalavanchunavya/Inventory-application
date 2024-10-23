import { Injectable } from '@angular/core';
import { SQLiteService } from './sqlite.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { DataService } from './data.service';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class MasterApisService {
  orgId: string | null = null;

  constructor(
    private sqliteService: SQLiteService,
    private http: HttpClient,
    private dataService: DataService,
    private storage: Storage
  ) {
    
  }

  syncMasterDataAPIs(): Promise<any>[] {
    const promiseArray: Promise<any>[] = [
      this.getLocations(),
      this.getLocators(),
      this.getSubinventories(),
      this.getEmployees(),
    ];

    return promiseArray;
  }

  private getLocations(): Promise<any> {
    const metadataUrl = `https://testnode.propelapps.com/EBS/20D/getLocations/metadata`;
    const listUrl = `https://testnode.propelapps.com/EBS/20D/getLocations/%22%22/%22%22`;
    const tableName = 'Locations';

    return this.dataService.fetchAndStoreData(listUrl, metadataUrl, tableName, 'Locations',true);
    
}
private getEmployees(): Promise<any> {
  const metadataUrl = `https://testnode.propelapps.com/EBS/20D/getEmployees/metadata`;
  const listUrl = `https://testnode.propelapps.com/EBS/20D/getEmployees/7963/%22%22/%22%22`;
  const tableName = 'Employees';

  return this.dataService.fetchAndStoreData(listUrl, metadataUrl, tableName, 'Employees',true);
  
} 

  private getLocators(): Promise<any> {
    const metadataUrl = `https://testnode.propelapps.com/EBS/20D/getLocators/metadata`;
    const listUrl = `https://testnode.propelapps.com/EBS/20D/getLocators/7925/%22%22/%22%22`;
    const tableName = 'Locators';
    return this.dataService.fetchAndStoreData(listUrl, metadataUrl, tableName, 'Locators',true);
  }
  
  private getSubinventories(): Promise<any> {
    const metadataUrl = `https://testnode.propelapps.com/EBS/20D/getSubinventories/metadata`;
    const listUrl = `https://testnode.propelapps.com/EBS/20D/getSubinventories/7925/%22%22/%22Y%22`;
    const tableName = 'Subinventories';
    return this.dataService.fetchAndStoreData(listUrl, metadataUrl, tableName, 'Subinventories',true);
  }

  private fetchAndInsertDataWithErrorHandling(
    listUrl: string,
    metadataUrl: string | null,
    tableName: string,
    isDeltaSync: boolean,
    responsibility: string
  ): Promise<void> {
    return this.http.get<any>(listUrl, { observe: 'response' }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Error fetching data from ${listUrl}:`, error.message);
        
        return throwError(() => new Error('Data fetch failed.'));
      }),
      map(response => {
        console.log('Full response:', response); 

        
        let responseData: any;

        if (response.body) {
          if (Array.isArray(response.body)) {
            responseData = response.body;
          } else if (response.body.data && Array.isArray(response.body.data)) {
            responseData = response.body.data;
          } else {
            console.warn(`Unexpected response structure at ${listUrl}:`, response.body);
            responseData = []; 
          }
        } else {
          console.warn(`No response body at ${listUrl}`);
          responseData = [];
        }

        if (Array.isArray(responseData) && responseData.length > 0) {
          return this.sqliteService.insertToTable(tableName, responseData)
            .then(() => {
              console.log(`Data inserted into ${tableName} successfully.`);
            })
            .catch(error => {
              console.error('Error inserting data into table:', error);
              throw error;
            });
        } else {
          console.warn(`Response body is not an array or is empty at ${listUrl}`);
          return Promise.resolve();
        }
      })
    ).toPromise() as Promise<void>;
  }
}
