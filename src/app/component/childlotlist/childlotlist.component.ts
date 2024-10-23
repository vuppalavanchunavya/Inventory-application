import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

interface Lot {
  childLot: string;
}

@Component({
  selector: 'app-childlotlist',
  templateUrl: './childlotlist.component.html',
  styleUrls: ['./childlotlist.component.scss'],
})
export class ChildlotlistComponent implements OnInit {
  @Input() childLots: Lot[] = [];
  filteredChildLots: Lot[] = [];

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    console.log('Received child lots:', this.childLots);
    this.filteredChildLots = [...this.childLots]; 
  }

  filterChildLots(event: { query: string; key: string }) {
    const searchTerm = event.query?.toLowerCase();
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredChildLots = [...this.childLots];
    } else {
      this.filteredChildLots = this.childLots.filter(lot =>
        lot.childLot?.toLowerCase().includes(searchTerm)
      );
    }
  }

  selectChildLot(childLot: Lot) {
    this.modalController.dismiss({ selectedChildLot: childLot });
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
