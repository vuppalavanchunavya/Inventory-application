import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { ChildlotlistComponent } from '../childlotlist/childlotlist.component';
import { FormGroup } from '@angular/forms';

interface Lot {
  LotNumber: string; 
  ParentLotNumber: string; 
  childLot: string;
}

@Component({
  selector: 'app-lotlist',
  templateUrl: './lotlist.component.html',
  styleUrls: ['./lotlist.component.scss'],
})
export class LotlistComponent implements OnInit {
  @Input() itemNumber: string = ''; 
  @Input() poNumber: string = ''; 
  @Input() itemDesc: string = ''; 
  @Input() locator: string = ''; 
  @Input() subInventoryCode: string = ''; 
  @Input() childLots: Lot[] = []; 

  sections: FormGroup[] = [];
  lots: { lotQty: number | null; selectedLot: string }[] = [{ lotQty: null, selectedLot: '' }];
  quantity: any;

  
  totalLotQuantity: number = 0;
  selectedLotsCodes: string[] = [];
  convertedLotData: any[] = []; 

  constructor(
    private modalController: ModalController,
    private toastController: ToastController 
  ) {}

  ngOnInit() {
    console.log('Received childLots:', this.childLots);
  }

  addMore() {
    this.lots.push({ lotQty: null, selectedLot: '' });
  }

  async showChildLots(index: number) {
    const modal = await this.modalController.create({
      component: ChildlotlistComponent,
      componentProps: {
        childLots: this.childLots,
      },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && data.selectedChildLot) {
      console.log("data", data);
      console.log(data.selectedChildLot);
      const selectedLot = data.selectedChildLot;
  
      const lotExists = this.lots.some(lot => lot.selectedLot === selectedLot);
  
      if (lotExists) {
        console.log("The lot is already selected.");
        this.showToast('The lot is already selected.');
      } else {
        this.lots[index].selectedLot = selectedLot;
        console.log("selectedLot", this.lots[index].selectedLot);
        this.updateTotalQuantity(); 
      }
    } else {
      console.log("No childLot selected");
    }
  }

  async goBack() {
    await this.modalController.dismiss();
  }

  isDoneButtonEnabled(): boolean {
    const totalLotQty = this.lots.reduce((sum, lot) => sum + (lot.lotQty || 0), 0);
    return totalLotQty === this.quantity;
  }

  async showToast(message: string, color: 'success' | 'danger' = 'danger', duration: number = 2000) {
    const toast = await this.toastController.create({
      message,
      color,
      duration,
      position: 'bottom'
    });
    toast.present();
  }

  updateTotalQuantity() {
    
    this.totalLotQuantity = this.lots.reduce((sum, lot) => sum + (lot.lotQty || 0), 0);
    this.selectedLotsCodes = this.lots
      .filter(lot => lot.selectedLot) 
      .map(lot => lot.selectedLot);   
  }

//   buildLotData() {
//     this.convertedLotData = [];

    
//     if (this.lots.length > 0) {
//         const lotQuantity = this.totalLotQuantity;  
//         const lotCode = this.selectedLotsCodes;     

        
//         if (lotCode) {
//             const convertedObject = {
//                 LotNumber: lotCode,
//                 TransactionQuantity: lotQuantity,
//             };
            
//             this.convertedLotData.push(convertedObject);
//         }
//     }

//     return this.convertedLotData;
// }

  done() {
    const totalLotQty = this.lots.reduce((sum, lot) => sum + (lot.lotQty || 0), 0);
    
    if (totalLotQty != this.quantity) {
      this.showToast('The total of entered Lot1Qty does not match the required quantity.'); 
      return; 
    }

    
    // const lotData = this.buildLotData();

    console.log('Lots:', this.lots);
    console.log('Total Lot Quantity:', this.totalLotQuantity);
    console.log('Selected Lots Codes:', this.selectedLotsCodes);
    

    
    const combinedData = [this.totalLotQuantity, ...this.selectedLotsCodes];

    this.modalController.dismiss({
      selectedLots: this.lots,
      selectedLotCount: this.lots.length, 
    });
  }
}
