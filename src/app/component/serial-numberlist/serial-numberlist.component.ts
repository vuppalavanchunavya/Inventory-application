import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-serial-numberlist',
  templateUrl: './serial-numberlist.component.html',
  styleUrls: ['./serial-numberlist.component.scss'],
})
export class SerialNumberlistComponent implements OnInit {
  @Input() serials: any[] = [];
  filteredSerials: any[] = [];

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    
    this.filteredSerials = [...this.serials];
  }

  dismiss() {
    this.modalController.dismiss();
  }

  
  selectSerial(serialNumber: string) {
    console.log('Selected Serial Number:', serialNumber); 
    this.modalController.dismiss({
      selectedSerial: serialNumber,
    });
  }
  
  filterSerials(event: { query: string; key: string }) {
    const query = event.query.toLowerCase();
    if (query && query.trim() !== '') {
      this.filteredSerials = this.serials.filter(serial =>
        serial.SerialNumber?.toLowerCase().includes(query) 
      );
    } else {
      this.filteredSerials = [...this.serials];
    }
  }
  
}
