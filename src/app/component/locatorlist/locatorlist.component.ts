import { Component, Input,OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-locatorlist',
  templateUrl: './locatorlist.component.html',
  styleUrls: ['./locatorlist.component.scss'],
})
export class LocatorlistComponent implements OnInit {
  @Input() locators: any[] = [];
  searchQuery: string = '';
  filteredLocators: any[] = [];

  constructor(private modalController: ModalController) {
    this.filteredLocators = this.locators;
  }

  ngOnInit() {
    this.filteredLocators = this.locators;
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.filteredLocators = this.filterLocators(query);
  }

  filterLocators(query: string): any[] {
    if (!query) {
      return this.locators; 
    }
    return this.locators.filter(locator => {
      const locatorId = String(locator.LocatorId); 
      return locatorId.toLowerCase().includes(query.toLowerCase());
    });
  }

  selectLocator(locator: any) {
    console.log('Locator selected:', locator);
    this.modalController.dismiss({
      selectedLocator: locator
    });
  }

  dismissModal() {
    this.modalController.dismiss();
  }
}
