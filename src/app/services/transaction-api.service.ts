import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { SQLiteService } from './sqlite.service';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, firstValueFrom } from 'rxjs';
import { DataService } from './data.service';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class TransactionApiService  {
  orgId:any;
  
  constructor(
    private sqliteService: SQLiteService,
    private http: HttpClient,
    private dataService: DataService,
    private storage:Storage
  ) {
    
const storedOrgId = localStorage.getItem('selectedorg');
if (storedOrgId !== null) {
  this.orgId = JSON.parse(storedOrgId); 
  console.log(this.orgId); 
}   
  }

  
  syncTransactionAPIs(): Promise<any>[] {
    const promiseArray: Promise<any>[] = [
      this.getLots(),
      this.getDocsforreceiving(),
      this.getItemCrossReferences(),
    ];

    return promiseArray;
  }
  
  private getLots(): Promise<any> {
    const metadataUrl = `https://testnode.propelapps.com/EBS/20D/getLots/metadata`;
    const listUrl = `https://testnode.propelapps.com/EBS/20D/getLots/${this.orgId}/%22%22/%22%22`;
    const tableName = 'lots';

    return this.dataService.fetchAndStoreData(listUrl, metadataUrl, tableName, 'lots',false);
  }

  private getDocsforreceiving(): Promise<any> {
    const metadataUrl = `https://testnode.propelapps.com/EBS/20D/getDocumentsForReceiving/metadata`;
    const listUrl = `https://testnode.propelapps.com/EBS/20D/getDocumentsForReceiving/${this.orgId}/%22%22/%22%22`;
    const tableName = 'Docsforreceiving';

    return this.dataService.fetchAndStoreData(listUrl, metadataUrl, tableName, 'Docsforreceiving',false);
  }
  private getItemCrossReferences(): Promise<any> {
    const metadataUrl = `https://testnode.propelapps.com/EBS/23A/getItemCrossReferences/metadata`;
    const listUrl = `https://testnode.propelapps.com/EBS/23A/getItemCrossReferences/${this.orgId}/""`;
    const tableName = 'ItemCrossReferences';

    return this.dataService.fetchAndStoreData(listUrl, metadataUrl, tableName, 'ItemCrossReferences',false);
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
        if (error.status === 404) {
          console.warn(`Data not found at ${listUrl}`);
        } else if (error.status === 500) {
          console.error(`Server error at ${listUrl}`);
        } else {
          console.error(`Unexpected error: ${error.message}`);
        }
        return throwError(() => new Error('Data fetch failed.'));
      }),
      switchMap(response => {
        console.log('Full response:', response);

        if (response.status === 204) {
          console.log(`No content at ${listUrl}. Skipping data insertion.`);
          return Promise.resolve();  
        }

        
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
function getSelectedOrgData() {
  throw new Error('Function not implemented.');
}

