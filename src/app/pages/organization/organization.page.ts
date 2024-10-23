import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import { ToastController } from '@ionic/angular';
import { NetworkService } from 'src/app/services/network.service';
import { ApiService } from 'src/app/services/api.service';
import { Storage } from '@ionic/storage-angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-organization',
  templateUrl: 'organization.page.html',
  styleUrls: ['organization.page.scss'],
})
export class OrganizationPage implements OnInit {
  organizations: any[] = [];
  filteredOrganizations: any[] = [];
  selectedOrganization: any = null;
  isOnline: boolean = true;
  defOrgCode: string = '';
orgId:any;
  constructor(
    private databaseService: DatabaseService,
    private toastController: ToastController,
    private networkService: NetworkService,
    private apiService: ApiService,
    private router: Router,
    private storage: Storage
  ) {}
  
   ngOnInit() {
    this.initializeNetworkStatus();  
    this.loadOrganizations();
    this.getUserResponsibilities();
    this.getUserDetails();
    
  }

  private async initializeNetworkStatus() {
    this.isOnline = await this.networkService.isOnline();

    this.networkService.onNetworkChange((isOnline: boolean) => {
      this.isOnline = isOnline;
      if (!isOnline) {
        this.presentToast('You are offline. Some functionalities may be unavailable.', 'danger');
      }
    });
  }

  private async loadOrganizations() {
    if (this.isOnline) {
      await this.loadOrganizationsFromApi();
    } else {
      await this.loadOrganizationsFromDatabase();
    }
  }

  
  private async loadOrganizationsFromApi() {
    if (!this.isOnline) {
      await this.presentToast('You are offline. Unable to get organizations.', 'danger');
      return;
    }
  
    try {
      await this.handleMetadataResponse();
      await this.handleOrganizationsResponse();
    } catch (error) {
      console.error('Unexpected error while getting data:', error);
      await this.presentToast('Failed to get data from API', 'danger');
    }
  }
  
  private async handleMetadataResponse() {
    try {
      const metadataResponse = await firstValueFrom(this.apiService.getInventoryOrganizationsMetadata());
      console.log('Metadata Response:', metadataResponse);
  
      await this.databaseService.createTableFromMetadata('organizations', metadataResponse);
    } catch (error) {
      console.error('Error fetching metadata from API:', error);
      await this.presentToast('Failed to get metadata from API', 'danger');
    }
  }
  
  private async handleOrganizationsResponse() {
    try {
      const organizationsResponse = await firstValueFrom(this.apiService.getInventoryOrganizations(this.orgId));
      console.log('API Response:', organizationsResponse);
      const ActiveInventories = organizationsResponse?.ActiveInventories || [];
      console.log('Organization Data:', ActiveInventories);
      
      await this.databaseService.insertToTable('organizations', ActiveInventories);
  
      this.organizations = ActiveInventories;
      this.filteredOrganizations = [...this.organizations];
      console.log(this.filteredOrganizations);
    } catch (error) {
      console.error('Error fetching organizations from API:', error);
      await this.presentToast('Failed to get organization data from API', 'danger');
    }
  }
  
  private async loadOrganizationsFromDatabase() {
    try {
      this.organizations = await this.databaseService.getOrganizations();
      this.filteredOrganizations = [...this.organizations];
      console.log(this.filteredOrganizations);
    } catch (error) {
      console.error('Error loading organizations from database:', error);
      await this.presentToast('Failed to load organizations', 'danger');
    }
  }
  async getUserDetails(){
    const data=await this.storage.get("loginResponse")
    this.orgId=data[0].DEFAULT_ORG_ID;
  }

  async doRefresh(event: any) {
    try {
      await this.loadOrganizations();
    } catch (error) {
      console.error('Error during refresh:', error);
      await this.presentToast('Failed to refresh organizations', 'danger');
    }
    event.detail.complete(); 
  }

  onSearch(event: { query: string; key: string }) {
    const { query, key } = event;
    this.filteredOrganizations = this.organizations.filter(org => 
      org[key]?.toLowerCase().includes(query.toLowerCase())
    );
  }

  selectOrganization(org: any) {
    this.selectedOrganization = org;
  }

  async confirmSelection() {
    if (!this.selectedOrganization) {
      await this.presentToast('Please select an organization.', 'warning');
      return;
    }
    await this.storage.set('selectedorg', this.selectedOrganization); 
    console.log(this.selectedOrganization)
    localStorage.setItem('selectedorg', JSON.stringify(this.selectedOrganization.InventoryOrgId));
    this.router.navigate(['/activity']);
  }
  navigateBack() {
    this.router.navigate(['/dashboard']); 
  }
  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  async getUserResponsibilities(): Promise<string[]> {
    const updatedResponsibilities = this.includeAdditionalResponsibilities([]);
    await this.storage.set('responsibility', updatedResponsibilities);
    return updatedResponsibilities;
  }
   
  private includeAdditionalResponsibilities(responsibilities: string[]): string[] {
    const additionalResponsibilities = ['Locations','lots','qualityCodes','Docsforreceiving','reasons','inventoryPeriods',
      'assets','Serials','Locators','Subinventories','ItemCrossReferences','Employees'
    ];
    return additionalResponsibilities;
  }
}
