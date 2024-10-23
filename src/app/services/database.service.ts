import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Storage } from '@ionic/storage-angular';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db: SQLiteObject | null = null;
  private isDbInitialized = false;

  constructor(
    private sqlite: SQLite, 
    private storage: Storage, 
    private platform: Platform
  ) {
    this.platform.ready().then(() => {
      this.init();
    });
  }

  public async init(): Promise<void> {
    if (this.isDbInitialized) return;

    try {
      await this.storage.create();
      this.db = await this.sqlite.create({
        name: 'data.db',
        location: 'default'
      });

      await this.createMetadataTable(); 
      this.isDbInitialized = true;

    } catch (error) {
      console.error('Error initializing SQLite database:', error);
    }
  }

  private async createMetadataTable(): Promise<void> {
    try {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS metadata (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          table_name TEXT NOT NULL,
          column_name TEXT NOT NULL,
          column_type TEXT NOT NULL,
          is_primary_key BOOLEAN DEFAULT FALSE
        )
      `;
      if (this.db) {
        await this.db.executeSql(createTableQuery, []);
        console.log('Metadata table created ');
      }
    } catch (error) {
      console.error('Error creating metadata table:', error);
    }
  }

  private async updateMetadataTable(tableName: string, columns: any[]): Promise<void> {
    if (!Array.isArray(columns)) {
      console.error('Invalid columns parameter for updateMetadataTable: expected an array');
      return;
    }

    try {
      for (const column of columns) {
        const { name, type, primaryKey } = column;
        const existingColumnQuery = 'SELECT COUNT(*) as count FROM metadata WHERE table_name = ? AND column_name = ?';
        const result = await this.db?.executeSql(existingColumnQuery, [tableName, name]);

        if (result && result.rows.item(0).count === 0) {
          const insertMetadataQuery = 'INSERT INTO metadata (table_name, column_name, column_type, is_primary_key) VALUES (?, ?, ?, ?)';
          await this.db?.executeSql(insertMetadataQuery, [tableName, name, type, !!primaryKey]);
        }
      }
      
    } catch (error) {
      console.error('Error updating metadata table:', error);
    }
  }

  public async createTableFromMetadata(tableName: string, columns: any[]): Promise<void> {
    
    if (!Array.isArray(columns)) {
      console.error('Invalid columns parameter: expected an array');
      return;
    }

    try {
      const columnDefinitions: string[] = columns.map((column: any) => {
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

      if (this.db) {
        await this.db.executeSql(createTableQuery, []);
      }
      
      await this.updateMetadataTable(tableName, columns); 
    } catch (error) {
      console.error(`Failed to create table ${tableName}:`, {
        error,
        tableName,
        columns
      });
    }
  }

  public async insertToTable(tableName: string, itemsList: any[]): Promise<void> {
    if (!Array.isArray(itemsList) || itemsList.length === 0) {
      console.error('No items provided for insertion.');
      return;
    }

    try {
      const sampleItem = itemsList[0];
      const columns = Object.keys(sampleItem).join(', ');
      const placeholders = Object.keys(sampleItem).map(() => '?').join(', ');

      const insertQuery = `INSERT OR REPLACE INTO ${tableName} (${columns}) VALUES (${placeholders})`;

      for (const rowObject of itemsList) {
        const values = Object.values(rowObject);
        
        try {
          if (this.db) {
            await this.db.executeSql(insertQuery, values);
          }
        } catch (insertError) {
          console.error(`Insert Error for values ${values}:`, insertError);
        }
      }

    } catch (error) {
      console.error(`Error inserting data into table ${tableName}:`, error);
    }
  }

  public async getOrganizations(organizations: any[] = []): Promise<any[]> {
    try {
      const query = 'SELECT * FROM organizations';
      if (this.db) {
        const result = await this.db.executeSql(query, []);
        return result.rows.raw() || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching organizations:', error);
      return [];
    }
  }
  private mapColumnType(type: string): string {
    switch (type.toLowerCase()) {
      case 'string':
        return 'TEXT';
      case 'number':
        return 'INTEGER';
      case 'boolean':
        return 'BOOLEAN';
      default:
        return 'TEXT';
    }
  }

  public async getDefaultOrgCode(): Promise<string | null> {
    const res=await this.storage.get('RESPONSIBILITY');
    return res;
  }
}
