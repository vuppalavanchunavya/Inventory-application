import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SerialNumberlistComponent } from '../serial-numberlist/serial-numberlist.component';

@Component({
  selector: 'app-seriallist',
  templateUrl: './seriallist.component.html',
  styleUrls: ['./seriallist.component.scss'],
})
export class SeriallistComponent implements OnInit {
  @Input() serials: any[] = []; 
  @Input() itemNumber: string = ''; 
  @Input() poNumber: string = ''; 
  @Input() itemDesc: string = ''; 
  @Input() quantity: number = 0; 
  
  initialQuantity: number = 0; 
  selectedSerialCount: number = 0;

  serialInput: string = '';
  serial: any[] = [];
  
  serialEntries = [{
    minSerial: '',
    maxSerial: '',
    quantity: 0
  }];

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.initialQuantity = this.quantity; 
  }

  async showRelatedSerials() {
    const modal = await this.modalController.create({
      component: SerialNumberlistComponent,
      componentProps: { serials: this.serials }
    });
  
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        console.log("data", data);
        this.serialInput = data.data.selectedSerial; 
        this.serial.push(data.data.selectedSerial);
        this.selectedSerialCount = this.serial.length; 
      }
    });
  
    return await modal.present();
  }

  

  
  checkInput() {
    this.isDoneButtonEnabled();
  }

  
  getTotalQuantity(): number {
    return this.serialEntries.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
  }

  
  isDoneButtonEnabled(): boolean {
    const totalQuantity = this.getTotalQuantity(); 
    const areAllEntriesValid = this.serialEntries.every(entry => 
      !!entry.minSerial && !!entry.maxSerial && entry.quantity > 0
    );
    
    
    return totalQuantity === this.initialQuantity && areAllEntriesValid;
  }

  done() {
    this.modalController.dismiss({
      selectedSerial: this.serial,
      SerialCount: this.serial.length
    });
  }

  async goBack() {
    await this.modalController.dismiss();
  }
}
