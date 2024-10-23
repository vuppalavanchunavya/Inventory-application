import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SQLiteService {

  private db!: SQLiteObject;

  constructor(
    private sqlite: SQLite,
    private http: HttpClient
  ) {
    this.initializeDatabase();
  }

  async initializeDatabase(): Promise<void> {
    try {
      this.db = await this.sqlite.create({
        name: 'data.db',
        location: 'default'
      });
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }
  
  

  getAll<T>(url: string): Observable<T> {
    console.log('url: ', url);
    const headers = {};
    return this.http.get<T>(url, { headers: headers });
  }

  async createTableFromMetadata(metadataUrl: string, tableName: string): Promise<boolean> {
    try {
      const metadata: any = await this.http.get(metadataUrl).toPromise();
      const columns = metadata;

      const columnDefinitions: string[] = columns.map((column: any) => {
        if (!column.name || !column.type) {
          throw new Error('Column name or type is missing in metadata.');
        }
        return `${column.name} ${this.mapColumnType(column.type)}`;
      });

      const primaryKeyColumns = columns.filter((column: any) => column.primaryKey || column.primarykey === true)
                                       .map((column: any) => column.name)
                                       .join(', ');

      let createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (`;
      createTableQuery += columnDefinitions.join(', ');
      if (primaryKeyColumns) {
        createTableQuery += `, PRIMARY KEY (${primaryKeyColumns})`;
      }
      createTableQuery += ')';

      await this.db.executeSql(createTableQuery, []);
      console.log(`Table ${tableName} created or verified.`);
      return true;
    } catch (error) {
      console.error(`Failed to create table ${tableName}:`, error);
      return false;
    }
  }

  async insertToTable(tableName: string, itemsList: any[]): Promise<boolean> {
    try {
      if (!this.db) {
        await this.initializeDatabase();
      }

      if (itemsList.length === 0) {
        console.error('No items provided for insertion.');
        return false;
      }

      const sampleItem = itemsList[0];
      const columns = Object.keys(sampleItem).join(', ');
      const placeholders = Object.keys(sampleItem).map(() => '?').join(', ');

      const insertQuery = `INSERT OR REPLACE INTO ${tableName} (${columns}) VALUES (${placeholders})`;

      

      await this.db.transaction(async (txn) => {
        for (const rowObject of itemsList) {
          const values = Object.values(rowObject);
          

          try {
            await txn.executeSql(insertQuery, values);
          } catch (insertError) {
            console.error(`Insert Error for values ${values}:`, insertError);
          }
        }
      });

      return true;
    } catch (error) {
      console.error(`Error inserting data into table ${tableName}:`, error);
      return false;
    }
  }

  private mapColumnType(columnType: string): string {
    switch (columnType.toLowerCase()) {
      case 'string':
        return 'TEXT';
      case 'number':
        return 'INTEGER';
      case 'boolean':
        return 'BOOLEAN';
      case 'date':
        return 'TEXT'; 
      default:
        return 'TEXT'; 
    }
  }

  async getDb(): Promise<SQLiteObject> {
    if (!this.db) {
      await this.initializeDatabase();
    }
    return this.db;
  }

  async getAllTables(): Promise<string[]> {
    try {
      const result = await this.db.executeSql("SELECT name FROM sqlite_master WHERE type='table'", []);
      const tables: string[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        tables.push(result.rows.item(i).name);
      }
      return tables;
    } catch (error) {
      console.error('Error fetching all tables:', error);
      throw error;
    }
  }


  async fetchItemsByQuery(uniqueId: string, tableName: string): Promise<any[]> {
    try {
      const data = await this.db.executeSql(`SELECT * FROM ${tableName} WHERE PONumber = ?`, [uniqueId]);
      const result: any[] = [];
      for (let i = 0; i < data.rows.length; i++) {
        result.push(data.rows.item(i));
      }
      return result;
    } catch (error) {
      console.error('Error fetching items by query:', error);
      throw error;
    }
  } 
  
  
  async getDataFromTable(tableName: string): Promise<any[]> {
    try {
      console.log('tablename', tableName );
      const query = `SELECT * FROM ${tableName}`;
      const data = await this.db?.executeSql(query, []);
      
      console.log('data from table',data);
      let result = [];
      if(data.rows){
        for (let i = 0; i < data.rows.length; i++) {
          result.push(data.rows.item(i));
        }
    
        return result;
      }
      return data;
      
    } catch (e) {
      console.error(`Error getting data from ${tableName}:`,e);
      throw e;
    }
  } 
  
  
  async executeQuery(query:string,data:any=[]):Promise<any>{
    const result=await this.db?.executeSql(query,data)
    return result;
  }
  // async clearDb(): Promise<void> {
  //   try {
  //     if (!this.db) {
  //       await this.initializeDatabase(); // Ensure database is open
  //     }
  
  //     const query = `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`; // Exclude system tables
  //     const result = await this.db?.executeSql(query, []);

  //       console.log(result)
  
  //     if (result && result.rows.length > 0) {
  //       for (let i = 0; i < result.rows.length; i++) {
  //         const tableName = result.rows.item(i).name;
  //         await this.db?.executeSql(`DROP TABLE IF EXISTS ${tableName}`, []);
  //         console.log('Table ${tableName} dropped successfully.');
  //       }
  //     } else {
  //       console.log('No tables found in the database.');
  //     }
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       console.error('Error clearing database:', error.message);
  //     } else {
  //       console.error('Unexpected error occurred while clearing database.');
  //     }
  //   }
  // }
  async clearDb(): Promise<void> {
    try {
      if (!this.db) {
        await this.initializeDatabase(); // Ensure database is open
      }
  
      // Exclude system tables like sqlite_sequence
      const query = `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != 'sqlite_sequence'`; 
      const result = await this.db?.executeSql(query, []);
  
      console.log(result);
  
      if (result && result.rows.length > 0) {
        for (let i = 0; i < result.rows.length; i++) {
          const tableName = result.rows.item(i).name;
          await this.db?.executeSql(`DROP TABLE IF EXISTS ${tableName}`, []);
          console.log(`Table ${tableName} dropped successfully.`);
        }
      } else {
        console.log('No tables found in the database.');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error clearing database:', error.message);
      } else {
        console.error('Unexpected error occurred while clearing database.');
      }
    }
  }
  
  async createCsvTable(query: string, tableName: string) {
    console.log(`Executing query: ${query}`);
    try {
        await this.db?.executeSql(query, []);
        console.log(`Table "${tableName}" created successfully or already exists.`);
    } catch (error) {
        console.error(`Error creating table "${tableName}":`, error);
    }
}


  async createTransactionHistory(tableName: string) {
    let query = `CREATE TABLE IF NOT EXISTS ${tableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poNumber TEXT,
      titleName TEXT,
      createdTime DATETIME,
      quantityReceived INTEGER,
      error TEXT,
      status TEXT,
      shipLaneNum TEXT,
      vendorId TEXT,
      unitOfMeasure TEXT,
      poHeaderId TEXT,
      poLineLocationId TEXT,
      poLineId TEXT,
      poDistributionId TEXT,
      destinationTypeCode TEXT,
      itemNumber TEXT,
      Subinventory TEXT,
      Locator INTEGER,
      ShipmentNumber TEXT,
      LpnNumber TEXT,
      OrderLineId TEXT,
      SoldtoLegalEntity TEXT,
      SecondaryUnitOfMeasure TEXT,
      ShipmentHeaderId TEXT,
      ItemRevision TEXT,
      ReceiptSourceCode TEXT,
      MobileTransactionId TEXT,
      TransactionType TEXT,
      AutoTransactCode TEXT,
      OrganizationCode TEXT,
      serialNumbers TEXT,
      userId TEXT,
      employeeId TEXT,
      bussinessUnitId TEXT,
      inventoryOrgId TEXT
    )`;
    await this.createCsvTable(query, tableName);
  }
  

  async insertData(query: string, data: any) {
    if (!this.db) {
        console.error("Database is not initialized");
        return null;
    }

    try {
        const result = await this.db.executeSql(query, data);
        console.log(result);
        if (result) {
            console.log("Insert successful", result);
        } else {
            console.log("Insert unsuccessful");
        }
        return result;
    } catch (error) {
        console.error("Error executing SQL:", error);
        return null;
    }
}

  insertTransaction(item: any, tableName: string) {
    const query = `INSERT INTO ${tableName} (poNumber, titleName, createdTime, quantityReceived,error,status,shipLaneNum,
    vendorId,unitOfMeasure,poHeaderId,poLineLocationId,poLineId,poDistributionId,destinationTypeCode,itemNumber,Subinventory,Locator,
    ShipmentNumber,LpnNumber,OrderLineId,SoldtoLegalEntity,SecondaryUnitOfMeasure,ShipmentHeaderId,ItemRevision,ReceiptSourceCode,MobileTransactionId,TransactionType,
    AutoTransactCode,
    OrganizationCode,serialNumbers)
    VALUES (?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;
  const data = [
    item.poNumber,
    item.titleName,
    item.createdTime.toISOString(),
    item.quantityReceived,
    item.error,
    item.status,
    item.shipLaneNum,
    item.vendorId,
    item.unitOfMeasure,
    item.poHeaderId,
    item.poLineLocationId,
    item.poLineId,
    item.poDistributionId,
    item.destinationTypeCode,
    item.itemNumber,
    item.Subinventory,
    item.Locator,
    item.ShipmentNumber,
    item.LpnNumber,
    item.OrderLineId,
    item.SoldtoLegalEntity,
    item.SecondaryUnitOfMeasure,
    item.ShipmentHeaderId,
    item.ItemRevision,
    item.ReceiptSourceCode,
    item.MobileTransactionId,
    item.TransactionType,
    item.AutoTransactCode,
    item.OrganizationCode,
    item.serialNumbers
  ];
 
    return this.insertData(query, data);
  }

  
}
  
