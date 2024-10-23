import { Component, Input ,OnInit} from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-subinventorylist',
  templateUrl: './subinventorylist.component.html',
  styleUrls: ['./subinventorylist.component.scss'],
})
export class SubinventorylistComponent implements OnInit {
  @Input() subInventories: any[] = [];
  filteredSubInventories: any[] = [];

  constructor(private modalController: ModalController) {
    
    this.filteredSubInventories = this.subInventories;
  }

  ngOnInit() {
    
    this.filteredSubInventories = this.subInventories;
  }

  onSearch(query: string) {
    this.filteredSubInventories = this.filterSubInventories(query);
  }

  filterSubInventories(query: string): any[] {
    if (!query) {
      return this.subInventories; 
    }
    return this.subInventories.filter(subInventory => {
      const subInventoryCode = String(subInventory.SubInventoryCode); 
      return subInventoryCode.toLowerCase().includes(query.toLowerCase());
    });
  }

  selectSubInventory(subInventory: any) {
    this.modalController.dismiss({
      selectedSubInventory: subInventory
    });
  }

  dismissModal() {
    this.modalController.dismiss();
  }
}
