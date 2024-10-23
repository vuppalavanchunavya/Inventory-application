import { Component } from '@angular/core';
import { SQLiteService } from "src/app/services/sqlite.service";
import { Router } from '@angular/router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
@Component({
  selector: 'app-goods-receipt-functionality',
  templateUrl: './goods-receipt-functionality.page.html',
  styleUrls: ['./goods-receipt-functionality.page.scss'],
})
export class GoodsReceiptFunctionalityPage {
  uniqueCards: any[] = [];
  poNumberCount: any = {};
  isSearchVisible = false;
  searchQuery: string = '';
  allData: any[] = [];
  private showcards: number = 10;
  public list: any[] = [];
  private isScanning: boolean = false;

  constructor(
    private sqliteservice: SQLiteService, 
    private router: Router,
    private toastController: ToastController,
    private alertController:AlertController
  ) {
    this.list = this.uniqueCards.slice(0, this.showcards);
  }

  async loadDocsForReceivingData() {
    try {
      const tableData = await this.sqliteservice.getDataFromTable('Docsforreceiving');
      this.allData = tableData;

      this.poNumberCount = {};
      const uniqueData: any[] = [];

      tableData.forEach(row => {
        if (this.poNumberCount[row.PoNumber]) {
          this.poNumberCount[row.PoNumber]++;
        } else {
          this.poNumberCount[row.PoNumber] = 1;
          uniqueData.push({
            poNumber: row.PoNumber,
            needByDate: row.NeedByDate,
            poType: row.PoType,
            requestor: row.Requestor,
            vendorName: row.VendorName
          });
        }
      });

      this.uniqueCards = uniqueData;
      this.filterData();
      console.log('Unique PoNumber Data:', this.uniqueCards);
    } catch (error) {
      console.error('Error loading Docsforreceiving data:', error);
    }
  }

  refreshData(event: any) {
    this.loadDocsForReceivingData().then(() => {
      event.target.complete();
    });
  }

  toggleSearch() {
    this.isSearchVisible = !this.isSearchVisible;
    if (!this.isSearchVisible) {
      this.searchQuery = '';
      this.filterData();
    }
  }

  loadMoreData(event: any) {
    setTimeout(() => {
      this.showcards += 10;
      this.filterData();

      event.target.complete();

      if (this.list.length >= this.uniqueCards.length) {
        event.target.disabled = true;
      }
    }, 500);
  }

  ionViewWillEnter() {
    this.loadDocsForReceivingData();
  }

  navigateToItemsPage(poNumber: string) {
    this.router.navigate(['/items-page', poNumber]);
  }

  trackByPoNumber(index: number, po: any): string {
    return po.poNumber;
  }

 
  async BarcodeScan() {
    if (this.isScanning) {
      console.log('Scan already in progress.');
      return;
    }
  
    try {
      this.isScanning = true;
  
      const permission = await BarcodeScanner.checkPermission({ force: true });
      if (!permission.granted) {
        console.error('Camera permission denied.');
        this.isScanning = false;
        return;
      }
  
      BarcodeScanner.hideBackground();
      await BarcodeScanner.prepare();
  
      const result = await BarcodeScanner.startScan();
      console.log('Scan result:', result);
  
      if (result.hasContent) {
        const scannedContent = result.content.trim();
        console.log('Scanned content:', scannedContent);
  
        if (!scannedContent) {
          console.error('Scanned content is empty');
          this.isScanning = false;
          return;
        }
  
        const query = `SELECT * FROM Docsforreceiving WHERE PoNumber = ?`;
        console.log('Executing query:', query, scannedContent);
  
        const data = await this.sqliteservice.executeQuery(query, [scannedContent]);
        console.log('Query result:', data);
  
        BarcodeScanner.stopScan();
  
        if (data.rows.length === 1) {
          const itemDetails = data.rows.item(0);
          this.router.navigate(['/item-details', { item: itemDetails }]);
        } else if (data.rows.length > 1) {
          this.router.navigate(['/items-page/:poNumber', { poNumber: scannedContent }]);
        } else {
          console.log('No data found for PoNumber:', scannedContent);
          await this.showToast('PO Number does not exist.'); // Toast message for non-existent PO number
        }
      } else {
        console.log('No content found in the scanned barcode.');
      }
    } catch (error) {
      console.error('Error during barcode scan:', error);
    } finally {
      this.isScanning = false;
    }
  }
  
  
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  }

  onSearch(event: { query: string; key: string }) {
    this.searchQuery = event.query;
    this.filterData();
  }

  private filterData() {
    if (!this.searchQuery) {
      this.list = this.uniqueCards.slice(0, this.showcards);
    } else {
      const filteredCards = this.uniqueCards.filter(card => {
        const poNumberStr = String(card.poNumber || ''); 
        return poNumberStr.toLowerCase().includes(this.searchQuery.toLowerCase());
      });
      this.list = filteredCards.slice(0, this.showcards);
    }
  }
}
