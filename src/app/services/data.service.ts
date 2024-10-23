import { EventEmitter, Injectable } from '@angular/core';
import { SQLiteService } from './sqlite.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SQLiteObject } from '@ionic-native/sqlite/ngx';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public updateCount: EventEmitter<{ length: number, name: string }> = new EventEmitter();

  constructor(
    private sqliteService: SQLiteService,
    private httpClient: HttpClient
  ) { }

  async fetchAndStoreData(listUrl: string, metadataUrl: string, tableName: string, responsibility: string,request:any): Promise<any> {
    let db: SQLiteObject;
    db = await this.sqliteService.getDb();

    try {
      await this.sqliteService.createTableFromMetadata(metadataUrl, tableName);
      return await this.loadDataIntoTable(listUrl, responsibility, db, tableName,request);
    } catch (error) {
      console.error('Error fetching and storing data:', error);
    }
  }

  private async loadDataIntoTable(listUrl: string, responsibility: string, db: SQLiteObject, tableName: string,request:any): Promise<any> {
    try {
      const apiResponse = await this.fetchData(listUrl).toPromise();
      console.log(apiResponse,apiResponse.status);
      if (request && apiResponse.status != 200) {
        return { status: false, responsibility: responsibility, msg: 'No Content' };
      }
      else{
        await this.insertDataIntoTable(tableName, db, apiResponse.body, responsibility);
      return { status: true, responsibility: responsibility };

      }
      
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        return { status: false, msg: error.message };
      } else {
        console.error('An unknown error occurred');
        return { status: false, msg: 'An unknown error occurred' };
      }

    }
  }

  fetchData(url: string): Observable<any> {
    const headers = {}; 
    return this.httpClient.get<any>(url, { headers: headers, observe: 'response' });
  }

  async updateItemCount(length: number, name: string): Promise<void> {
    this.updateCount.emit({ length, name });
  }


  private async insertDataIntoTable(tableName: string, db: SQLiteObject, data: any, responsibility: string): Promise<void> {
    console.log('Inserting data into table:', tableName, data);
  
    let items: any[] = [];
    if(tableName=='Docsforreceiving'){
      items=data.Docs4Receiving
      console.log(items)
      await this.DataInsertion(items,tableName);
    }
    if(tableName=='lots'){
      items=data.ActiveLots 
      await this.DataInsertion(items,tableName);
    }
    if(tableName=='Locations'){
      items=data.LocationList
      await this.DataInsertion(items,tableName);
    }
    if(tableName=='qualityCodes'){
      items=data.QualityCodes 
      await this.DataInsertion(items,tableName);
    }
    if(tableName=='reasons'){
      items=data.Reasons 
      await this.DataInsertion(items,tableName);
    }
    if(tableName=='inventoryPeriods'){
      items=data.InventoryPeriods
      await this.DataInsertion(items,tableName);
    }
    if(tableName=='Locators'){
      items=data.ActiveLocators
      await this.DataInsertion(items,tableName);
    }
    if(tableName=='Subinventories'){
      items=data.ActiveSubInventories
      await this.DataInsertion(items,tableName);
    }
    if(tableName=='Serials'){
      items=data.ActiveSerials
      await this.DataInsertion(items,tableName);
    }
    if(tableName=='ItemCrossReferences'){
      items=data.Response
      await this.DataInsertion(items,tableName);
    }
    if(tableName=='Employees'){
      items=data.EmployeeList
      await this.DataInsertion(items,tableName);
    }
  
    if (items) {
      await this.updateItemCount(items.length, responsibility);
    }
  }



  private async DataInsertion(items: any[], tableName: string): Promise<void> {
    try {
      
      await this.sqliteService.getDb(); 

      
      const success = await this.sqliteService.insertToTable(tableName, items);

      if (success) {
        console.log('Data inserted successfully.');
      } else {
        console.error('Failed to insert data.');
      }
    } catch (error) {
      console.error('Error in DataInsertion:', error);
    }
  }
}


  




  

  
  

  