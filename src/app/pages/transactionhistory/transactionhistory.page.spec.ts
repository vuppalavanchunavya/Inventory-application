import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionhistoryPage } from './transactionhistory.page';

describe('TransactionhistoryPage', () => {
  let component: TransactionhistoryPage;
  let fixture: ComponentFixture<TransactionhistoryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionhistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
