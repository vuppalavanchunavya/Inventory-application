import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  @Input() placeholder: string = 'Search';
  @Input() searchKey: string = 'name'; 
  @Output() search = new EventEmitter<{ query: string; key: string }>();

  searchQuery: string = '';

  onSearch() {
    this.search.emit({ query: this.searchQuery, key: this.searchKey });
  }
}
