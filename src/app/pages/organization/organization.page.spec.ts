import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganizationPage } from './organization.page';

describe('OrganizationPage', () => {
  let component: OrganizationPage;
  let fixture: ComponentFixture<OrganizationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
