import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SQLiteService } from 'src/app/services/sqlite.service';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Platform, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-items-page',
  templateUrl: './items-page.page.html',
  styleUrls: ['./items-page.page.scss'],
})
export class ItemsPage implements OnInit {
  poNumber: string = '';
  items: any[] = [];
  filteredItems: any[] = [];
  searchTerm: string = '';
  details: { 
    vendorName?: string; 
    poType?: string; 
    needByDate?: string; 
    requestor?: string 
  } = {};
  isScanning: boolean = false;


  constructor(
    private activatedRoute: ActivatedRoute,
    private sqliteService: SQLiteService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private platform: Platform,
    private toastcontroller: ToastController
  ) {}

  ngOnInit() {
    this.initializeData();
  }

  private async initializeData() {
    this.poNumber = this.activatedRoute.snapshot.paramMap.get('poNumber') || '';
    console.log('PO Number from route:', this.poNumber);

    if (this.poNumber) {
      await this.loadItems();
    } else {
      console.error('PO Number is missing from the route parameters.');
    }
  }

  async ionViewWillEnter() {
    await this.loadItems();
  }

  async loadItems() {
    try {
      this.items = await this.sqliteService.fetchItemsByQuery(this.poNumber, 'Docsforreceiving');
      console.log('PO Number:', this.poNumber);
      this.filteredItems = this.items; 
      console.log('Fetched items:', this.items);

      if (this.items.length > 0) {
        const firstItem = this.items[0];
        console.log('First item details:', firstItem);

        this.details = {
          vendorName: firstItem.VendorName || 'N/A',
          poType: firstItem.PoType || 'N/A',
          needByDate: firstItem.NeedByDate || 'N/A',
          requestor: firstItem.Requestor || 'N/A'
        };

        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error loading items:', error);
    }
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
  
       
        const matchedItem = this.items.find(item => item.ItemNumber === scannedContent);
        if (matchedItem) {
          
          this.navigateToItemDetails(matchedItem);
        } else {
          console.log('No matching item found for the scanned Item Number.');
          
          await this.showToast('No matching item found for the scanned Item Number.');
        }
  
        BarcodeScanner.stopScan();
      }
    } catch (error) {
      console.error('Error during barcode scan:', error);
    } finally {
      this.isScanning = false;
    }
  }
  
  async showToast(message: string) {
    const toast = await this.toastcontroller.create({
      message: message,
      duration: 2000, 
      position: 'bottom' 
    });
    toast.present();
  }
  
  

  async doRefresh(event: any) {
    await this.loadItems();
    event.target.complete();
  }

  navigateBack(): void {
    this.router.navigate(['/goods-receipt-functionality']);
  }

  navigateHome(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToItemDetails(item: any) {
    const itemData = JSON.stringify(item);
    this.router.navigate(['/item-details'], {
      queryParams: { 
        item: itemData, 
        poNumber: this.poNumber 
      }
    });
  }

  filterItems() {
    if (this.searchTerm.trim() === '') {
      this.filteredItems = this.items; 
    } else {
      this.filteredItems = this.items.filter(item =>
        item.ItemNumber?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }
  
  displayItemData(data: any) {
    throw new Error('Method not implemented.');
  }
}
