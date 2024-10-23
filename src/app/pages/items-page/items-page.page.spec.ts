import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemsPage } from './items-page.page';

describe('ItemsPagePage', () => {
  let component: ItemsPage;
  let fixture: ComponentFixture<ItemsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});