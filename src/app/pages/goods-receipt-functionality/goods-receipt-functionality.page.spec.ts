import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { SQLiteService } from 'src/app/services/sqlite.service';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

@Component({
  selector: 'app-goods-receipt-functionality',
  templateUrl: './goods-receipt-functionality.page.html',
  styleUrls: ['./goods-receipt-functionality.page.scss'],
})
export class GoodsReceiptFunctionalityPage implements OnInit {
  poNumbers: any[] = [];
  scannedPoNumber: string | null = null;
poNumberCount: any;

  constructor(
    private router: Router,
    private sqliteService: SQLiteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadPoNumbers();
  }

  async loadPoNumbers(): Promise<void> {
    try {
      const tableName = 'Docsforreceiving';
      const data = await this.sqliteService.getDataFromTable(tableName);
      
      // Check if data is returned and log it
      console.log('Fetched data:', data);
      
      if (!Array.isArray(data)) {
        throw new Error('Data fetched is not an array');
      }

      // Use a Map to ensure unique PO numbers
      const poMap = new Map<string, any>();
      
      data.forEach(item => {
        if (item.PoNumber) { // Ensure item has a PoNumber field
          // Store or update the item in the Map with the PO number as key
          poMap.set(item.PoNumber, {
            ponumber: item.PoNumber,
            poType: item.PoType,
            requestor: item.Requestor,
            vendorName: item.VendorName,
            date: item.LastUpdateDate
          });
        }
      });
      
      // Convert Map values to an array
      this.poNumbers = Array.from(poMap.values());
      
      this.cdr.detectChanges(); // Manually trigger change detection

    } catch (error) {
      console.error('Error fetching PO Numbers:', error);
    }
  }
  
  async startScan() {
    try {
      const isAvailable = await BarcodeScanner.checkPermission({ force: true });
      if (isAvailable.granted) {
        const result = await BarcodeScanner.startScan({});
        if (result.hasContent) {
          this.scannedPoNumber = result.content;
          console.log('Scanned PO Number:', this.scannedPoNumber);
          this.handleScannedPoNumber(this.scannedPoNumber);
        } else {
          console.log('No content scanned.');
        }
      } else {
        console.log('Barcode Scanner permission denied.');
      }
    } catch (error) {
      console.error('Error during scanning:', error);
    }
  }

  handleScannedPoNumber(scannedPoNumber: string) {
    // Check if scanned PO number exists in poNumbers
    const po = this.poNumbers.find(po => po.ponumber === scannedPoNumber);
    if (po) {
      // Handle the found PO
      console.log('PO found:', po);
      // For example, navigate to a detailed view or update the UI
      this.router.navigate(['/items-page'], { queryParams: { poNumber: scannedPoNumber } });
    } else {
      console.log('PO number not found:', scannedPoNumber);
      // Optionally show an alert or notification
    }
  }
}
